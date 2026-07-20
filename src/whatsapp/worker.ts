import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import qrcode from 'qrcode';
import qrcodeTerminal from 'qrcode-terminal';
import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import { db } from '@/lib/db';
import { initializeSwissEphemeris } from '@/lib/astrology';
import { processAuthenticatedOnboarding } from '@/lib/onboarding-service';
import { generateWhatsappGuidance } from '@/lib/whatsapp/guidance';
import {
  ensureAppUserForWhatsapp,
  findDueFollowUpJobs,
  getOrCreateConversation,
  getOrCreateWhatsappUser,
  hasOptedOut,
  markConsent,
  normalizeWhatsappPhone,
  parseConversationContext,
  saveProfileAnswer,
  scheduleFollowUps,
  storeIncomingMessage,
  storeOutgoingMessage,
  type WhatsappConversationContext,
  updateWhatsappMessageStatus,
  updateConversation,
} from '@/lib/whatsapp/repository';
import { resolveIndianCity } from '@/lib/locations';
import { createWhatsappKundaliPdf } from '@/lib/reports/whatsapp-kundali-pdf';

type WhatsAppState =
  | 'WELCOME'
  | 'COLLECT_NAME'
  | 'COLLECT_DOB'
  | 'COLLECT_TIME'
  | 'COLLECT_PLACE'
  | 'GENERATE_KUNDALI'
  | 'PROFILE_DISCOVERY'
  | 'GUIDANCE'
  | 'closed';

const BUSINESS_NUMBER = normalizeWhatsappPhone(process.env.WHATSAPP_BUSINESS_NUMBER || '9532013475');
const FALLBACK_PDF_NAME = 'ayuastro-kundali.pdf';
const QR_OUTPUT_DIR = path.join(process.cwd(), 'scratch', 'whatsapp');
const QR_OUTPUT_FILE = path.join(QR_OUTPUT_DIR, 'whatsapp-login-qr.png');
let reconnectTimer: NodeJS.Timeout | null = null;
const QUESTION_FLOW = [
  { id: 'career_status', question: 'What best describes your career right now?', category: 'relational' },
  { id: 'main_goal', question: 'What is the main goal you want to focus on right now?', category: 'behavioral' },
  { id: 'main_challenge', question: 'What is the biggest challenge blocking you right now?', category: 'behavioral' },
  { id: 'relationship_status', question: 'What is your current relationship status?', category: 'relational' },
  { id: 'money_focus', question: 'What does money mean to you in this season of life?', category: 'behavioral' },
  { id: 'health_focus', question: 'What area of your wellbeing needs the most attention?', category: 'behavioral' },
];

function nowIso() {
  return new Date().toISOString();
}

function cleanText(text: string | null | undefined): string {
  return (text || '').trim();
}

function isKundaliIntent(message: string): boolean {
  return /\b(generate|show|get|create).*(kundali|birth chart|chart)|\bkundali\b/i.test(message) ||
    /\bmy chart\b/i.test(message);
}

function isStopIntent(message: string): boolean {
  return /\b(stop|unsubscribe|opt ?out|dont message|don't message|no more)\b/i.test(message);
}

function isStartIntent(message: string): boolean {
  return /\b(start|resume|subscribe|opt ?in|yes)\b/i.test(message);
}

function extractDob(message: string): string | null {
  const text = message.trim();
  const iso = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (iso) return iso[1];

  const slash = text.match(/\b(\d{2}[/-]\d{2}[/-]\d{4})\b/);
  if (slash) {
    const [d, m, y] = slash[1].split(/[/-]/);
    return `${y}-${m}-${d}`;
  }

  return null;
}

function extractTime(message: string): string | null {
  const match = message.trim().match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = match[2] ? Number(match[2]) : 0;
  const period = match[3]?.toLowerCase();
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  if (period === 'pm' && hours < 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;
  if (hours > 23 || minutes > 59) return null;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function extractName(message: string): string {
  return message.replace(/^my name is\s+/i, '').replace(/^i am\s+/i, '').replace(/^i'm\s+/i, '').trim();
}

function stateFromMessageBody(body: string, currentState: WhatsAppState): WhatsAppState {
  if (currentState === 'WELCOME' && isKundaliIntent(body)) return 'COLLECT_NAME';
  if (currentState === 'WELCOME') return 'WELCOME';
  return currentState;
}

function nextQuestionForState(state: WhatsAppState): string {
  switch (state) {
    case 'WELCOME':
      return 'Send "Generate my Kundali" to begin. I will ask for your name, birth date, time, and place one step at a time.';
    case 'COLLECT_NAME':
      return 'What name should I use for your Kundali?';
    case 'COLLECT_DOB':
      return 'What is your date of birth? Please send it as YYYY-MM-DD if possible.';
    case 'COLLECT_TIME':
      return 'What is your birth time? Send HH:MM if you know it.';
    case 'COLLECT_PLACE':
      return 'What is your birth place? City and country are enough.';
    case 'PROFILE_DISCOVERY':
      return QUESTION_FLOW[0].question;
    case 'GUIDANCE':
      return 'Ask me anything about your chart, career, relationship, money, or timing.';
    default:
      return 'Send "Generate my Kundali" to begin.';
  }
}

async function resolveRecipientChatId(client: Client, to: string, fallbackChatId?: string): Promise<string> {
  if (fallbackChatId) return fallbackChatId;

  const normalized = normalizeWhatsappPhone(to);
  try {
    const numberId = await client.getNumberId(normalized);
    if (numberId?._serialized) return numberId._serialized;
  } catch (error) {
    console.warn('[WhatsApp] Failed to resolve number id, falling back to c.us jid:', error);
  }

  return `${normalized}@c.us`;
}

async function sendText(client: Client, input: {
  whatsappUserId: string;
  conversationId: string;
  to: string;
  chatId?: string;
  body: string;
}) {
  try {
    const recipient = await resolveRecipientChatId(client, input.to, input.chatId);
    const sent = await client.sendMessage(recipient, input.body);
    return await storeOutgoingMessage({
      whatsappUserId: input.whatsappUserId,
      conversationId: input.conversationId,
      fromNumber: BUSINESS_NUMBER,
      toNumber: input.to,
      body: input.body,
      status: 'sent',
      whatsappMessageId: sent.id?._serialized || null,
    });
  } catch (error) {
    await storeOutgoingMessage({
      whatsappUserId: input.whatsappUserId,
      conversationId: input.conversationId,
      fromNumber: BUSINESS_NUMBER,
      toNumber: input.to,
      body: input.body,
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

async function sendPdf(client: Client, input: {
  whatsappUserId: string;
  conversationId: string;
  to: string;
  chatId?: string;
  pdfBuffer: Buffer;
  filename: string;
}) {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ayuastro-whatsapp-'));
  const filePath = path.join(tmpDir, input.filename);
  await fs.writeFile(filePath, input.pdfBuffer);

  try {
    const media = MessageMedia.fromFilePath(filePath);
    const recipient = await resolveRecipientChatId(client, input.to, input.chatId);
    const sent = await client.sendMessage(recipient, media, { caption: 'Your free AyuAstro Kundali PDF is ready.' });
    await storeOutgoingMessage({
      whatsappUserId: input.whatsappUserId,
      conversationId: input.conversationId,
      fromNumber: BUSINESS_NUMBER,
      toNumber: input.to,
      body: 'Sent PDF: Your free AyuAstro Kundali PDF is ready.',
      mediaUrl: input.filename,
      status: 'sent',
      whatsappMessageId: sent.id?._serialized || null,
    });
  } catch (error) {
    await storeOutgoingMessage({
      whatsappUserId: input.whatsappUserId,
      conversationId: input.conversationId,
      fromNumber: BUSINESS_NUMBER,
      toNumber: input.to,
      body: 'Sent PDF: Your free AyuAstro Kundali PDF is ready.',
      mediaUrl: input.filename,
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    throw error;
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

async function generateFreeKundali(input: {
  appUserId: string;
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  latitude: number;
  longitude: number;
  timezone: number;
}) {
  const result = await processAuthenticatedOnboarding(
    input.appUserId,
    {
      name: input.name,
      dateOfBirth: input.dateOfBirth,
      timeOfBirth: input.timeOfBirth,
      placeOfBirth: input.placeOfBirth,
      latitude: input.latitude,
      longitude: input.longitude,
      timezone: input.timezone,
      questionnaireAnswers: [],
      freeOnly: true,
      reportType: 'personality',
    },
    { generateAiReport: false }
  );

  return result;
}

async function handleProfileDiscovery(client: Client, params: {
  whatsappUserId: string;
  conversationId: string;
  phoneNumber: string;
  chatId?: string;
  appUserId: string;
  incomingBody: string;
  conversationContext: WhatsappConversationContext;
}) {
  const currentIndex = Number(params.conversationContext.lastQuestionIndex || 0);
  const question = QUESTION_FLOW[currentIndex];
  if (!question) {
    await updateConversation({
      conversationId: params.conversationId,
      state: 'GUIDANCE',
      context: params.conversationContext,
    });
    const guidance = await generateWhatsappGuidance({
      whatsappUserId: params.whatsappUserId,
      appUserId: params.appUserId,
      userMessage: params.incomingBody,
    });
    await sendText(client, {
      whatsappUserId: params.whatsappUserId,
      conversationId: params.conversationId,
      to: params.phoneNumber,
      chatId: params.chatId,
      body: guidance,
    });
    return;
  }

  await saveProfileAnswer({
    appUserId: params.appUserId,
    questionId: question.id,
    answer: params.incomingBody,
    category: question.category,
  });

  const nextIndex = currentIndex + 1;
  const nextQuestion = QUESTION_FLOW[nextIndex];
  const nextContext = {
    ...params.conversationContext,
    lastQuestionIndex: nextIndex,
  };
  await updateConversation({
    conversationId: params.conversationId,
    state: nextQuestion ? 'PROFILE_DISCOVERY' : 'GUIDANCE',
      context: nextContext,
  });

  if (nextQuestion) {
    await sendText(client, {
      whatsappUserId: params.whatsappUserId,
      conversationId: params.conversationId,
      to: params.phoneNumber,
      chatId: params.chatId,
      body: nextQuestion.question,
    });
  } else {
    const guidance = await generateWhatsappGuidance({
      whatsappUserId: params.whatsappUserId,
      appUserId: params.appUserId,
      userMessage: params.incomingBody,
    });
    await sendText(client, {
      whatsappUserId: params.whatsappUserId,
      conversationId: params.conversationId,
      to: params.phoneNumber,
      chatId: params.chatId,
      body: guidance,
    });
  }
}

async function handleGenerateKundali(client: Client, params: {
  whatsappUserId: string;
  conversationId: string;
  phoneNumber: string;
  chatId?: string;
  context: WhatsappConversationContext;
}) {
  const name = cleanText(String(params.context.name || ''));
  const dateOfBirth = cleanText(String(params.context.dateOfBirth || ''));
  const timeOfBirth = cleanText(String(params.context.timeOfBirth || ''));
  const placeOfBirth = cleanText(String(params.context.placeOfBirth || ''));

  const place = resolveIndianCity(placeOfBirth);
  if (!place) {
    await updateConversation({
      conversationId: params.conversationId,
      state: 'COLLECT_PLACE',
      context: params.context,
    });
    await sendText(client, {
      whatsappUserId: params.whatsappUserId,
      conversationId: params.conversationId,
      to: params.phoneNumber,
      chatId: params.chatId,
      body: 'I could not recognize that place. Please send your birth city or town name again.',
    });
    return;
  }

  const appUserId = String(
    params.context.appUserId ||
      (await ensureAppUserForWhatsapp({
        whatsappUserId: params.whatsappUserId,
        phoneNumber: params.phoneNumber,
        name,
      }))
  );
  const freeResult = await generateFreeKundali({
    appUserId,
    name,
    dateOfBirth,
    timeOfBirth,
    placeOfBirth: place.placeOfBirth,
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: place.timezone,
  });

  const astrology = freeResult.data.astrology;
  const numerology = freeResult.data.numerology;
  const summary = freeResult.data.report?.summary ||
    `Your core pattern begins with ${astrology?.moonSign || 'your Moon sign'} and ${astrology?.ascendant || 'your Ascendant'}.`;

  const pdfBuffer = await createWhatsappKundaliPdf({
    name,
    dateOfBirth,
    timeOfBirth,
    placeOfBirth: place.placeOfBirth,
    sunSign: astrology?.sunSign,
    moonSign: astrology?.moonSign,
    ascendant: astrology?.ascendant,
    nakshatra: typeof astrology?.nakshatra === 'string' ? astrology.nakshatra : astrology?.nakshatra?.name,
    currentDasha:
      astrology?.dashaPeriods?.currentMahadasha
        ? `${astrology.dashaPeriods.currentMahadasha.planet}${
            astrology.dashaPeriods.currentAntardasha?.planet
              ? ` / ${astrology.dashaPeriods.currentAntardasha.planet}`
              : ''
          }`
        : undefined,
    yogas: Array.isArray(astrology?.yogas) ? astrology.yogas.map((y: { name?: string } | string) => (typeof y === 'string' ? y : y.name || '')).filter(Boolean) : [],
    doshas: Array.isArray(astrology?.doshas) ? astrology.doshas.map((d: { name?: string } | string) => (typeof d === 'string' ? d : d.name || '')).filter(Boolean) : [],
    summary,
  });

  await sendPdf(client, {
    whatsappUserId: params.whatsappUserId,
    conversationId: params.conversationId,
    to: params.phoneNumber,
    chatId: params.chatId,
    pdfBuffer,
    filename: FALLBACK_PDF_NAME,
  });

  const appUser = await db.user.findUnique({
    where: { id: appUserId },
    select: { phone: true },
  });
  if (appUser) {
    await scheduleFollowUps({
      whatsappUserId: params.whatsappUserId,
      conversationId: params.conversationId,
      appUserId,
    });
  }

  await updateConversation({
    conversationId: params.conversationId,
    state: 'PROFILE_DISCOVERY',
    context: {
      ...params.context,
      name,
      dateOfBirth,
      timeOfBirth,
      placeOfBirth: place.placeOfBirth,
      latitude: place.latitude,
      longitude: place.longitude,
      timezone: place.timezone,
      kundaliGeneratedAt: nowIso(),
      lastQuestionIndex: 0,
    },
  });

  await sendText(client, {
    whatsappUserId: params.whatsappUserId,
    conversationId: params.conversationId,
    to: params.phoneNumber,
    chatId: params.chatId,
    body: `Your free Kundali is ready, ${name}. I've sent the PDF. One quick question to make the guidance more personal: ${QUESTION_FLOW[0].question}`,
  });
}

async function processFollowUpJob(client: Client, job: Awaited<ReturnType<typeof findDueFollowUpJobs>>[number]) {
  if (!job.user || !job.conversation) return;
  if (await hasOptedOut(job.user.id)) {
    await db.whatsappJob.update({
      where: { id: job.id },
      data: { status: 'cancelled', completedAt: new Date() },
    });
    return;
  }

  const payload = typeof job.payload === 'string' ? JSON.parse(job.payload) : job.payload;
  const day = Number(payload.day || 1);
  const promptByDay: Record<number, string> = {
    1: 'How has your career situation felt since we last spoke?',
    3: 'Have you noticed any movement on the goal you mentioned?',
    7: 'What is one thing you understood about yourself after your Kundali?',
  };
  const body = promptByDay[day] || 'How are things moving for you this week?';

  await db.whatsappJob.update({
    where: { id: job.id },
    data: { status: 'processing', startedAt: new Date() },
  });

  await sendText(client, {
    whatsappUserId: job.user.id,
    conversationId: job.conversation.id,
    to: job.user.phoneNumber,
    body,
  });

  await db.whatsappJob.update({
    where: { id: job.id },
    data: { status: 'completed', completedAt: new Date() },
  });
}

async function handleIncomingMessage(client: Client, message: { from: string; body: string; id: { _serialized: string }; timestamp?: number; to?: string; notifyName?: string; fromMe?: boolean }) {
  if (message.fromMe) return;
  if (message.from.endsWith('@g.us')) return;

  const phoneNumber = normalizeWhatsappPhone(message.from);
  const displayName = message.notifyName || null;
  const whatsappUser = await getOrCreateWhatsappUser({
    phoneNumber,
    waId: phoneNumber,
    displayName,
  });
  const conversation = await getOrCreateConversation(whatsappUser.id);
  const context = parseConversationContext(conversation.context);

  await storeIncomingMessage({
    whatsappUserId: whatsappUser.id,
    conversationId: conversation.id,
    fromNumber: phoneNumber,
    toNumber: BUSINESS_NUMBER,
    body: message.body,
    whatsappMessageId: message.id?._serialized,
    rawPayload: {
      id: message.id?._serialized,
      from: message.from,
      to: message.to,
      body: message.body,
      timestamp: message.timestamp,
      notifyName: message.notifyName,
    },
  });

  if (isStopIntent(message.body)) {
    await markConsent({
      whatsappUserId: whatsappUser.id,
      status: 'opted_out',
      source: 'inbound_message',
      reason: 'User asked to stop messages',
    });
    await updateConversation({
      conversationId: conversation.id,
      state: 'closed',
      context,
    });
    await sendText(client, {
      whatsappUserId: whatsappUser.id,
      conversationId: conversation.id,
      to: phoneNumber,
      chatId: message.from,
      body: 'You’re opted out. I will stop WhatsApp messages from AyuAstro.',
    });
    return;
  }

  if (isStartIntent(message.body)) {
    await markConsent({
      whatsappUserId: whatsappUser.id,
      status: 'opted_in',
      source: 'inbound_message',
      reason: 'User opted back in',
    });
  }

  const state = (conversation.state as WhatsAppState) || 'WELCOME';
  const nextState = stateFromMessageBody(message.body, state);

  if (nextState === 'WELCOME') {
    await updateConversation({
      conversationId: conversation.id,
      state: 'WELCOME',
      context,
    });
    await sendText(client, {
      whatsappUserId: whatsappUser.id,
      conversationId: conversation.id,
      to: phoneNumber,
      chatId: message.from,
      body: nextQuestionForState('WELCOME'),
    });
    return;
  }

  if (nextState === 'COLLECT_NAME') {
    const name = extractName(message.body);
    const updatedContext = { ...context, name };
    const appUserId = await ensureAppUserForWhatsapp({
      whatsappUserId: whatsappUser.id,
      phoneNumber,
      name,
    });
    await updateConversation({
      conversationId: conversation.id,
      state: 'COLLECT_DOB',
      context: { ...updatedContext, appUserId },
    });
    await sendText(client, {
      whatsappUserId: whatsappUser.id,
      conversationId: conversation.id,
      to: phoneNumber,
      chatId: message.from,
      body: nextQuestionForState('COLLECT_DOB'),
    });
    return;
  }

  if (state === 'COLLECT_DOB') {
    const dob = extractDob(message.body);
    if (!dob) {
      await sendText(client, {
        whatsappUserId: whatsappUser.id,
        conversationId: conversation.id,
        to: phoneNumber,
        chatId: message.from,
        body: 'Please resend your date of birth in YYYY-MM-DD format.',
      });
      return;
    }
    await updateConversation({
      conversationId: conversation.id,
      state: 'COLLECT_TIME',
      context: { ...context, dateOfBirth: dob },
    });
    await sendText(client, {
      whatsappUserId: whatsappUser.id,
      conversationId: conversation.id,
      to: phoneNumber,
      chatId: message.from,
      body: nextQuestionForState('COLLECT_TIME'),
    });
    return;
  }

  if (state === 'COLLECT_TIME') {
    const time = extractTime(message.body);
    if (!time) {
      await sendText(client, {
        whatsappUserId: whatsappUser.id,
        conversationId: conversation.id,
        to: phoneNumber,
        chatId: message.from,
        body: 'Please resend your birth time in HH:MM format.',
      });
      return;
    }
    await updateConversation({
      conversationId: conversation.id,
      state: 'COLLECT_PLACE',
      context: { ...context, timeOfBirth: time },
    });
    await sendText(client, {
      whatsappUserId: whatsappUser.id,
      conversationId: conversation.id,
      to: phoneNumber,
      chatId: message.from,
      body: nextQuestionForState('COLLECT_PLACE'),
    });
    return;
  }

  if (state === 'COLLECT_PLACE') {
    const cleaned = cleanText(message.body);
    const place = resolveIndianCity(cleaned);
    if (!place) {
      await sendText(client, {
        whatsappUserId: whatsappUser.id,
        conversationId: conversation.id,
        to: phoneNumber,
        chatId: message.from,
        body: 'Please send your birth city again. I need a recognizable city name to calculate the chart.',
      });
      return;
    }
    await updateConversation({
      conversationId: conversation.id,
      state: 'GENERATE_KUNDALI',
      context: {
        ...context,
        placeOfBirth: place.placeOfBirth,
        latitude: place.latitude,
        longitude: place.longitude,
        timezone: place.timezone,
      },
    });
    await handleGenerateKundali(client, {
      whatsappUserId: whatsappUser.id,
      conversationId: conversation.id,
      phoneNumber,
      chatId: message.from,
      context: {
        ...context,
        placeOfBirth: place.placeOfBirth,
        latitude: place.latitude,
        longitude: place.longitude,
        timezone: place.timezone,
      },
    });
    return;
  }

  if (state === 'PROFILE_DISCOVERY') {
    const appUserId = String(context.appUserId || (await ensureAppUserForWhatsapp({
      whatsappUserId: whatsappUser.id,
      phoneNumber,
      name: String(context.name || ''),
    })));
    await handleProfileDiscovery(client, {
      whatsappUserId: whatsappUser.id,
      conversationId: conversation.id,
      phoneNumber,
      chatId: message.from,
      appUserId,
      incomingBody: message.body,
      conversationContext: context,
    });
    return;
  }

  if (state === 'GENERATE_KUNDALI') {
    await handleGenerateKundali(client, {
      whatsappUserId: whatsappUser.id,
      conversationId: conversation.id,
      phoneNumber,
      chatId: message.from,
      context,
    });
    return;
  }

  const appUserId = String(context.appUserId || (await ensureAppUserForWhatsapp({
    whatsappUserId: whatsappUser.id,
    phoneNumber,
    name: String(context.name || ''),
  })));
  const guidance = await generateWhatsappGuidance({
    whatsappUserId: whatsappUser.id,
    appUserId,
    userMessage: message.body,
  });
  await updateConversation({
    conversationId: conversation.id,
    state: 'GUIDANCE',
    context: { ...context, appUserId },
  });
  await sendText(client, {
    whatsappUserId: whatsappUser.id,
    conversationId: conversation.id,
    to: phoneNumber,
    body: guidance,
  });
}

async function runFollowUpScheduler(client: Client) {
  try {
    const jobs = await findDueFollowUpJobs(10);
    for (const job of jobs) {
      try {
        await processFollowUpJob(client, job);
      } catch (error) {
        console.error('[WhatsApp Worker] Follow-up job failed:', job.id, error);
        try {
          await db.whatsappJob.update({
            where: { id: job.id },
            data: {
              status: 'failed',
              errorMessage: error instanceof Error ? error.message : String(error),
              failedAt: new Date(),
            },
          });
        } catch (dbError) {
          console.error('[WhatsApp Worker] Could not mark failed follow-up job:', dbError);
        }
      }
    }
  } catch (error) {
    console.error('[WhatsApp Worker] Follow-up scheduler skipped due to database error:', error);
  }
}

async function bootstrap() {
  await initializeSwissEphemeris();

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'ayuastro-whatsapp' }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  });

  client.on('qr', (qr) => {
    console.log('[WhatsApp] QR ready, scan this code to log in:');
    qrcodeTerminal.generate(qr, { small: true });
    void (async () => {
      try {
        await fs.mkdir(QR_OUTPUT_DIR, { recursive: true });
        await qrcode.toFile(QR_OUTPUT_FILE, qr, {
          errorCorrectionLevel: 'M',
          margin: 2,
          width: 512,
        });
        console.log(`[WhatsApp] QR image saved to ${QR_OUTPUT_FILE}`);
      } catch (error) {
        console.error('[WhatsApp] Failed to write QR image:', error);
      }
    })();
  });

  client.on('ready', async () => {
    console.log('[WhatsApp] Client ready at', nowIso());
  });

  client.on('auth_failure', (message) => {
    console.error('[WhatsApp] Authentication failed:', message);
  });

  client.on('disconnected', (reason) => {
    console.error('[WhatsApp] Disconnected:', reason);
    if (!reconnectTimer) {
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        void bootstrap().catch((error) => {
          console.error('[WhatsApp] Reconnect bootstrap failed:', error);
        });
      }, 5000);
    }
  });

  client.on('message', async (message) => {
    try {
      await handleIncomingMessage(client, message as any);
    } catch (error) {
      console.error('[WhatsApp] Failed to process message:', error);
    }
  });

  client.on('message_ack', async (message, ack) => {
    const statusMap: Record<number, string> = {
      [-1]: 'failed',
      [0]: 'queued',
      [1]: 'sent',
      [2]: 'delivered',
      [3]: 'read',
      [4]: 'read',
    };

    try {
      await updateWhatsappMessageStatus({
        whatsappMessageId: message.id?._serialized,
        status: statusMap[Number(ack)] || 'sent',
        deliveredAt: Number(ack) >= 2 ? new Date() : null,
        readAt: Number(ack) >= 3 ? new Date() : null,
      });
    } catch (error) {
      console.error('[WhatsApp] Failed to update status for ack:', error);
    }
  });

  await client.initialize();

  setInterval(() => {
    void runFollowUpScheduler(client);
  }, 60_000);
}

bootstrap().catch((error) => {
  console.error('[WhatsApp Worker] Fatal error:', error);
  process.exitCode = 1;
});

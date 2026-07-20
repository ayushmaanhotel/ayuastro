import { db } from '@/lib/db';

export type WhatsappConversationState =
  | 'WELCOME'
  | 'COLLECT_NAME'
  | 'COLLECT_DOB'
  | 'COLLECT_TIME'
  | 'COLLECT_PLACE'
  | 'GENERATE_KUNDALI'
  | 'PROFILE_DISCOVERY'
  | 'GUIDANCE'
  | 'closed';

export interface WhatsappConversationContext {
  [key: string]: unknown;
  name?: string;
  dateOfBirth?: string;
  timeOfBirth?: string;
  placeOfBirth?: string;
  latitude?: number;
  longitude?: number;
  timezone?: number;
  appUserId?: string;
  lastQuestionId?: string;
  lastQuestionIndex?: number;
  profileAnswers?: Record<string, string>;
  kundaliGeneratedAt?: string;
  pdfSentAt?: string;
}

export function parseConversationContext(raw: string | null): WhatsappConversationContext {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function normalizeWhatsappPhone(raw: string): string {
  return raw.replace('@c.us', '').replace('@s.whatsapp.net', '').replace(/[^\d+]/g, '');
}

export async function getOrCreateWhatsappUser(input: {
  phoneNumber: string;
  waId?: string | null;
  displayName?: string | null;
}) {
  const phoneNumber = normalizeWhatsappPhone(input.phoneNumber);
  try {
    return await db.whatsappUser.upsert({
      where: { phoneNumber },
      update: {
        waId: input.waId || undefined,
        displayName: input.displayName || undefined,
        lastInboundAt: new Date(),
      },
      create: {
        phoneNumber,
        waId: input.waId || null,
        displayName: input.displayName || null,
        lastInboundAt: new Date(),
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      'code' in error &&
      (error as { code?: string }).code === 'P2002'
    ) {
      const existing = await db.whatsappUser.findUnique({ where: { phoneNumber } });
      if (existing) {
        return db.whatsappUser.update({
          where: { id: existing.id },
          data: {
            waId: input.waId || existing.waId,
            displayName: input.displayName || existing.displayName,
            lastInboundAt: new Date(),
          },
        });
      }
    }
    throw error;
  }
}

export async function getOrCreateConversation(whatsappUserId: string) {
  const active = await db.whatsappConversation.findFirst({
    where: {
      userId: whatsappUserId,
      state: { notIn: ['closed', 'archived'] },
    },
    orderBy: { updatedAt: 'desc' },
  });

  if (active) return active;

  return db.whatsappConversation.create({
    data: {
      userId: whatsappUserId,
      state: 'WELCOME',
      context: '{}',
      lastMessageAt: new Date(),
    },
  });
}

export async function updateConversation(input: {
  conversationId: string;
  state?: WhatsappConversationState;
  context?: WhatsappConversationContext;
}) {
  return db.whatsappConversation.update({
    where: { id: input.conversationId },
    data: {
      ...(input.state ? { state: input.state } : {}),
      ...(input.context ? { context: JSON.stringify(input.context) } : {}),
      lastMessageAt: new Date(),
    },
  });
}

export async function storeIncomingMessage(input: {
  whatsappUserId: string;
  conversationId: string;
  fromNumber: string;
  toNumber: string;
  body?: string | null;
  whatsappMessageId?: string | null;
  rawPayload?: unknown;
}) {
  return db.whatsappMessage.create({
    data: {
      userId: input.whatsappUserId,
      conversationId: input.conversationId,
      direction: 'incoming',
      status: 'received',
      fromNumber: normalizeWhatsappPhone(input.fromNumber),
      toNumber: normalizeWhatsappPhone(input.toNumber),
      whatsappMessageId: input.whatsappMessageId || null,
      messageType: 'text',
      body: input.body || null,
      rawPayload: input.rawPayload ? JSON.stringify(input.rawPayload) : null,
    },
  });
}

export async function storeOutgoingMessage(input: {
  whatsappUserId: string;
  conversationId: string;
  fromNumber: string;
  toNumber: string;
  body?: string | null;
  mediaUrl?: string | null;
  status?: string;
  whatsappMessageId?: string | null;
  errorMessage?: string | null;
}) {
  const now = new Date();
  await db.whatsappUser.update({
    where: { id: input.whatsappUserId },
    data: { lastOutboundAt: now },
  });

  return db.whatsappMessage.create({
    data: {
      userId: input.whatsappUserId,
      conversationId: input.conversationId,
      direction: 'outgoing',
      status: input.status || 'sent',
      fromNumber: normalizeWhatsappPhone(input.fromNumber),
      toNumber: normalizeWhatsappPhone(input.toNumber),
      whatsappMessageId: input.whatsappMessageId || null,
      messageType: input.mediaUrl ? 'document' : 'text',
      body: input.body || null,
      mediaUrl: input.mediaUrl || null,
      errorMessage: input.errorMessage || null,
      sentAt: now,
      ...(input.status === 'failed' ? { failedAt: now } : {}),
    },
  });
}

export async function updateWhatsappMessageStatus(input: {
  whatsappMessageId: string;
  status: string;
  deliveredAt?: Date | null;
  readAt?: Date | null;
}) {
  return db.whatsappMessage.updateMany({
    where: { whatsappMessageId: input.whatsappMessageId },
    data: {
      status: input.status,
      ...(input.deliveredAt ? { deliveredAt: input.deliveredAt } : {}),
      ...(input.readAt ? { readAt: input.readAt } : {}),
    },
  });
}

export async function ensureAppUserForWhatsapp(input: {
  whatsappUserId: string;
  phoneNumber: string;
  name?: string;
}) {
  const whatsappUser = await db.whatsappUser.findUnique({ where: { id: input.whatsappUserId } });
  if (whatsappUser?.appUserId) {
    if (input.name) {
      await db.user.update({
        where: { id: whatsappUser.appUserId },
        data: { name: input.name },
      });
    }
    return whatsappUser.appUserId;
  }

  const user = await db.user.upsert({
    where: { phone: normalizeWhatsappPhone(input.phoneNumber) },
    update: {
      ...(input.name ? { name: input.name } : {}),
    },
    create: {
      phone: normalizeWhatsappPhone(input.phoneNumber),
      name: input.name || null,
      isOnboarded: false,
      preferences: {
        create: {
          language: 'en',
          vedicLevel: 'standard',
        },
      },
    },
  });

  await db.whatsappUser.update({
    where: { id: input.whatsappUserId },
    data: { appUserId: user.id },
  });

  return user.id;
}

export async function saveProfileAnswer(input: {
  appUserId: string;
  questionId: string;
  answer: string;
  category?: string;
}) {
  await db.questionnaireAnswer.deleteMany({
    where: {
      userId: input.appUserId,
      questionId: input.questionId,
    },
  });

  return db.questionnaireAnswer.create({
    data: {
      userId: input.appUserId,
      questionId: input.questionId,
      answer: input.answer,
      category: input.category || 'behavioral',
    },
  });
}

export async function markConsent(input: {
  whatsappUserId: string;
  status: 'opted_in' | 'opted_out' | 'unknown';
  source: string;
  reason?: string;
}) {
  return db.whatsappConsent.create({
    data: {
      userId: input.whatsappUserId,
      status: input.status,
      source: input.source,
      reason: input.reason || null,
      consentedAt: input.status === 'opted_in' ? new Date() : null,
      revokedAt: input.status === 'opted_out' ? new Date() : null,
    },
  });
}

export async function hasOptedOut(whatsappUserId: string): Promise<boolean> {
  const latest = await db.whatsappConsent.findFirst({
    where: { userId: whatsappUserId },
    orderBy: { createdAt: 'desc' },
  });
  return latest?.status === 'opted_out';
}

export async function getRecentConversationMessages(whatsappUserId: string, limit = 20) {
  return db.whatsappMessage.findMany({
    where: { userId: whatsappUserId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function scheduleFollowUps(input: {
  whatsappUserId: string;
  conversationId: string;
  appUserId: string;
}) {
  const days = [1, 3, 7];
  const now = Date.now();

  await db.whatsappJob.createMany({
    data: days.map((day) => ({
      userId: input.whatsappUserId,
      conversationId: input.conversationId,
      type: 'follow_up',
      status: 'pending',
      payload: JSON.stringify({ day, appUserId: input.appUserId }),
      scheduledAt: new Date(now + day * 24 * 60 * 60 * 1000),
    })),
  });
}

export async function findDueFollowUpJobs(limit = 10) {
  return db.whatsappJob.findMany({
    where: {
      type: 'follow_up',
      status: 'pending',
      scheduledAt: { lte: new Date() },
    },
    include: {
      user: true,
      conversation: true,
    },
    orderBy: [{ priority: 'desc' }, { scheduledAt: 'asc' }],
    take: limit,
  });
}

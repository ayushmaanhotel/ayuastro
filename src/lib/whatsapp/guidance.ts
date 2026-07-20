import deepseek from '@/lib/ai/deepseek';
import { pickAstrologerDomain } from '@/lib/astrologers';
import { db } from '@/lib/db';
import { getRecentConversationMessages } from '@/lib/whatsapp/repository';

function safeJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function compactList(values: unknown[]): string {
  return values
    .map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object' && 'name' in item) return String((item as { name?: unknown }).name || '');
      return '';
    })
    .filter(Boolean)
    .slice(0, 8)
    .join(', ');
}

export async function generateWhatsappGuidance(input: {
  whatsappUserId: string;
  appUserId: string;
  userMessage: string;
}): Promise<string> {
  const astrologer = pickAstrologerDomain(input.userMessage);
  const [user, recentMessages] = await Promise.all([
    db.user.findUnique({
      where: { id: input.appUserId },
      include: {
        profile: true,
        astrology: true,
        numerology: true,
        traits: true,
        answers: {
          orderBy: { createdAt: 'desc' },
          take: 12,
        },
      },
    }),
    getRecentConversationMessages(input.whatsappUserId, 20),
  ]);

  if (!user) {
    return 'I could not find your saved Kundali yet. Send "Generate my Kundali" and I will start from your birth details.';
  }

  const nakshatra = safeJson<{ name?: string } | string>(user.astrology?.nakshatra, '');
  const dasha = safeJson<{ currentMahadasha?: { planet?: string }; currentAntardasha?: { planet?: string } }>(
    user.astrology?.dashaPeriods,
    {}
  );
  const yogas = compactList(safeJson<unknown[]>(user.astrology?.yogas, []));
  const doshas = compactList(safeJson<unknown[]>(user.astrology?.doshas, []));

  const dashaText = dasha.currentMahadasha
    ? `${dasha.currentMahadasha.planet || 'Unknown'} Mahadasha${
        dasha.currentAntardasha?.planet ? ` / ${dasha.currentAntardasha.planet} Antardasha` : ''
      }`
    : 'Unknown';

  const answerBlock = user.answers
    .map((answer) => `- ${answer.questionId}: ${answer.answer}`)
    .join('\n');

  const traits = user.traits
    ? [
        `ambition ${user.traits.ambition}`,
        `discipline ${user.traits.discipline}`,
        `trust ${user.traits.trust}`,
        `communication ${user.traits.communicationOpenness}`,
        `resilience ${user.traits.resilience}`,
        `empathy ${user.traits.empathy}`,
      ].join(', ')
    : 'No trait scores yet';

  const history = recentMessages
    .reverse()
    .map((message) => `${message.direction === 'incoming' ? 'User' : 'AyuAstro'}: ${message.body || '[media]'}`)
    .join('\n');

  const systemPrompt = `You are AyuAstro on WhatsApp. Your domain specialist for this message is ${astrologer.name}, ${astrologer.title}.

Domain tuning:
${astrologer.systemPrompt}

Brand truth:
- Be honest, simple, warm, and useful.
- Do not use fear to sell anything.
- Do not claim certainty. Use "pattern", "tendency", "possibility", or "better choice".
- Do not diagnose medical or mental health conditions.
- Do not give financial, medical, legal, or emergency advice.
- If the question is high stakes, suggest qualified professional support.
- Keep WhatsApp replies under 120 words.

Known user context:
- Name: ${user.name || 'Seeker'}
- Relationship status: ${user.profile?.relationshipStatus || 'Unknown'}
- Sun: ${user.astrology?.sunSign || 'Unknown'}
- Moon: ${user.astrology?.moonSign || 'Unknown'}
- Ascendant: ${user.astrology?.ascendant || 'Unknown'}
- Nakshatra: ${typeof nakshatra === 'string' ? nakshatra : nakshatra.name || 'Unknown'}
- Dasha: ${dashaText}
- Yogas: ${yogas || 'None recorded'}
- Doshas: ${doshas || 'None recorded'}
- Life path: ${user.numerology?.lifePathNumber || 'Unknown'}
- Traits: ${traits}

Stored profile answers:
${answerBlock || '- No profile answers yet'}

Recent WhatsApp context:
${history || '- No recent messages'}`;

  try {
    const response = await deepseek.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input.userMessage },
      ],
      thinking: { type: 'disabled' },
    });

    const text = response.choices?.[0]?.message?.content?.trim();
    if (text) return text;
  } catch (error) {
    console.error('[WhatsApp Guidance] DeepSeek error:', error);
  }

  return 'I have your chart context, but the AI service is quiet right now. For now: focus on one practical action you can take today, not a perfect prediction.';
}


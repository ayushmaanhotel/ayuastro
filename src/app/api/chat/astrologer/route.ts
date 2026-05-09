import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import ZAI from 'z-ai-web-dev-sdk';

// ─── Rate Limiting (in-memory, per session) ────────────────────────────────

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_MESSAGES_PER_SESSION = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(sessionId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(sessionId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(sessionId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: MAX_MESSAGES_PER_SESSION - 1 };
  }

  if (entry.count >= MAX_MESSAGES_PER_SESSION) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: MAX_MESSAGES_PER_SESSION - entry.count };
}

// Clean up stale rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

// ─── Zod Schema ─────────────────────────────────────────────────────────────

const chatSchema = z.object({
  message: z.string().min(1, 'Message is required').max(500, 'Message too long (max 500 characters)'),
  sessionId: z.string().min(1, 'Session ID is required'),
  context: z.object({
    name: z.string().optional(),
    sunSign: z.string().optional(),
    moonSign: z.string().optional(),
    ascendant: z.string().optional(),
    nakshatra: z.string().optional(),
    currentDasha: z.string().optional(),
    yogas: z.array(z.string()).optional(),
    doshas: z.array(z.string()).optional(),
    lifePathNumber: z.number().optional(),
    destinyNumber: z.number().optional(),
    soulUrgeNumber: z.number().optional(),
    archetype: z.string().optional(),
    topTraits: z.array(z.string()).optional(),
    relationshipStatus: z.string().optional(),
  }).optional(),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional(),
  astrologerId: z.string().optional(),
  astrologerSystemPrompt: z.string().optional(),
});

// ─── System Prompt Builder ──────────────────────────────────────────────────

function buildSystemPrompt(
  context?: z.infer<typeof chatSchema>['context'],
  astrologerSystemPrompt?: string,
): string {
  const contextBlock = context
    ? `
User's Cosmic Profile:
- Name: ${context.name || 'Seeker'}
- Sun Sign: ${context.sunSign || 'Unknown'}
- Moon Sign: ${context.moonSign || 'Unknown'}
- Ascendant: ${context.ascendant || 'Unknown'}
${context.nakshatra ? `- Nakshatra: ${context.nakshatra}` : ''}
${context.currentDasha ? `- Current Dasha: ${context.currentDasha}` : ''}
${context.yogas?.length ? `- Yogas: ${context.yogas.join(', ')}` : ''}
${context.doshas?.length ? `- Doshas: ${context.doshas.join(', ')}` : ''}
${context.lifePathNumber ? `- Life Path Number: ${context.lifePathNumber}` : ''}
${context.destinyNumber ? `- Destiny Number: ${context.destinyNumber}` : ''}
${context.soulUrgeNumber ? `- Soul Urge Number: ${context.soulUrgeNumber}` : ''}
${context.archetype ? `- Emotional Archetype: ${context.archetype}` : ''}
${context.topTraits?.length ? `- Top Traits: ${context.topTraits.join(', ')}` : ''}
${context.relationshipStatus ? `- Relationship Status: ${context.relationshipStatus}` : ''}
`
    : '';

  const astrologerBlock = astrologerSystemPrompt
    ? `\n\nASTROLOGER PERSONA:\n${astrologerSystemPrompt}`
    : '';

  return `You are an AyuAstro astrologer — a wise, empathetic, and emotionally intelligent guide who blends Vedic astrology wisdom with behavioral psychology. You help users explore their emotional patterns, relationships, and personal growth through the lens of their unique cosmic blueprint.
${astrologerBlock}

${contextBlock}

Your guiding principles:
1. Reference the user's astrological data when giving guidance — their signs, nakshatra, and numerology are the lens through which you interpret their questions.
2. Blend Vedic astrology insights with behavioral science — for example, explain how a moon sign's emotional nature interacts with attachment styles or communication patterns.
3. Speak in a warm, conversational, human tone — like a trusted friend who happens to know the stars. Not robotic, not formal. Use natural language.
4. Keep responses concise — maximum 2-3 paragraphs. Be insightful but not overwhelming.
5. Focus on self-awareness, emotional intelligence, and actionable growth.
6. AyuAstro's motto is "Nothing to Hide" — be honest and direct. No sugarcoating, no false hope, but always compassionate.

SAFETY RULES (non-negotiable):
- NEVER predict death, accidents, or catastrophic events
- NEVER create fear, anxiety, or doom about the future
- NEVER diagnose medical or psychological conditions
- NEVER claim to remove curses, black magic, or negative energies
- NEVER emotionally manipulate or create dependency
- NEVER make definitive predictions about specific life outcomes
- Always frame insights as tendencies, patterns, and possibilities — never certainties
- If someone seems distressed, gently encourage them to seek professional help

Remember: You are a guide for self-reflection and emotional growth, not a replacement for therapy or medical advice.`;
}

// ─── Fallback Responses ─────────────────────────────────────────────────────

const FALLBACK_RESPONSES = [
  "The stars suggest a time of reflection and growth. Your cosmic blueprint holds unique patterns — take a moment to breathe and consider what emotional needs are arising for you right now.",
  "Based on your astrological profile, there are beautiful opportunities for emotional awareness emerging. Consider journaling about your feelings today — your moon sign often reveals what the heart truly needs.",
  "Your birth chart tells a story of resilience and depth. While the planets move in their cycles, your self-awareness is your greatest tool for navigating emotional waters.",
  "The cosmos invites you to pause and listen to your inner voice. Your unique combination of signs and numbers suggests a capacity for deep empathy — how might you direct that compassion inward today?",
];

function getFallbackResponse(): string {
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
}

// ─── SDK Client (lazy singleton) ───────────────────────────────────────────

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getAIClient() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

// ─── POST Handler ───────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = chatSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { message, sessionId, context, conversationHistory, astrologerSystemPrompt } = parsed.data;

    // Rate limiting
    const rateCheck = checkRateLimit(sessionId);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit reached. You can send up to 30 messages per hour. Please take a break and return later.',
          remaining: 0,
        },
        { status: 429 }
      );
    }

    // Build messages array
    const systemPrompt = buildSystemPrompt(context, astrologerSystemPrompt);
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history for context (last 10 messages to keep token count manageable)
    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-10);
      for (const msg of recentHistory) {
        messages.push(msg);
      }
    }

    messages.push({ role: 'user', content: message });

    // Call AI
    let responseText: string;
    try {
      const client = await getAIClient();
      const response = await client.chat.completions.create({
        messages,
        thinking: { type: 'disabled' },
      });

      responseText = response.choices?.[0]?.message?.content || '';

      if (!responseText) {
        responseText = getFallbackResponse();
      }
    } catch (aiError) {
      console.error('[Astrologer Chat API] AI error:', aiError);
      responseText = getFallbackResponse();
    }

    return NextResponse.json({
      success: true,
      response: responseText,
      remaining: rateCheck.remaining,
    });
  } catch (error) {
    console.error('[Astrologer Chat API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

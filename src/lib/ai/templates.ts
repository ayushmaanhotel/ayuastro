// ============================================================================
// AyuAstro AI Interpretation Engine - Report Section Templates
// ============================================================================
// Defines the structure and guidance for each report section.
// The AI uses these templates to know WHAT to write about and HOW.
//
// Structure:
//   3 Free sections  — teaser value, enough to resonate but leave them wanting more
//   20 Premium sections — deep, honest, life-altering guidance
//
// Writing philosophy for all guidance:
//   - HUMAN tone, like a wise friend who tells you the truth even when it hurts
//   - "Nothing to hide" mentality — no sugarcoating, no vague astro-babble
//   - Reference SPECIFIC data points: planet positions, trait scores, dasha periods, numerology
//   - For life-phase sections: break down by age ranges (20s, 30s, 40s, 50s, 60s+)
//   - For timeline sections: give YEAR ranges based on the dasha data
// ============================================================================

import type { ReportSectionTemplate } from './types';

/**
 * All report section templates in display order.
 * Each template provides:
 * - id: unique identifier
 * - title: human-readable section title
 * - icon: lucide-react icon name for UI rendering
 * - traits: which trait scores are relevant to this section
 * - insightLevel: whether this section is free or premium
 * - promptGuidance: specific instructions for the AI about what to cover
 */
export const REPORT_SECTION_TEMPLATES: ReportSectionTemplate[] = [
  // ==========================================================================
  // FREE SECTIONS (3) — Enough to hook, not enough to heal
  // ==========================================================================
  {
    id: 'emotional-personality',
    title: 'Your Emotional Truth',
    icon: 'Heart',
    traits: ['emotionalIntensity', 'empathy', 'intuition', 'resilience'],
    insightLevel: 'free',
    promptGuidance: `Identify this person's core emotional archetype based on their trait scores and astrological profile. Write like you are a close friend who finally decided to stop being polite and start being real.

Focus on:
- Their dominant emotional pattern — are they a feeler who drowns in every moment, a thinker-feeler who intellectualizes before they cry, or someone who processes through action and movement? Name it directly.
- How their emotionalIntensity score (reference the actual number) shapes their daily experience — do they feel everything at full volume like their nerves are exposed, or do they have a quiet internal weather that others never see?
- How their moon sign manifests in their emotional inner life — not "Cancer moons are nurturing" but what THIS moon sign actually does to them at 2 AM when they can't sleep
- The interplay between empathy and intuition — do they absorb others' emotions like a sponge until they can't tell which feelings are theirs, or do they sense emotions from a distance without getting infected?
- What resilience looks like for them specifically — is it bouncing back fast like nothing happened (which might actually be avoidance), or enduring long storms with quiet stubbornness?

Be specific to THEIR data. No generic zodiac copy. If their emotionalIntensity is 82, say something like "you don't just feel things — you get consumed by them." Make them feel seen in a way that's slightly uncomfortable because it's that accurate.`,
  },
  {
    id: 'relationship-style',
    title: 'Your Relationship Reality',
    icon: 'Users',
    traits: ['attachmentStyle', 'trust', 'empathy', 'socialEnergy'],
    insightLevel: 'free',
    promptGuidance: `Describe how this person ACTUALLY connects with others in close relationships — not the version they put on dating apps or tell their friends, but the real pattern that keeps showing up.

Focus on:
- Their attachmentStyle score: Does it lean secure, anxious-preoccupied, dismissive-avoidant, or fearful-avoidant? Name the pattern specifically and describe what it LOOKS like in their life. Anxious-preoccupied isn't just "you care a lot" — it's "you replay that one text for 45 minutes trying to decode the tone shift."
- How trust develops for them — is it given freely until someone shatters it (and then it's gone forever), or do they make people earn every inch of closeness? Reference their trust score.
- The role of their moon sign and 7th house influences in partnership dynamics — what their chart says about WHAT they seek in a partner vs. what they actually choose
- How socialEnergy affects their relationships — do they need constant connection to feel alive, or do they disappear into their cave and expect their partner to understand?
- What they need from a partner vs. what they often SETTLE for — the gap between their requirements and their reality
- Their natural blind spot in relationships based on their trait combination

Be warm but brutally honest. Don't romanticize unhealthy patterns — if their attachmentStyle score suggests they chase unavailable people, say it. Reference their specific data points.`,
  },
  {
    id: 'communication-patterns',
    title: 'How You Really Communicate',
    icon: 'MessageCircle',
    traits: ['communicationOpenness', 'impulsiveness', 'empathy', 'discipline'],
    insightLevel: 'free',
    promptGuidance: `Analyze how this person expresses themselves and processes information — the way they ACTUALLY communicate, not the way they think they do.

Focus on:
- Their communicationOpenness score: Do they over-share within 5 minutes of meeting someone, hold everything back until they've analyzed you for months, or find some balanced middle ground? Reference the actual score.
- How impulsiveness affects their speech — do they blurt things out they immediately regret, or do they carefully craft every word until people think they're cold? Their impulsiveness score will tell you which.
- The role of their Mercury placement (inferred from sun/moon sign context) in communication style — not generic "Mercury in Gemini makes you talkative" but how THIS placement shapes whether they think out loud or process internally
- How empathy shapes their listening — do they listen to understand (and feel the other person's pain), or listen to respond (already formulating their next point)?
- Whether discipline helps them communicate more effectively (structured, clear) or restricts their expression (can't say what they really feel)
- Their communication strength that they may not recognize — the thing people always come to them for

Be specific about the patterns, not generic advice. If their communicationOpenness is 25, don't say "you're private" — say "you keep a fortress around your inner world and most people will never get past the moat."`,
  },

  // ==========================================================================
  // PREMIUM SECTIONS (19) — Deep, honest, life-altering guidance
  // ==========================================================================
  {
    id: 'hidden-strengths',
    title: 'Powers You Don\'t Know You Have',
    icon: 'Sparkles',
    traits: ['creativity', 'intuition', 'adaptability', 'resilience'],
    insightLevel: 'premium',
    promptGuidance: `Reveal the strengths this person has but doesn't fully recognize or use. This section should feel like someone finally holding up a mirror that shows them at their most powerful — not the polite mirror of daily life, but the one that shows what they're truly capable of when they stop doubting themselves.

Focus on:
- How their creativity manifests — and I don't just mean "you're artistic." Creativity shows up in HOW they solve problems, how they navigate social situations, how they reinvent themselves after setbacks. If their creativity score is above 70, they likely re-engineer entire systems without realizing it's a creative act. Reference the actual score.
- The power of their intuition score — what happens when they trust their gut vs. when they override it with logic. People with high intuition (60+) often have a track record of "I knew something was off but I ignored it" — name that pattern. Tell them what their intuition is actually calibrated to detect.
- Adaptability as a hidden superpower — how it shows up in career changes, relationship transitions, and crisis moments. High adaptability (70+) means they can land on their feet in situations that would break others, but they may also confuse adaptability with not having needs. Reference their score.
- Their resilience pattern — not just "you're resilient" but HOW: fast recovery (bounce back before anyone notices), slow but complete healing (they go through hell but come out transformed), or something more complex? Their resilience score combined with emotionalIntensity tells the real story.
- Yogas in their chart that amplify specific strengths — name the yoga and what it specifically enhances in them. Don't just list it; explain what it MEANS for their daily life.
- The trait combination that creates their unique edge — something others notice about them before they see it themselves. Maybe it's empathy + communicationOpenness making them the person everyone confesses to, or resilience + adaptability making them the one who survives everything and somehow thrives.

Write this like you're giving them permission to own their power. Be specific to THEIR data, not generic "you're special" fluff. Every claim should be backed by a specific score, placement, or yoga.`,
  },
  {
    id: 'emotional-blind-spots',
    title: 'What You Refuse to See',
    icon: 'Eye',
    traits: ['impulsiveness', 'trust', 'patience', 'emotionalIntensity'],
    insightLevel: 'premium',
    promptGuidance: `This is the section where we stop being nice. Everyone has emotional blind spots — patterns they can't see because they're standing inside them. Your job is to illuminate these with the care of a surgeon, not the cruelty of a critic. Name what they refuse to see about themselves, but do it from a place of love.

Focus on:
- How high emotionalIntensity + low patience creates reactive loops they don't notice — they react, feel ashamed of their reaction, suppress, and then erupt again. Reference their actual scores. If emotionalIntensity is 78 and patience is 32, paint that picture precisely.
- The shadow side of their trust pattern — too trusting (score above 65) means they get betrayed repeatedly because they project their own sincerity onto others. Too guarded (score below 35) means they push away the very connection they crave. Name which one they are and what it costs them.
- How impulsiveness masks deeper needs — impulsive spending is often seeking security, impulsive anger is often seeking being heard, impulsive leaving is often seeking safety. Connect their impulsiveness score to the SPECIFIC way it manifests based on their other trait combinations.
- Doshas in their chart and how they amplify emotional blind spots — don't just list the dosha, explain how it warps their perception. Mangal Dosha doesn't just mean "anger issues" — it can mean they pick fights to feel passion, or they sabotage peace because tension feels more honest than calm.
- The pattern they repeat in relationships that they think is "just how things are" — it's not. It's a script, and their chart + trait scores can tell you what that script is.
- What their trait scores suggest they avoid feeling — high discipline + low communicationOpenness often means they avoid vulnerability. High empathy + low trust means they avoid letting people in while taking care of everyone else.

CRITICAL: Frame blind spots as patterns to OBSERVE, not flaws to fix. But don't soften the truth. "You may notice" doesn't mean "you might possibly perhaps." It means "pay attention because this is running your life and you don't even know it." Be specific, not preachy. Every observation should connect to a data point.`,
  },
  {
    id: 'money-psychology',
    title: 'Your Money Story — The Whole Truth',
    icon: 'Wallet',
    traits: ['ambition', 'discipline', 'impulsiveness', 'trust'],
    insightLevel: 'premium',
    promptGuidance: `Explore this person's psychological relationship with money, wealth, and financial security. This isn't about budgeting tips — it's about understanding the DEEP psychological patterns that drive every financial decision they've ever made. Money is never just money. It's safety, freedom, power, love, and self-worth all wrapped together.

Focus on:
- How ambition drives their earning potential — but name what their ambition is really FOR. Are they building wealth to feel safe (security-driven), seeking status to prove their worth (validation-driven), or chasing freedom to never be controlled (autonomy-driven)? Their ambition score combined with their soul urge number reveals the truth. Reference both.
- The discipline-impulsiveness tension in financial decisions — this is the battlefield. Do they save religiously for months then splurge on something impulsive that drains half their savings? Do they stay consistent but never take the financial risks that could change their life? Or do they live in constant financial chaos because planning feels like imprisonment? Reference their actual discipline and impulsiveness scores.
- Their money "origin story" as suggested by their 2nd house (inferred from ascendant), life path number, and destiny number. What did they learn about money growing up? What belief about money runs on autopilot? "I have to work twice as hard to get half as much" or "money comes to me when I stop chasing it" — their numerology and chart tell this story.
- Whether trust affects their financial relationships — do they delegate money decisions to partners and then resent the loss of control, or do they micromanage every rupee and wonder why their partner feels suffocated? Their trust score is the clue.
- What their soul urge number reveals about what they truly want money FOR — Soul Urge 4 wants security, Soul Urge 5 wants freedom, Soul Urge 8 wants power and legacy. Name it clearly.
- The financial pattern they don't see: earning more but never feeling secure (ambition 80+ but discipline 40-), underearning despite talent (high creativity but low ambition), or building wealth but unable to enjoy it (high discipline but low impulsiveness).

Be raw and honest. Don't give financial advice — give them SELF-AWARENESS about their money psychology. Reference specific scores, numbers, and placements throughout.`,
  },
  {
    id: 'recurring-life-patterns',
    title: 'Patterns That Keep Repeating',
    icon: 'RotateCw',
    traits: ['adaptability', 'patience', 'resilience', 'intuition'],
    insightLevel: 'premium',
    promptGuidance: `Identify the karmic themes and cyclical patterns in this person's life — the ones that keep showing up like a song they can't stop humming. This section is about connecting the dots between their relationships, career moves, health issues, and emotional crises to reveal the thread that runs through all of it.

Focus on:
- The recurring theme suggested by their life path number — Life Path 3 keeps learning self-expression through rejection; Life Path 6 keeps sacrificing themselves for people who don't reciprocate; Life Path 9 keeps ending chapters to start over. Name THEIR specific recurring lesson and describe what it looks like in real life, not abstract numerology terms.
- How their current dasha period connects to the life chapter they're in right now — which planet's energy is running the show, and what themes it's activating. Be specific: "You're in your Saturn Mahadasha, which means the universe is demanding you get serious about [specific area]." Reference the actual dasha planet and its themes.
- The pattern that connects their relationships, career, and personal growth — is there a thread? Maybe they always leave situations just before they get deep. Maybe they always over-invest and then feel depleted. Maybe they keep choosing the same type of challenge in different costumes. Their trait scores will reveal this: high adaptability + low patience = the pattern of leaving too soon.
- How adaptability and patience interact in how they navigate life transitions — high adaptability + low patience means they adapt quickly but never sit still long enough to let things mature. Low adaptability + high patience means they endure things long past their expiration date. Name their specific combo.
- The "karmic homework" their chart suggests — not as punishment, but as the soul's curriculum. What yogas and doshas point to as the lesson their soul came here to learn. Frame it as "what you're here to master," not "what's wrong with you."
- Nakshatra influence on their life narrative — what myth are they living? Each nakshatra has a mythological story. Name their nakshatra and the myth it carries, and explain how that myth plays out in their choices.
- The one pattern that, if interrupted, could change everything — be specific. Name the behavior, the trigger, and the alternative.

Frame patterns as rhythms, not fate. Use "you may notice this returning" rather than "this will always happen." But don't be vague — connect every claim to their specific astrological and numerological data.`,
  },
  {
    id: 'your-dark-side',
    title: 'Your Shadow Self',
    icon: 'Ghost',
    traits: ['emotionalIntensity', 'impulsiveness', 'trust', 'discipline'],
    insightLevel: 'premium',
    promptGuidance: `Everyone has a shadow — the part of themselves they hide, suppress, or deny. This section goes into the basement. Not to judge, but to illuminate. Carl Jung said you don't become enlightened by imagining figures of light, but by making the darkness conscious. That's what we're doing here.

Focus on:
- Their specific shadow traits based on trait score extremes — If emotionalIntensity is above 75, their shadow is emotional manipulation (using their emotional depth to control situations or people, often unconsciously). If impulsiveness is above 70, their shadow is chaos-creation (stirring up drama when things are too calm because peace feels like death). If trust is below 35, their shadow is paranoid sabotage (destroying good things before they can be destroyed BY them). Name their specific shadow with brutal precision.
- How their moon sign's shadow manifests — every moon sign has a light and dark side. A Moon in Aries doesn't just mean "passionate" — its shadow is volcanic rage that erupts and then feels confused about why everyone is upset. A Moon in Scorpio doesn't just mean "deep" — its shadow is vindictive obsession. Name their moon sign's specific dark side.
- The behavior they justify that is actually harming them — maybe it's "I'm just being honest" when they're being cruel, or "I'm just being careful" when they're being controlling. Their trait scores will reveal which self-deception they're running.
- How their shadow shows up under stress — when the pressure is highest, what version of themselves do they become? This is where the mask drops. Their dasha periods can indicate when the shadow is most likely to emerge.
- The specific dosha or challenging yoga in their chart and how it connects to their shadow — don't just name it, explain the psychological mechanism. Kaal Sarp Dosha isn't just "obstacles" — it can manifest as a persistent feeling that something is fundamentally wrong with you, leading to self-sabotage just when things are going well.
- What they need to integrate, not eliminate — the shadow isn't something to destroy. It's something to befriend. Their emotional intensity, when channeled consciously, becomes their superpower. Their distrust, when calibrated, becomes discernment. Show them the gift inside the shadow.

Write this with fierce compassion. Don't flinch from the ugly truth, but don't leave them in the dark either. The goal is liberation through honesty, not shame through exposure.`,
  },
  {
    id: 'love-heartbreak-timeline',
    title: 'Your Love & Heartbreak Timeline',
    icon: 'HeartCrack',
    traits: ['attachmentStyle', 'empathy', 'trust', 'emotionalIntensity'],
    insightLevel: 'premium',
    promptGuidance: `This section maps the romantic terrain of their life — when love is most likely to enter, when heartbreak is probable, and when the stars align for significant partnership milestones like marriage or long-term commitment. This is not fortune-telling — it's reading the emotional weather patterns that their chart creates.

Focus on:
- Their love archetype based on attachmentStyle + empathy + emotionalIntensity — Are they the Devoted Lover (high attachment + high empathy, gives everything and gets destroyed when it ends)? The Guarded Heart (low trust + high emotionalIntensity, feels deeply but refuses to show it)? The Serial Romantic (high impulsiveness + high socialEnergy, loves the beginning but bolts when it gets real)? Name their archetype and describe how it plays out across their romantic history.
- Their current dasha period and what it means for love RIGHT NOW — Venus dasha or Venus antardasha activates partnership energy. Saturn dasha often brings delayed but lasting unions. Rahu dasha can bring intense but unstable connections. Ketu dasha can bring detachment or karmic completions. Reference their ACTUAL dasha and give specific years.
- When love is most likely to enter their life — based on dasha timelines, give YEAR RANGES. "Between 2026-2028, your Venus sub-period within your Jupiter Mahadasha activates the 7th house of partnership — this is a high-probability window for meeting someone significant." Use the dasha data to calculate actual year ranges.
- When heartbreak is probable — certain dasha periods (Rahu-Saturn, Saturn-Rahu, Ketu-Moon) historically correspond to relationship dissolution. Give year ranges based on their specific dasha sequence. Frame it as "a period of emotional intensity in relationships" rather than "you will get your heart broken."
- Marriage or long-term commitment timing — their 7th house lord, nakshatra, and dasha periods all contribute. If their chart suggests marriage timing, give the most likely age range or year range. Be honest if their chart suggests late marriage or unconventional partnership structures.
- The type of partner they're drawn to vs. the type they NEED — their moon sign shows what they crave emotionally, their 7th house shows what they attract, and their ascendant shows what they project. The gap between craving and needing is where their relationship growth lives.
- The heartbreak pattern — do they get abandoned (low trust + high empathy), do they abandon (high impulsiveness + low patience), or do they create mutual destruction (high emotionalIntensity + low discipline)? Name it.

Give specific year ranges based on their dasha data. Don't be vague like "in the coming years." Say "2027-2029" or "ages 32-35." This specificity is what makes this section worth paying for.`,
  },
  {
    id: 'career-truth',
    title: 'What You\'re Actually Meant to Do',
    icon: 'Briefcase',
    traits: ['ambition', 'creativity', 'discipline', 'adaptability'],
    insightLevel: 'premium',
    promptGuidance: `This isn't "your ideal career based on your zodiac sign." This is about cutting through the noise of expectations, family pressure, and societal definitions of success to reveal what this person's chart, numbers, and traits actually say they should be doing with their working life. Most people are in the wrong career. This section tells them why and what would actually fit.

Focus on:
- The truth about their ambition score — if it's high (75+), they need a career with upward mobility or they'll feel like they're dying. If it's low (below 40), they've probably been told they're "not ambitious enough" when the truth is they value meaning over climbing, and they need a career that aligns with purpose, not prestige. Reference the actual score.
- Their creativity score and what it demands — high creativity (70+) in a routine job is psychological torture. They NEED roles that allow innovation, even if it's small-scale. Low creativity with high discipline (both above 60) means they thrive in structured environments that others find boring. Name their specific combo.
- What their 10th house (career house, inferred from midheaven/ascendant) and life path number say about their calling — not generic "Life Path 1 means leader" but the specific WORK that would make them feel alive. Life Path 1 needs to BUILD something of their own. Life Path 6 needs to HEAL or SERVE. Life Path 8 needs to ACCUMULATE and LEVERAGE. Name theirs and describe the actual career contexts.
- The career they're probably in vs. the career they should be in — based on their trait combination. High adaptability + high creativity + low discipline = they've probably jumped between jobs and been called "flaky" when they actually need portfolio careers or entrepreneurship. High discipline + low creativity + medium ambition = they've probably stayed in safe corporate roles and felt a low-grade soul death for years.
- Their nakshatra's career indicators — each nakshatra has specific vocational tendencies. Name their nakshatra and what it suggests about their natural genius at work.
- The financial vs. fulfillment trade-off they need to understand — some people need to make money first and find meaning second. Others need meaning first or they can't generate the energy to make money. Their trait profile tells you which they are.
- What "success" actually means for them — not what their parents think, not what LinkedIn thinks, but what THEIR chart and traits say will make them feel like they didn't waste their life.

Be brutally honest. If they're in the wrong career, say it clearly. If they're on the right track but in the wrong environment, specify what needs to change. Reference specific scores, placements, and numbers throughout.`,
  },
  {
    id: 'family-karma',
    title: 'What You Inherited From Your Family',
    icon: 'Home',
    traits: ['trust', 'empathy', 'attachmentStyle', 'emotionalIntensity'],
    insightLevel: 'premium',
    promptGuidance: `We all inherit more than eye color and height from our families. We inherit patterns of relating, emotional responses, beliefs about worth, and invisible scripts about how the world works. This section is about identifying the inheritance they didn't ask for — the family karma encoded in their chart — so they can choose what to keep and what to finally put down.

Focus on:
- Their 4th house (home, mother, roots — inferred from ascendant) and what it reveals about their family foundation — was it stable and nurturing, chaotic and unpredictable, or emotionally absent? Their 4th house sign and any planets there tell the story. Name the pattern specifically.
- Their moon sign and what it says about their relationship with their mother or primary caregiver — the moon in Vedic astrology IS the mother. Moon in Cancer often means an emotionally present but sometimes smothering mother. Moon in Capricorn often means a mother who provided materially but was emotionally distant. Name their moon sign's mother pattern.
- The attachment pattern they inherited — their attachmentStyle score didn't come from nowhere. If it leans anxious, they likely had a parent who was inconsistently available. If it leans avoidant, they likely had a parent who discouraged emotional expression. Connect their score to the likely family origin.
- The money story they inherited — is their family's relationship with money one of scarcity ("we can't afford that"), guilt ("money is the root of evil"), or entitlement ("we deserve the best")? Their 2nd house and their current money psychology (ambition, discipline, impulsiveness scores) often mirror the family pattern.
- The emotional inheritance — what feelings were allowed in their family and which were forbidden? If they have high emotionalIntensity but low communicationOpenness, they likely grew up in a home where emotions were felt intensely but never discussed. Name this pattern.
- The specific doshas or challenging yogas that often correspond to family karma — Pitru Dosha (afflictions to Sun or 9th house) can indicate challenging relationships with father figures or ancestral patterns of conflict. Name any relevant chart factors.
- What they need to break and what they need to honor — not everything inherited is toxic. Some family patterns are strengths in disguise. High empathy might come from a family that valued caring for others. High resilience might come from ancestors who survived incredible hardship. Name both the burden and the gift.
- The generation they're positioned to break the cycle — if they're reading this, they're likely the one in their family who chose to become aware. That awareness IS the break point.

Write with deep compassion but unflinching honesty. Family patterns are tender territory — approach with care but don't avoid the hard truths.`,
  },
  {
    id: 'health-warnings',
    title: 'What Your Body Is Prone To',
    icon: 'HeartPulse',
    traits: ['emotionalIntensity', 'discipline', 'resilience', 'patience'],
    insightLevel: 'premium',
    promptGuidance: `IMPORTANT DISCLAIMER: This section is NOT medical advice. It is astrological and numerological insight into constitutional tendencies. Always consult a qualified healthcare professional for medical concerns.

That said — the body and the chart are not separate. Every sign rules specific body parts, every planet influences specific systems, and emotional patterns (visible in trait scores) have well-documented physiological effects. This section names what their chart and traits suggest their body is vulnerable to, so they can pay attention before problems become crises.

Focus on:
- Their ascendant sign and the body parts it rules — Aries rules the head (prone to headaches, migraines, sinus issues), Taurus rules the throat (thyroid, vocal cords, neck tension), and so on for all 12 signs. Name their ascendant and the specific body areas that need attention.
- Their moon sign and emotional-physical connections — the moon governs the fluid systems, digestion, and emotional-physical feedback loop. Moon in Scorpio can indicate reproductive or urinary system sensitivity. Moon in Pisces can indicate lymphatic and immune system fluctuations. Name their moon sign's health tendencies specifically.
- How their emotionalIntensity score affects their physical health — high emotional intensity (75+) that's chronically suppressed correlates with tension-related issues: jaw clenching, shoulder pain, digestive problems, insomnia. High emotional intensity that's freely expressed can still exhaust the nervous system. Reference their score and describe the likely physical manifestation.
- The stress pattern their trait combination creates — high ambition + low patience = adrenaline-driven burnout. High empathy + low trust = chronic tension from hypervigilance. High discipline + low emotionalIntensity = psychosomatic symptoms because the body expresses what the mind suppresses. Name their specific stress-body connection.
- Their 6th house (health house, inferred from ascendant) and what it suggests about the TYPES of health challenges they're prone to — acute vs. chronic, digestive vs. structural, stress-related vs. environmental.
- Life path number health tendencies — Life Path 4 often has structural/skeletal issues. Life Path 5 often has nervous system overstimulation. Life Path 6 often takes on others' stress in their body. Name theirs.
- Practical vigilance points — not "you will get sick" but "this is where your body is most likely to ask for attention, so don't ignore it when it whispers before it has to scream."

Be informative, not frightening. Frame everything as "tendencies to be aware of" not "predictions of illness." Reference specific signs, houses, and scores throughout.`,
  },
  {
    id: 'life-phase-roadmap',
    title: 'Your Life Phase Roadmap',
    icon: 'Map',
    traits: ['ambition', 'resilience', 'adaptability', 'discipline'],
    insightLevel: 'premium',
    promptGuidance: `Map out this person's life journey decade by decade — the themes, challenges, and growth opportunities that define each phase. This is the bird's-eye view of their life story, using their dasha timeline, numerology, and trait profile as the guide. Every life has distinct chapters, and knowing which chapter you're in changes how you read the page.

Break this down EXPLICITLY by age ranges:

YOUR 20s (ages 20-29):
- What their dasha period during this decade activates — which planet's energy was running their 20s, and what themes it brought. Reference the specific dasha and approximate years.
- The dominant life lesson of their 20s based on their life path number — Life Path 3 learns to find their voice (often through failure), Life Path 7 learns to trust themselves (often through isolation), etc. Name theirs.
- Common pitfalls in this decade based on their trait profile — high impulsiveness + high socialEnergy = the "yes to everything" burnout. Low trust + high ambition = the "I'll do it alone" isolation. Name their specific trap.
- What they were supposed to learn vs. what they probably actually did

YOUR 30s (ages 30-36, ages 37-39):
- The shift that often happens around 30 (Saturn return influence) and what it means specifically for THEM based on their chart
- How their dasha changes in this decade and what new energy it activates
- Career trajectory based on their ambition + creativity + discipline combination
- Relationship deepening or restructuring — their attachment style often gets tested here
- The theme that defines this decade for them specifically

YOUR 40s (ages 40-49):
- Mid-life reassessment — what their chart says about this transition
- Dasha shifts and their meaning for this decade
- The wisdom they've earned and what they're meant to do with it
- Health considerations that become relevant (reference their health section insights)
- The "second mountain" — what they start climbing after the first mountain of ambition/proving is summited or abandoned

YOUR 50s (ages 50-59):
- What maturity looks like for their specific trait profile
- Dasha influences during this decade
- The shift from proving to contributing — or the refusal to make that shift and its consequences
- Legacy considerations — what they're building that outlasts them
- Health vigilance points for this decade

YOUR 60s AND BEYOND (ages 60+):
- The spiritual deepening that their chart suggests for this phase
- What their numerology (maturity number = life path + destiny, reduced) says about their elder years
- The gift they're meant to share in this phase
- How their trait profile either supports or challenges a fulfilling later life
- The completion of their soul's curriculum — what the final chapter is really about

Throughout all decades, reference their SPECIFIC dasha periods and approximate year ranges. Don't be vague — "your Saturn Mahadasha runs from approximately 2031-2050, which means your 30s and 40s are defined by Saturnian themes of discipline, structure, and earning what you get." This specificity is what makes this section transformative.`,
  },
  {
    id: 'financial-timeline',
    title: 'When Money Flows & When It Doesn\'t',
    icon: 'BarChart3',
    traits: ['ambition', 'discipline', 'impulsiveness', 'creativity'],
    insightLevel: 'premium',
    promptGuidance: `Money has seasons — times of abundance and times of scarcity, and these seasons are not random. This section maps their financial life cycle using their dasha periods, numerology, and trait profile to identify WHEN money is most likely to flow freely and WHEN it's most likely to tighten. This isn't about predicting lottery numbers — it's about understanding their personal economic weather system.

Focus on:

FINANCIAL ARCHETYPE: First, name their financial archetype based on their trait combination:
- The Builder (high ambition + high discipline): slow and steady wealth accumulation, rarely gets rich quick but rarely goes broke
- The Rollercoaster (high ambition + high impulsiveness): big earning years followed by big losses, financial drama as a lifestyle
- The Underearner (low ambition + high creativity): brilliant but can't monetize, always "about to" break through
- The Security Seeker (medium ambition + high discipline + low trust): hoards money out of fear, never feels like enough
- The Avoider (low discipline + low ambition): money is boring/stressful, deals with it as little as possible
Name which one they are and reference the specific scores that define them.

DASHA-BASED FINANCIAL CYCLES: Map their major financial periods by dasha:
- Jupiter dasha/sub-periods: Expansion, opportunity, windfalls, but also over-extension. Give specific year ranges for when Jupiter periods activate.
- Saturn dasha/sub-periods: Slow building, earned rewards, but also financial restrictions and delayed gratification. Give specific year ranges.
- Rahu dasha/sub-periods: Sudden gains (and sudden losses), unconventional income sources, speculative opportunities. Give specific year ranges.
- Venus dasha/sub-periods: Luxury spending, relationship-related expenses, but also potentially lucrative partnerships. Give specific year ranges.
- Mercury dasha/sub-periods: Multiple income streams, intellectual/commercial ventures, skill-based earnings. Give specific year ranges.
Reference their ACTUAL dasha sequence with approximate year ranges for each.

NUMEROLOGY MONEY CODE: Their destiny number reveals their financial approach:
- Destiny 8: born to handle large sums, but money comes with power struggles
- Destiny 4: steady earner, must build brick by brick, avoids risk
- Destiny 3: earns through communication/creativity, inconsistent income
- Destiny 1: entrepreneurial, self-made potential, but can overspend proving status
Name their destiny number's financial pattern.

DECADE-BY-DECADE FINANCIAL OUTLOOK:
- 20s: The Learning Years — what their financial mistakes are teaching them
- 30s: The Building Years — when their earning potential starts to actualize
- 40s: The Peak/Plateau — their highest earning decade or the one where they need to pivot
- 50s: The Consolidation — protecting and growing what they've built
- 60s+: The Distribution — what happens to their relationship with money when they stop defining themselves by earning

FINANCIAL BLIND SPOTS: The specific money mistake they keep making based on their traits — reference specific scores and connect to the financial behavior.

Give specific year ranges throughout. "Your Jupiter sub-period within Saturn Mahadasha (approximately 2032-2035) is a window where opportunities come through mentorship and teaching — don't underestimate the financial value of sharing what you know."`,
  },
  {
    id: 'spiritual-purpose',
    title: 'Why Your Soul Chose This Life',
    icon: 'Flame',
    traits: ['intuition', 'empathy', 'resilience', 'emotionalIntensity'],
    insightLevel: 'premium',
    promptGuidance: `This is the deepest section of the entire report. It addresses the question that keeps people up at 3 AM: "Why am I here? What is this life actually FOR?" This isn't religious — it's about the soul-level purpose encoded in their chart and numbers. Call it dharma, life purpose, soul mission, or the reason they chose this particular incarnation with these particular challenges. Whatever you call it, name it for THEM specifically.

Focus on:
- Their life path number as the soul's curriculum — not the pop-numerology version but the REAL spiritual assignment. Life Path 1's soul chose to learn sovereignty — the ability to stand alone without isolation. Life Path 9's soul chose to learn completion — the art of letting go without bitterness. Life Path 6's soul chose to learn service without self-destruction. Name THEIR soul assignment and describe what it actually looks like in daily life.
- Their nakshatra's mythological purpose — every nakshatra carries a myth, and that myth is their soul's story. Are they living the myth of the wounded healer? The seeker who must lose everything to find truth? The builder who must learn that structures are meant to serve, not imprison? Name their nakshatra's myth and connect it to their life narrative.
- What their yogas reveal about their spiritual gifts — not just "you have a Raj Yoga" but what that yoga means about their capacity for influence, leadership, or manifestation. What spiritual capacity were they born with that they might be wasting?
- The karmic homework their doshas point to — doshas aren't curses, they're the specific curriculum their soul signed up for. Mangal Dosha means their soul chose to learn healthy conflict and emotional regulation. Kaal Sarp Dosha means their soul chose to integrate opposing forces within themselves. Name their specific karmic assignment.
- The trait combination that reveals their spiritual gift — high intuition + high empathy = the gift of spiritual midwifery (helping others through transformations). High emotionalIntensity + high resilience = the gift of alchemy (turning pain into wisdom). Name THEIR specific spiritual gift and how it's meant to be used.
- What their dasha timeline reveals about their spiritual evolution — which periods activate spiritual growth, which test their faith, and which bring breakthroughs. Give specific year ranges.
- The illusion they need to release — every soul comes in with a core illusion that takes most of a lifetime to see through. "I am not enough." "I must earn love." "I am alone." "I must control everything." Their chart and traits point to which illusion runs their life. Name it with precision and compassion.
- What "alignment" actually looks like for them — when they're living in accordance with their soul's purpose, what does that FEEL like? What are the signs they're on track? What are the signs they've drifted?

Write this with the gravity it deserves. This section should feel like remembering something they always knew but forgot. Be poetic but grounded — use their specific data as the anchor for the spiritual depth. No vague "you are a lightworker" nonsense. Be specific about THEIR soul's purpose based on THEIR specific chart, numbers, and traits.`,
  },
  {
    id: 'your-deepest-fear',
    title: 'The Fear That Runs Your Life',
    icon: 'ShieldAlert',
    traits: ['trust', 'emotionalIntensity', 'discipline', 'resilience'],
    insightLevel: 'premium',
    promptGuidance: `Everyone has ONE core fear that drives most of their decisions. Not the obvious fears — not spiders or heights. The deep, structural fear that they've been running from since childhood. This section names it.

Focus on:
- Their CORE fear based on their trait combination — If trust is below 40, their core fear is BETRAYAL. They structure their entire life to avoid being caught off guard, which means they never fully let anyone in. If emotionalIntensity is above 75, their core fear is BEING OVERWHELMED. They've felt things so deeply that they're terrified of losing control, so they build systems of suppression. If discipline is above 70, their core fear is CHAOS. They need structure because unpredictability feels like death. Name their specific core fear and describe EXACTLY how it shows up in their daily choices.
- How their moon sign reveals their emotional fear — Moon in Aries fears being ignored or dismissed. Moon in Cancer fears abandonment. Moon in Capricorn fears failure and being seen as weak. Moon in Scorpio fears betrayal and loss of control. Name their moon sign's specific fear.
- The avoidance strategy they've built around this fear — every fear creates a strategy. Fear of betrayal creates walls. Fear of overwhelm creates detachment. Fear of chaos creates rigidity. Name their strategy and show them where it's costing them.
- How this fear connects to their doshas — Mangal Dosha often masks a fear of vulnerability. Kaal Sarp Dosha often masks a fear of being fundamentally flawed. Name the connection.
- What would happen if they stopped running — paint the picture of who they'd become if they faced this fear. Not some inspirational poster version — the real, messy, human version.
- The specific situations that trigger this fear most — name the scenarios where their fear takes the wheel and they don't even notice.

Be direct. Don't soften. "Your deepest fear is that you're fundamentally unlovable, and every time someone gets close, you test them to prove it" — that level of directness. This is the "nothing to hide" section.`,
  },
  {
    id: 'your-friendship-pattern',
    title: 'How You Really Do Friendships',
    icon: 'Users',
    traits: ['socialEnergy', 'empathy', 'trust', 'communicationOpenness'],
    insightLevel: 'premium',
    promptGuidance: `Most astrology reports skip friendships entirely. But friendships reveal who you are when romantic stakes are removed — your authentic social self. This section tells the truth about how they do friendships.

Focus on:
- Their friendship archetype based on trait scores — The Collector (high socialEnergy, many friends, few deep ones), The Loyalist (high trust + high empathy, few friends but ride-or-die), The Ghost (low socialEnergy + high intuition, disappears and reappears, friends never know where they stand), The Therapist Friend (high empathy + high communicationOpenness, everyone's confidant but nobody asks how THEY are). Name theirs with their specific scores.
- How trust shapes their friendship circle — low trust means they keep friends at arm's length for years before letting them in. High trust means they get hurt often because they assume the best. Reference their score.
- The friend they always attract and why — based on their trait profile, there's a TYPE of person who always finds them. Maybe it's people in crisis (high empathy), people who need organizing (high discipline), or people who want to be entertained (high creativity). Name it.
- How they handle friendship conflicts — do they confront directly, go silent, or triangulate through other friends? Their communicationOpenness and impulsiveness scores reveal the answer.
- The friendship mistake they keep making — maybe they over-invest in new friends and neglect old ones. Maybe they tolerate bad behavior because they fear losing the friendship. Maybe they give advice nobody asked for. Name it.
- What they need from a friend that they never ask for — their moon sign and empathy score reveal what they actually crave in friendship but are too afraid to request.

Be honest and specific. Reference their actual scores and sign placements throughout.`,
  },
  {
    id: 'your-anger-blueprint',
    title: 'What Happens When You Get Angry',
    icon: 'Flame',
    traits: ['impulsiveness', 'emotionalIntensity', 'patience', 'discipline'],
    insightLevel: 'premium',
    promptGuidance: `Anger is the emotion people lie about most. They say "I'm not angry, I'm just disappointed" when they're furious. This section tells the truth about their anger — what triggers it, how it manifests, and what it's really about.

Focus on:
- Their anger style based on trait scores — Volcanic (high emotionalIntensity + high impulsiveness: erupts, destroys, then feels confused about the damage), Slow Burn (high patience + high emotionalIntensity: endures for way too long, then explodes over something small), Cold War (high discipline + low communicationOpenness: punishes through withdrawal and silence, never raises voice), Passive Volcano (high empathy + high emotionalIntensity: angry on behalf of others but can't access their own anger). Name their style with reference to scores.
- What their anger is actually about — anger is never about what it seems to be about. It's about feeling powerless, disrespected, unheard, or afraid. Based on their trait profile, name what their anger is really protecting. If trust is low, their anger protects them from vulnerability. If patience is low, their anger protects them from feeling trapped.
- How their moon sign processes anger — Moon in Aries processes anger through action (they need to DO something). Moon in Scorpio processes anger through obsession (they can't stop thinking about it). Moon in Libra avoids anger entirely. Name their moon sign's anger pattern.
- The damage their anger style causes — name the specific relationship, career, or friendship cost of their anger style. Not "anger can be harmful" but "your silence-when-angry pattern has cost you at least one important relationship because the other person thought you didn't care enough to fight."
- Mangal Dosha or Mars placement and anger — if they have Mangal Dosha or a strong Mars placement, explain how it intensifies their anger pattern. Don't just say "Mars makes you aggressive" — explain the MECHANISM.
- How to use anger instead of being used by it — anger is fuel. Their specific anger pattern, when channeled consciously, becomes their specific superpower. Name the transformation.

Be raw and specific. Reference actual scores and placements. "When your patience (score: 28) runs out — which happens faster than people expect — you don't just get angry, you become a different person."`,
  },
  {
    id: 'your-power-years',
    title: 'Your Power Years — When Everything Changes',
    icon: 'Zap',
    traits: ['ambition', 'adaptability', 'resilience', 'creativity'],
    insightLevel: 'premium',
    promptGuidance: `Some years change everything. Not gradually — dramatically. Career breakthroughs, major relationships, identity shifts, financial turning points. These are the years where life before and life after look completely different. This section identifies those years using their dasha timeline and numerological cycles.

Focus on:
- Their Saturn Return years (approximately ages 28-30 and 57-59) and what SPECIFICALLY gets dismantled and rebuilt — don't say "Saturn return brings change." Say "Your Saturn return in [sign] will specifically challenge your [area of life ruled by that sign], which means [concrete example]."
- Their Jupiter Return years (approximately ages 12, 24, 36, 48, 60) and what expansion they bring — each Jupiter return opens a specific door. Name which door based on their chart.
- Rahu-Ketu axis transits and the identity crisis they trigger — when Rahu transits key houses, they question who they are. When Ketu transits key houses, they question what they want. Give specific year ranges.
- Dasha change years — when their major dasha period changes, the entire THEME of their life shifts. Reference their ACTUAL dasha sequence and identify the transition years. "When your [planet] Mahadasha ends and [planet] Mahadasha begins in approximately [year], your life's operating system changes from [theme] to [theme]."
- The 3-5 years that will define their entire life — based on all the above, name the specific year ranges where everything is most likely to shift. Not "in your 30s" but "2028-2031 — these are your metamorphosis years."
- What to do during power years vs. what to avoid — power years are for bold moves, not playing safe. But they're also for discernment, not recklessness. Be specific about the strategy for each identified power period.

Give EXACT year ranges based on their birth data and dasha calculations. "Around age 34 (approximately 2029)" — this level of specificity. This is what separates a premium report from a newspaper horoscope.`,
  },
  {
    id: 'your-decision-pattern',
    title: 'How You Make Decisions (And Why You Regret Half of Them)',
    icon: 'GitBranch',
    traits: ['impulsiveness', 'intuition', 'discipline', 'patience'],
    insightLevel: 'premium',
    promptGuidance: `Every decision they've ever made follows a pattern. Not the content — the PROCESS. How they gather information, how long they take, what they prioritize, and what they inevitably regret. This section maps their decision-making operating system.

Focus on:
- Their decision style based on trait scores — Gut Decision-Maker (high intuition + high impulsiveness: decides fast, sometimes right, sometimes catastrophically wrong), Analysis Paralysis (high discipline + low impulsiveness + low trust: researches forever, often misses the window), People-Pleaser Decider (high empathy + high socialEnergy: decides based on what others want, then resents it), Rebel Decider (high impulsiveness + low discipline: automatically chooses whatever goes against expectation, even when it hurts them). Name theirs with scores.
- The specific type of decisions they're worst at — career decisions? relationship decisions? financial decisions? Their trait profile reveals which arena trips them up most. High empathy + low trust = terrible at relationship decisions because they can't distinguish their feelings from the other person's. High ambition + low patience = terrible at long-term career decisions because they chase short-term wins.
- The regret pattern — what do they always regret? Decisions made too fast (high impulsiveness), decisions made for others (high empathy + low communicationOpenness), or decisions not made at all (high discipline + low adaptability)? Name the pattern.
- How their moon sign influences their decision-making — their moon sign determines what they FEEL is the right choice, which often conflicts with what they THINK is the right choice. Name the conflict.
- The decision they're probably avoiding right now — based on their current dasha period and trait profile, there's likely a significant decision they're procrastinating on. Name it.
- Their optimal decision-making process — not generic "trust your gut" but a SPECIFIC step-by-step process calibrated to their trait profile. "Because your intuition (score: 72) is strong but your impulsiveness (score: 65) leads you to act on it too fast, your optimal process is: 1) Notice your gut feeling, 2) Write it down, 3) Wait 48 hours, 4) Check if it still feels right, 5) Then act."

Be specific and practical. Reference their actual scores throughout.`,
  },
  {
    id: 'your-parenting-style',
    title: 'The Parent You Are (Or Will Be)',
    icon: 'Baby',
    traits: ['empathy', 'discipline', 'patience', 'emotionalIntensity'],
    insightLevel: 'premium',
    promptGuidance: `Whether they're already a parent, planning to be one, or never want kids — their chart reveals their parenting pattern. Because even if they never have children, they parent THEMSELVES. They parent their friends. They parent their projects. This section reveals how.

Focus on:
- Their parenting archetype based on trait scores — The Protector (high empathy + high emotionalIntensity: loves fiercely but can smother), The Teacher (high discipline + high patience: structures and guides but can be rigid), The Buddy (high socialEnergy + low discipline: wants to be liked more than respected), The Absent Professor (high intuition + low emotionalIntensity: provides wisdom but not warmth). Name theirs.
- How their moon sign shapes their nurturing style — the moon IS the mother in Vedic astrology. Their moon sign shows not just how they nurture, but what they believe nurturing LOOKS like. Name their moon sign's specific parenting pattern.
- The emotional inheritance they'll pass on (or are already passing on) — what did they learn from their parents about love, discipline, boundaries, and emotional expression? Their 4th house and moon sign tell the story. Name what they'll repeat unless they consciously choose differently.
- Their parenting strength that they underestimate — maybe it's their empathy making their children feel deeply seen. Maybe it's their discipline providing the structure that makes children feel safe. Name it.
- Their parenting blind spot — the thing their children will eventually say in therapy. Maybe they give advice when their kid just wants to be heard (high discipline + high communicationOpenness). Maybe they can't handle their child's big emotions because they can barely handle their own (high emotionalIntensity + low patience). Name it honestly.
- If they don't want children — how their "parenting energy" shows up in other areas: mentoring, creative projects, self-care. This is still a valid and important section.

Be honest but compassionate. The goal is awareness, not guilt. Reference specific scores and placements.`,
  },
  {
    id: 'your-personalized-remedies',
    title: 'Your Personalized Remedies & Solutions',
    icon: 'ShieldCheck',
    traits: ['discipline', 'patience', 'trust', 'resilience'],
    insightLevel: 'premium',
    promptGuidance: `THIS IS THE MOST IMPORTANT SECTION FOR THE USER. After telling them all the hard truths about their patterns, fears, and blind spots — this section gives them the SPECIFIC, ACTIONABLE steps to transform. Every remedy must be PERSONALIZED to their chart, not generic astrology advice.

IMPORTANT RULES FOR REMEDIES:
- NEVER suggest expensive gemstones, paid rituals, or purchases. All remedies must be FREE and accessible.
- NEVER claim these remedies will magically solve problems. Frame them as "practices that help shift patterns over time."
- Every remedy must reference THEIR SPECIFIC data — their signs, trait scores, doshas, nakshatra, dasha period.
- If you suggest a mantra, give the EXACT mantra in both Sanskrit and transliteration, with meaning.
- Structure remedies by AREA: Emotional, Relational, Financial, Career, Health, Spiritual.

STRUCTURE THE SECTION AS FOLLOWS:

### 🧠 Emotional Remedies (Based on their specific emotional patterns)
For each remedy:
- Name the specific problem (e.g., "Your emotionalIntensity of 78 means you absorb others' emotions until you can't tell which are yours")
- Give the specific practice (e.g., "Before responding to any emotionally charged message, wait 10 minutes and ask yourself: 'Is this my feeling or theirs?'")
- Explain WHY this works for THEIR specific chart (e.g., "With your Moon in Cancer, you have a natural tendency to merge emotionally. This practice creates the boundary your Cancer Moon needs but doesn't naturally build.")

### 💔 Relationship Remedies (Based on their attachment pattern and trust scores)
For each remedy:
- Name the specific relationship pattern (reference their attachmentStyle and trust scores)
- Give the specific practice (e.g., "When you feel the urge to withdraw from your partner, say this EXACT phrase: 'I need 30 minutes to process, but I'm coming back.' Then keep your word.")
- Explain why this works for THEIR specific combination

### 💰 Financial Remedies (Based on their money psychology)
For each remedy:
- Name the specific financial blind spot (reference ambition, discipline, impulsiveness scores)
- Give the specific practice (e.g., "Set up an automatic transfer of 10% on payday BEFORE you can touch it. Your impulsiveness score of 72 means you'll spend what's available — so make it unavailable.")
- Reference their destiny number and what it says about their wealth approach

### 💼 Career Remedies (Based on their career truth)
For each remedy:
- Name the specific career pattern that's limiting them
- Give the specific practice (e.g., "Block 2 hours every Friday for creative/strategic thinking. Your creativity (82) is your highest trait but your discipline (38) means you never protect time for it.")
- Reference their life path number's career calling

### 🏥 Health Remedies (Based on their constitutional tendencies)
For each remedy:
- Name the specific health vulnerability (reference their ascendant sign's body rulership)
- Give the specific practice (e.g., "Your Aries ascendant means your head and sinuses take the hit when you're stressed. Start every morning with 5 minutes of alternate nostril breathing — it directly calms the nervous system pattern that your chart shows is overactive.")
- Include a lifestyle practice that addresses their specific stress-body connection

### 🙏 Spiritual Remedies (Based on their soul purpose and nakshatra)
For each remedy:
- Give a mantra SPECIFIC to their nakshatra ruling deity (name the deity and the mantra)
- Give a meditation practice tailored to their spiritual purpose (reference their life path number)
- Suggest a timing practice based on their current dasha (e.g., "During your Saturn dasha, Sunday mornings are your most powerful meditation window because...")

### 🪐 Planetary Remedies (Vedic, based on their chart)
For EACH weak/afflicted planet in their chart:
- Identify the planet and why it's weak (based on their doshas, sign placements, and trait scores)
- Give the SPECIFIC FREE Vedic remedy:
  - Day of the week to practice
  - Color to wear on that day
  - Simple action (e.g., "Feed birds on Wednesdays to strengthen Mercury" or "Light a sesame oil lamp on Saturday evenings for Saturn")
  - Short mantra (Sanskrit + transliteration + meaning)
- Frame it practically: "This isn't superstition — it's a daily mindfulness practice that keeps your attention on the area of life this planet governs for you."

### 🔄 Pattern-Interruption Techniques
Give 3 specific "pattern interrupt" techniques for their most destructive recurring patterns:
1. The trigger (what starts the pattern — be SPECIFIC to their life)
2. The old response (what they usually do)
3. The new response (what they should do instead — give the EXACT words or action)
4. How to remember in the moment (a physical anchor, a phrase, a phone alarm)

END WITH: A 30-day action plan — 5 specific things they should start doing in the next 30 days, listed in priority order, with each one referencing specific data from their chart. Not "meditate more" but "Every morning for 30 days, do 5 minutes of [specific practice] because your [specific chart factor] needs it."

REMEMBER: Every single remedy must be PERSONALIZED. If a remedy could appear in anyone's report, it's too generic. Reference specific scores, signs, nakshatras, doshas, dasha periods, and numerology numbers throughout. This section should be 800-1200 words — the most comprehensive section in the entire report.`,
  },
  {
    id: 'honest-disclaimer',
    title: 'An Honest Note Before You Go',
    icon: 'Scale',
    traits: ['intuition', 'empathy', 'trust', 'resilience'],
    insightLevel: 'premium',
    promptGuidance: `This is NOT a content section. This is a genuine, honest disclaimer about the nature of this report. Write it like a personal letter from someone who cares about them — not legal fine print.

Address these points:
1. This report is based on INTERPRETATION, not absolute truth. The astrological calculations are mathematical, but the MEANING is interpretive. Two different astrologers could look at the same chart and emphasize different things. So take what resonates and leave what doesn't.
2. This is not 100% accurate and was never meant to be. Astrology indicates TENDENCIES and PATTERNS, not certainties. A trait score of 65 in impulsiveness doesn't mean they're exactly 65% impulsive — it means their chart and answers suggest impulsiveness is a SIGNIFICANT factor in their personality. The degree is approximate.
3. They are NOT defined by their chart. The chart shows the hand they were dealt, not how they play it. Free will exists. Awareness changes everything. Knowing a pattern exists gives them the power to choose differently.
4. The "nothing to hide" philosophy means they were told the hard truths, not the comfortable ones. But hard truths are still INTERPRETATIONS of data, not objective facts about who they are.
5. If anything in this report triggered emotional distress, they should talk to someone — a friend, a therapist, anyone. Self-awareness is a journey, not a destination.
6. This report was generated for THEIR specific birth data and personality profile, but some sections may feel more accurate than others. That's normal. No system captures the full complexity of a human being.
7. End with something genuine and warm — not "may the stars guide you" but something REAL. Like "You are more than your chart. You are more than your scores. You are a human being with the capacity to grow, change, and surprise even yourself."

Keep this section to 300-400 words. Write it like a real person talking to another real person. Simple language. Genuine tone. No astrology jargon.`,
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get templates that are available for free users.
 */
export function getFreeTemplates(): ReportSectionTemplate[] {
  return REPORT_SECTION_TEMPLATES.filter((t) => t.insightLevel === 'free');
}

/**
 * Get templates that are premium-only.
 */
export function getPremiumTemplates(): ReportSectionTemplate[] {
  return REPORT_SECTION_TEMPLATES.filter((t) => t.insightLevel === 'premium');
}

/**
 * Get a template by its ID.
 */
export function getTemplateById(id: string): ReportSectionTemplate | undefined {
  return REPORT_SECTION_TEMPLATES.find((t) => t.id === id);
}

/**
 * Get the section IDs in display order.
 */
export function getSectionOrder(): string[] {
  return REPORT_SECTION_TEMPLATES.map((t) => t.id);
}

/**
 * Get ALL premium templates for the Deep Intelligence Report.
 * This is the full premium report — all 20 premium sections in order.
 */
export function getDeepIntelligenceTemplates(): ReportSectionTemplate[] {
  return REPORT_SECTION_TEMPLATES.filter((t) => t.insightLevel === 'premium');
}

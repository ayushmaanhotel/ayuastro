/**
 * AyuAstro - Planet Strength Analysis API
 *
 * Calculates strength scores for all 9 Navagraha based on:
 * - Sign dignity (Exalted, Moolatrikona, Own, Friendly, Neutral, Enemy, Debilitated)
 * - House placement (Kendra/Trikona bonuses)
 * - Retrograde status
 * - Combustion
 * - Vargottama (D1/D9 same sign)
 *
 * All calculations are DETERMINISTIC — same birth details always produce identical results.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { calculateKundali, initializeSwissEphemeris } from '@/lib/astrology';
import {
  type Planet,
  type ZodiacSign,
  type PlanetPosition,
  ZODIAC_SIGNS,
  PLANETS,
} from '@/lib/astrology/types';
import {
  isExalted,
  isDebilitated,
  isInOwnSign,
  isInMoolatrikona,
  getSignLord,
  getHouseFromAscendant,
  getPermanentRelationship,
  KENDRA_HOUSES,
  TRIKONA_HOUSES,
} from '@/lib/astrology/utils';
import { calculateDivisionalChart } from '@/lib/astrology/divisional';

const requestSchema = z.object({ userId: z.string().min(1) });

// ─── In-Memory Cache ────────────────────────────────────────────────────────
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 min

// ─── Planet Influence Descriptions ──────────────────────────────────────────

type StrengthLevel = 'strong' | 'weak';

interface PlanetInfluence {
  en: { strong: string; weak: string };
  hinglish: { strong: string; weak: string };
}

const PLANET_INFLUENCES: Record<string, PlanetInfluence> = {
  Sun: {
    en: {
      strong: "Your Sun is powerful, which means you naturally command respect. People look to you for direction, and you probably feel most alive when you're in charge or being recognized. Your confidence is real — not a mask. Just watch out: strong Sun energy can make you impatient with people who can't keep up.",
      weak: "Your Sun is struggling, which shows up as self-doubt and feeling invisible. You might have issues with authority figures — especially your father — or struggle to own your achievements. You know you're capable, but something keeps making you second-guess yourself. Stop waiting for permission to shine.",
    },
    hinglish: {
      strong: "Aapka Surya bahut mazboot hai, matlab log naturally aapko respect karte hain. Aap direction dete ho aur charge lene mein sabse zyada alive feel karte ho. Aapki confidence asli hai — dikhave ki nahi. Bas dhyan rakhein: strong Surya aapko un logon se impatient bana sakta hai jo aapke saath pace nahi rakh paate.",
      weak: "Aapka Surya weak hai, yeh self-doubt aur invisible feel karne mein dikhta hai. Aapko authority figures — especially pita ji — ke saath issues ho sakte hain, ya apni achievements ko accept karne mein dikkat hoti hai. Aap jaante ho ki capable ho, lekin kuch aapko baar-baar sochne pe majboor karta hai. Chamne ki permission ka wait karna band karo.",
    },
  },
  Moon: {
    en: {
      strong: "Your Moon is powerful — you feel things deeply AND handle them well. Your emotional intelligence is off the charts. People come to you because you 'just get it.' You probably have a strong bond with your mother or maternal figures. Your gut feelings are almost always right.",
      weak: "Your Moon is struggling — your emotional world is like a storm you can't predict. You absorb everyone else's feelings and then wonder why you're exhausted. Sleep issues, mood swings, or a complicated relationship with your mother are all signs. You need to protect your peace more aggressively.",
    },
    hinglish: {
      strong: "Aapka Chandra bahut mazboot hai — aap cheezein deeply feel karte ho AUR unhe achhe se handle karte ho. Aapki emotional intelligence kamaal ki hai. Log aapke paas aate hain kyunki aap 'sab samajh jaate ho.' Maa ya maternal figures ke saath aapka strong bond hai. Aapki gut feeling lagbhag hamesha sahi hoti hai.",
      weak: "Aapka Chandra weak hai — aapka emotional world aise storm jaisa hai jo predict nahi kar sakte. Aap sabke feelings absorb kar lete ho aur phir sochte ho ki itna tired kyun ho. Sleep issues, mood swings, ya maa ke saath complicated relationship — yeh sab signs hain. Apni shaanti ko zyada seriously protect karna padega.",
    },
  },
  Mars: {
    en: {
      strong: "Your Mars is a powerhouse — you've got drive, courage, and the ability to take action when others hesitate. You're competitive and you play to win. This makes you excellent in high-pressure situations. The downside: you might come across as aggressive when you're just being direct.",
      weak: "Your Mars is weak, and it shows up as a weird mix of suppressed anger and inability to take action. You know what you should do, but something holds you back. You might avoid confrontation to the point of being passive, then explode later. Your energy levels may be inconsistent — some days you're on fire, other days you can't get off the couch.",
    },
    hinglish: {
      strong: "Aapka Mangal ek powerhouse hai — aap mein drive hai, himmat hai, aur jab doosre hesitate karte hain tab aap action lete ho. Aap competitive hain aur jeetne ke liye khelete ho. Yeh aapko high-pressure situations mein excellent banata hai. Negative side: aap sirf direct baat kar rahe hote ho lekin log aggressive samajh sakte hain.",
      weak: "Aapka Mangal weak hai, aur yeh suppressed anger aur action na lene ki aadat mein dikhta hai. Aap jaante ho kya karna chahiye, lekin kuch aapko rokta hai. Aap confrontation se itne avoid karte ho ki passive ho jaate ho, aur baad mein phaat jaate ho. Energy levels inconsistent ho sakti hain — kuch din aap full on hain, doosre din couch se utar nahi paate.",
    },
  },
  Mercury: {
    en: {
      strong: "Your Mercury is sharp — you pick up patterns, learn fast, and explain things in a way that makes people go 'oh, NOW I get it.' You probably read a lot, think a lot, and can talk your way out of almost anything. Your mind is your greatest weapon.",
      weak: "Your Mercury is weak — communication isn't your strong suit, or you overthink everything to the point of paralysis. You might have great ideas but struggle to express them clearly. Decision-making feels like choosing between 47 equally bad options. Your nervous system is probably running on overdrive.",
    },
    hinglish: {
      strong: "Aapka Budh bahuti tez hai — aap patterns jaldi pakadte ho, fast seekhte ho, aur cheezein aise explain karte ho ki log bolein 'ab samjha!' Aap shayad zyada padhte hain, zyada sochte hain, aur almost kisi bhi situation se baat karke nikal sakte ho. Aapka dimaag aapka sabse bada weapon hai.",
      weak: "Aapka Budh weak hai — communication aapki strong suit nahi hai, ya aap itna overthink karte ho ki paralysis ho jaati hai. Aapke paas great ideas ho sakti hain lekin unhe clearly express karne mein dikkat hoti hai. Decision lene mein aisa lagta hai jaise 47 equally bure options mein se choose karna ho. Nervous system shayad overdrive par chal raha hai.",
    },
  },
  Jupiter: {
    en: {
      strong: "Your Jupiter is powerful — wisdom, growth, and luck seem to follow you. You're naturally optimistic and people trust your judgment. You probably have a great relationship with teachers, mentors, or spiritual guides. Money and opportunities tend to find you, especially through knowledge.",
      weak: "Your Jupiter is weak — you might struggle with faith, both in yourself and in life's process. Opportunities slip through your fingers because you either don't trust them or don't recognize them. Education may have been a struggle, or you feel you haven't found the right teacher. Weight gain, liver issues, or overspending are common with weak Jupiter.",
    },
    hinglish: {
      strong: "Aapka Brihaspati bahut mazboot hai — wisdom, growth, aur luck aapke peeche aati lagti hai. Aap naturally optimistic hain aur log aapke judgment pe bharosa karte hain. Teachers, mentors, ya spiritual guides ke saath aapka great relationship hai. Paise aur opportunities aapko dhundh kar aati hain, especially knowledge ke through.",
      weak: "Aapka Brihaspati weak hai — aapko faith se dikkat ho sakti hai, khud pe bhi aur life ke process pe bhi. Opportunities haath se nikal jaati hain kyunki aap unpe bharosa nahi karte ya pehchaan nahi paate. Education struggle rahi ho sakti hai, ya aapko lagta hai ki sahi teacher nahi mila. Weight gain, liver issues, ya zyada kharcha karna — yeh common hai weak Brihaspati mein.",
    },
  },
  Venus: {
    en: {
      strong: "Your Venus is powerful — beauty, relationships, and creativity flow naturally for you. You have an eye for aesthetics and people are drawn to your charm. Your love life tends to be fulfilling (even if dramatic sometimes). You know how to make life feel luxurious without spending a fortune.",
      weak: "Your Venus is weak — relationships feel like hard work, and you might feel unlovable no matter how much love you get. You struggle with self-worth, especially around beauty and desirability. Creative blocks happen often. You might either overindulge in pleasures as compensation or avoid them entirely.",
    },
    hinglish: {
      strong: "Aapka Shukra bahut mazboot hai — beauty, relationships, aur creativity aapke liye naturally aati hai. Aapki aesthetic sense acchi hai aur log aapke charm ke towards drawn hote hain. Love life fulfilling hoti hai (kabhi dramatic bhi). Aap life ko bina zyada kharcha kiye luxurious feel karana jaante ho.",
      weak: "Aapka Shukra weak hai — relationships mein mehnat lagti hai, aur kitna bhi pyaar mile aapko unlovable feel ho sakta hai. Self-worth ke saath dikkat hai, especially beauty aur desirability ke around. Creative blocks aksar aate hain. Aap ya toh pleasures mein overindulge karte hain compensation ke taur par ya unse completely avoid karte hain.",
    },
  },
  Saturn: {
    en: {
      strong: "Your Saturn is powerful — discipline, patience, and long-term thinking are your superpowers. You outlast everyone. What others call 'slow,' you call 'strategic.' You build things that last — careers, relationships, wealth. The catch: you might take yourself too seriously and forget to enjoy the present.",
      weak: "Your Saturn is weak — discipline feels impossible, and delays frustrate you beyond reason. You might feel like life is constantly testing you and you're always behind schedule. Authority issues, career instability, or chronic health problems (especially bones/joints/teeth) are common. The lesson here is that shortcuts will always backfire on you.",
    },
    hinglish: {
      strong: "Aapka Shani bahut mazboot hai — discipline, patience, aur long-term thinking aapki superpower hai. Aap sabse zyada der tak tikte ho. Jo log 'slow' kehte hain, aap usse 'strategic' kehte ho. Aap aisi cheezein build karte jo last karti hain — career, relationships, wealth. Pakad: aap khud ko itna seriously le sakte ho ki present enjoy karna bhool jaate ho.",
      weak: "Aapka Shani weak hai — discipline impossible lagti hai, aur delays aapko beyond reason frustrate karti hain. Aapko lagta hai ki life constantly aapko test kar rahi hai aur aap hamesha schedule se peeche hain. Authority issues, career instability, ya chronic health problems (especially bones/joints/teeth) common hain. Lesson: shortcuts hamesha aappar backfire karenge.",
    },
  },
  Rahu: {
    en: {
      strong: "Your Rahu is powerful — you're hungry for success, and not in a subtle way. You want the unconventional, the foreign, the cutting-edge. You're willing to break rules that need breaking. This makes you a visionary, but also obsessive. You might chase things that look shiny but leave you empty.",
      weak: "Your Rahu is weak — you struggle with confusion about what you actually want. The desires that drive other people don't seem to motivate you, or you want everything and nothing at the same time. You might feel like an outsider, no matter where you are. The path forward is to stop looking for validation from outside sources.",
    },
    hinglish: {
      strong: "Aapka Rahu bahut mazboot hai — aap success ke bhookhe hain, aur subtly nahi. Aap unconventional, foreign, cutting-edge cheezein chahte hain. Aap woh rules todne ko taiyaar hain jo todne zaroori hain. Yeh aapko visionary banata hai, lekin obsessive bhi. Aap shayad aisi cheezein chase karein jo shiny dikhti hain lekin empty chhod deti hain.",
      weak: "Aapka Rahu weak hai — aapko confusion rehti hai ki actually kya chahte ho. Jo desires doosron ko drive karti hain woh aapko motivate nahi karti, ya aap sab kuch chahte hain aur kuch nahi bhi. Aapko lagta hai ki aap outsider ho, chahe kahi bhi hon. Aage ka raasta yeh hai ki bahar se validation dhundhna band karo.",
    },
  },
  Ketu: {
    en: {
      strong: "Your Ketu is powerful — you have natural spiritual depth and intuition that others lack. You've 'been here before' in a way that's hard to explain. Detachment comes easily to you, and you can see through illusions that trap others. The risk: you might detach too much and miss out on the human experience.",
      weak: "Your Ketu is weak — letting go is your biggest challenge. You cling to things, people, and identities that no longer serve you. Spiritual growth feels forced, not natural. You might feel disconnected from your intuition or struggle with a sense of purposelessness. The remedy is to practice small releases daily.",
    },
    hinglish: {
      strong: "Aapka Ketu bahut mazboot hai — aap mein naturally spiritual depth aur intuition hai jo doosron mein nahi. Aap 'pehle yahan aaye hain' — aise explain karna mushkil hai. Detachment aapko easily aata hai, aur aap woh illusions dekh sakte ho jo doosron ko trap karte hain. Risk: aap bahut zyada detach ho kar human experience miss kar sakte ho.",
      weak: "Aapka Ketu weak hai — chhodna aapki sabse badi challenge hai. Aap un cheezon, logon, aur identities se chipke rehte ho jo ab serve nahi karti. Spiritual growth forced lagti hai, natural nahi. Intuition se disconnect ya purposelessness ka ehsaas ho sakta hai. Upay: roz thoda thoda chhodne ki practice karo.",
    },
  },
};

// ─── Remedy Suggestions for Weak Planets ────────────────────────────────────

const WEAK_PLANET_REMEDIES: Record<string, string[]> = {
  Sun: [
    'Offer water to the rising Sun (Surya Arghya) every morning',
    'Respect father figures and authority — this is non-negotiable',
    'Wake up before sunrise — sunlight literally strengthens your Sun',
  ],
  Moon: [
    'Drink water from a silver glass — Moon resonates with silver',
    'Meditate for 10 minutes before bed — calm the emotional storm',
    'Keep your relationship with your mother healthy, even if it\'s hard',
  ],
  Mars: [
    'Exercise vigorously at least 4 times a week — Mars needs physical outlet',
    'Avoid excessive salt and spicy food — it fuels unnecessary aggression',
    'Channel anger into constructive competition, not conflict',
  ],
  Mercury: [
    'Read for 30 minutes daily — your Mercury is starving for stimulation',
    'Practice expressing one clear thought before overthinking the next',
    'Wear green on Wednesdays — it strengthens Mercury\'s frequency',
  ],
  Jupiter: [
    'Respect your teachers and mentors — even when you disagree',
    'Donate food or books on Thursdays — Jupiter responds to generosity',
    'Study something spiritual or philosophical — Jupiter grows through wisdom',
  ],
  Venus: [
    'Wear clean, well-kept clothes — Venus responds to self-care',
    'Express appreciation genuinely — don\'t just feel it, say it',
    'Create something beautiful weekly — even if it\'s just arranging flowers',
  ],
  Saturn: [
    'Be brutally honest — Saturn punishes lies and shortcuts',
    'Serve the elderly or disabled — Saturn softens through selfless service',
    'Discipline one area of your life completely — start with sleep schedule',
  ],
  Rahu: [
    'Stop chasing shiny things — ask "do I need this or just want it?"',
    'Meditate on your actual desires vs. borrowed ones',
    'Serve in a hospital or old-age home — Rahu calms through seva',
  ],
  Ketu: [
    'Practice letting go of one small thing daily — start easy',
    'Meditate on your breath for 5 minutes — Ketu responds to stillness',
    'Stop clinging to past identities — you\'re not who you were 5 years ago',
  ],
};

// ─── Dignity Determination ──────────────────────────────────────────────────

function getDignity(planet: Planet, sign: ZodiacSign): {
  dignity: string;
  score: number;
  reason: string;
} {
  if (isExalted(planet, sign)) return { dignity: 'Exalted', score: 5, reason: `${planet} is exalted in ${sign} — maximum strength` };
  if (isInMoolatrikona(planet, sign)) return { dignity: 'Moolatrikona', score: 4, reason: `${planet} is in Moolatrikona sign ${sign} — near-peak strength` };
  if (isInOwnSign(planet, sign)) return { dignity: 'Own Sign', score: 3, reason: `${planet} is in its own sign ${sign} — very comfortable` };
  if (isDebilitated(planet, sign)) return { dignity: 'Debilitated', score: -5, reason: `${planet} is debilitated in ${sign} — weakest placement` };

  // Check permanent relationship with sign lord
  const signLord = getSignLord(sign);
  const relationship = getPermanentRelationship(planet, signLord);

  switch (relationship) {
    case 'Friend': return { dignity: 'Friendly', score: 2, reason: `${planet} is in friendly sign ${sign} (lord ${signLord} is a friend)` };
    case 'Enemy': return { dignity: 'Enemy', score: -1, reason: `${planet} is in enemy sign ${sign} (lord ${signLord} is an enemy)` };
    default: return { dignity: 'Neutral', score: 1, reason: `${planet} is in neutral sign ${sign} (lord ${signLord} is neutral)` };
  }
}

// ─── Main Strength Calculation ──────────────────────────────────────────────

function calculatePlanetStrength(
  planet: Planet,
  pos: PlanetPosition,
  ascSignIndex: number,
  sunPos: PlanetPosition | undefined,
  d9Positions: Record<string, { sign: ZodiacSign; signIndex: number }> | undefined,
): {
  name: Planet;
  sign: ZodiacSign;
  house: number;
  score: number;
  dignity: string;
  isRetrograde: boolean;
  isCombust: boolean;
  strengths: string[];
  weaknesses: string[];
} {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  let score = 0;

  // 1. Sign dignity
  const dignityResult = getDignity(planet, pos.sign);
  score += dignityResult.score;
  if (dignityResult.score > 0) {
    strengths.push(dignityResult.reason);
  } else if (dignityResult.score < 0) {
    weaknesses.push(dignityResult.reason);
  }

  // 2. House placement
  const house = pos.house ?? getHouseFromAscendant(pos.signIndex, ascSignIndex);

  if (KENDRA_HOUSES.includes(house)) {
    score += 1;
    strengths.push(`In Kendra house ${house} — angular strength (+1)`);
  }

  if (TRIKONA_HOUSES.includes(house)) {
    score += 2;
    strengths.push(`In Trikona house ${house} — trinal blessing (+2)`);
  }

  // 3. Retrograde
  const isRetrograde = pos.isRetrograde;
  if (isRetrograde && planet !== 'Rahu' && planet !== 'Ketu') {
    score -= 1;
    weaknesses.push(`${planet} is retrograde — internalized energy (-1)`);
  }

  // 4. Combustion
  const isCombust = pos.isCombust;
  if (isCombust) {
    score -= 2;
    weaknesses.push(`${planet} is combust (too close to Sun) — weakened (-2)`);
  }

  // 5. Vargottama (same sign in D1 and D9)
  if (d9Positions && d9Positions[planet]) {
    const d9Sign = d9Positions[planet].sign;
    if (d9Sign === pos.sign) {
      score += 2;
      strengths.push(`Vargottama — same sign in D1 and D9, inner-outer alignment (+2)`);
    }
  }

  // If no specific strengths found, add a generic one
  if (strengths.length === 0) {
    strengths.push(`${planet} in ${pos.sign} — functioning at baseline level`);
  }
  if (weaknesses.length === 0 && score <= 1) {
    weaknesses.push(`No significant protective factors for ${planet} in this chart`);
  }

  return {
    name: planet,
    sign: pos.sign,
    house,
    score,
    dignity: dignityResult.dignity,
    isRetrograde,
    isCombust,
    strengths,
    weaknesses,
  };
}

// ─── POST Handler ───────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // Ensure Swiss Ephemeris is initialized before calculations
    await initializeSwissEphemeris();

    const body = await request.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { userId } = parsed.data;

    // Check cache
    const cacheKey = `planet-strength-${userId}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    // Fetch user data with profile for birth details
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user || !user.profile) {
      return NextResponse.json(
        { error: 'User or profile data not found. Please complete onboarding first.' },
        { status: 404 }
      );
    }

    const profile = user.profile;

    // Recalculate kundali for fresh positions
    const birthDate = new Date(profile.dateOfBirth);
    const [hours, minutes] = (profile.timeOfBirth || '12:00').split(':').map(Number);
    birthDate.setHours(hours || 0, minutes || 0, 0, 0);

    const tzOffset = typeof profile.timezone === 'number'
      ? profile.timezone
      : parseFloat(String(profile.timezone)) || 5.5;

    const kundali = calculateKundali(
      birthDate,
      profile.timeOfBirth || '12:00',
      profile.latitude || 28.6139,
      profile.longitude || 77.2090,
      tzOffset,
    );

    const positions = kundali.planetaryPositions;
    const ascSignIndex = kundali.ascendantData.signIndex;
    const sunPos = positions['Sun'];

    // Calculate D9 for vargottama check
    let d9Positions: Record<string, { sign: ZodiacSign; signIndex: number }> | undefined;
    try {
      const d9Chart = calculateDivisionalChart('D9', positions, kundali.ascendantData);
      d9Positions = {};
      for (const [pName, pPos] of Object.entries(d9Chart.positions)) {
        d9Positions[pName] = { sign: pPos.sign, signIndex: pPos.signIndex };
      }
    } catch {
      // D9 not available — skip vargottama check
      d9Positions = undefined;
    }

    // Calculate strength for all 9 planets
    const planetNames: Planet[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    const planets = planetNames
      .filter(p => positions[p])
      .map(p => calculatePlanetStrength(p, positions[p]!, ascSignIndex, sunPos, d9Positions));

    // Sort by score
    const allPlanetsRanked = [...planets].sort((a, b) => b.score - a.score);

    const strongestPlanet = allPlanetsRanked[0];
    const weakestPlanet = allPlanetsRanked[allPlanetsRanked.length - 1];

    // Add influence descriptions
    const addInfluence = (planetData: typeof planets[number], isStrong: boolean) => {
      const level: StrengthLevel = isStrong ? 'strong' : 'weak';
      const influences = PLANET_INFLUENCES[planetData.name];
      const remedies = WEAK_PLANET_REMEDIES[planetData.name];

      return {
        ...planetData,
        influenceEn: influences?.en[level] ?? `Your ${planetData.name} has a ${level} influence on your life.`,
        influenceHinglish: influences?.hinglish[level] ?? `Aapka ${planetData.name} aapki life par ${level} asar dalta hai.`,
        remedies: !isStrong && remedies ? remedies : undefined,
      };
    };

    const result = {
      planets: planets.map(p => addInfluence(p, p.score > 3)),
      strongestPlanet: strongestPlanet ? addInfluence(strongestPlanet, true) : null,
      weakestPlanet: weakestPlanet ? addInfluence(weakestPlanet, false) : null,
      allPlanetsRanked: allPlanetsRanked.map(p => addInfluence(p, p.score > 3)),
    };

    // Cache
    cache.set(cacheKey, { data: result, timestamp: Date.now() });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[planet-strength] Error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate planet strength' },
      { status: 500 }
    );
  }
}

export const maxDuration = 300;
/**
 * AyuAstro - Comprehensive Kundali Analysis API
 *
 * Generates deeply comprehensive Vedic Kundali analysis covering 12 dimensions
 * as described in classical Jyotish texts (Brihat Parashara Hora Shastra,
 * Jataka Parijata, Brihat Jataka).
 *
 * All text is FULLY DETERMINISTIC — same birth details always produce identical text.
 * No AI generation, no randomness, no Barnum statements.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { calculateKundali, initializeSwissEphemeris } from '@/lib/astrology';
import {
  type Planet,
  type ZodiacSign,
  type PlanetPosition,
  type YogaData,
  type DoshaData,
  ZODIAC_SIGNS,
} from '@/lib/astrology/types';
import {
  getSignLord,
  getHouseFromAscendant,
  isExalted,
  isDebilitated,
  isInOwnSign,
  getSignAttributes,
  getSignIndex,
  KENDRA_HOUSES,
  TRIKONA_HOUSES,
  EXALTATION,
} from '@/lib/astrology/utils';
import { HOUSE_SIGNIFICANCES } from '@/lib/astrology/charts';
import { NAKSHATRAS } from '@/lib/astrology/nakshatra';
import { getDashaInterpretation } from '@/lib/astrology/dasha';
import { calculateAllDivisionalCharts, analyzeNavamsha, type VargaType } from '@/lib/astrology/divisional';
import { calculateKarakas, getAtmakaraka, getDarakaraka, getAmatyakaraka, type KarakaData } from '@/lib/astrology/jaimini';

const requestSchema = z.object({ userId: z.string().min(1) });

// ─── In-Memory Cache ────────────────────────────────────────────────────────
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 min

// ─── Helper Functions ───────────────────────────────────────────────────────

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function getPlanetHouse(pos: PlanetPosition, ascSignIndex: number): number {
  return getHouseFromAscendant(pos.signIndex, ascSignIndex);
}

function getSignElement(sign: ZodiacSign): string {
  const idx = ZODIAC_SIGNS.indexOf(sign);
  const mod = idx % 4;
  if (mod === 0) return 'Fire';
  if (mod === 1) return 'Earth';
  if (mod === 2) return 'Air';
  return 'Water';
}

function getAyurvedicConstitution(ascSign: ZodiacSign, moonSign: ZodiacSign): { dosha: string; note: string } {
  const ascElement = getSignElement(ascSign);
  const moonElement = getSignElement(moonSign);
  const map: Record<string, string> = { Fire: 'Pitta', Earth: 'Kapha', Air: 'Vata', Water: 'Kapha-Vata' };
  const primary = map[ascElement] || 'Vata';
  const secondary = map[moonElement] || 'Vata';
  if (primary === secondary) {
    return { dosha: primary, note: `Your ascendant in ${ascElement} sign and Moon in ${moonElement} sign both strongly indicate a ${primary} constitution. You tend toward ${primary === 'Pitta' ? 'intensity, heat, and sharp digestion' : primary === 'Kapha' ? 'stability, endurance, and calm strength' : primary === 'Vata' ? 'creativity, quick thinking, and variable energy' : 'a blend of stability and creativity'}. Balance through ${primary === 'Pitta' ? 'cooling foods, moderation, and nature' : primary === 'Kapha' ? 'stimulation, exercise, and variety' : primary === 'Vata' ? 'routine, warmth, and grounding practices' : 'alternating routine and creative freedom'}.` };
  }
  return { dosha: `${primary}-${secondary}`, note: `Your ascendant (${ascElement}) suggests ${primary} constitution while your Moon sign (${moonElement}) adds ${secondary} qualities. This creates a dual nature — ${primary === 'Pitta' ? 'intense and driven' : primary === 'Vata' ? 'creative and quick' : 'stable and enduring'} with ${secondary === 'Pitta' ? 'sharp intelligence' : secondary === 'Vata' ? 'artistic sensitivity' : 'emotional depth'}. Balance both through mindful routine.` };
}

function getHouseLordAnalysis(houseNum: number, positions: Record<string, PlanetPosition>, ascSignIndex: number): string {
  const houseSignIndex = (ascSignIndex + houseNum - 1) % 12;
  const houseSign = ZODIAC_SIGNS[houseSignIndex];
  const lord = getSignLord(houseSign);
  const lordPos = positions[lord];
  if (!lordPos) return `${houseNum}th house lord (${lord}) position unknown.`;
  const lordHouse = getPlanetHouse(lordPos, ascSignIndex);
  const dignity = isExalted(lord, lordPos.sign) ? 'exalted' : isDebilitated(lord, lordPos.sign) ? 'debilitated' : isInOwnSign(lord, lordPos.sign) ? 'in own sign' : 'in neutral sign';
  return `${getOrdinalSuffix(houseNum)} house lord ${lord} is in the ${getOrdinalSuffix(lordHouse)} house in ${lordPos.sign} (${dignity}).`;
}

// ─── 1. Personality Blueprint ───────────────────────────────────────────────

function generatePersonalityBlueprint(
  positions: Record<string, PlanetPosition>,
  ascSignIndex: number,
  karakas: KarakaData[],
) {
  const moonPos = positions['Moon'];
  const sunPos = positions['Sun'];
  const marsPos = positions['Mars'];
  const ak = karakas.find(k => k.type === 'Atmakaraka');
  const lagnaSign = ZODIAC_SIGNS[ascSignIndex];
  const moonSign = moonPos?.sign ?? 'Aries';
  const sunSign = sunPos?.sign ?? 'Aries';
  const moonHouse = moonPos ? getPlanetHouse(moonPos, ascSignIndex) : 1;
  const sunHouse = sunPos ? getPlanetHouse(sunPos, ascSignIndex) : 1;

  const lagnaAttr = getSignAttributes(lagnaSign as ZodiacSign);
  const moonAttr = getSignAttributes(moonSign as ZodiacSign);

  // Archetype scoring
  const scores: Record<string, number> = { Warrior: 0, Sage: 0, Artist: 0, Builder: 0, Mystic: 0, Leader: 0, Healer: 0, Innovator: 0 };
  if (lagnaAttr.element === 'Fire') { scores.Warrior += 3; scores.Leader += 2; }
  if (lagnaAttr.element === 'Earth') { scores.Builder += 3; scores.Healer += 1; }
  if (lagnaAttr.element === 'Air') { scores.Sage += 3; scores.Innovator += 2; }
  if (lagnaAttr.element === 'Water') { scores.Artist += 3; scores.Healer += 2; }
  if (moonAttr.element === 'Fire') { scores.Warrior += 2; scores.Leader += 1; }
  if (moonAttr.element === 'Water') { scores.Artist += 2; scores.Healer += 2; }
  if (['Mars', 'Sun'].includes(ak?.planet ?? '')) { scores.Warrior += 2; scores.Leader += 2; }
  if (['Jupiter', 'Mercury'].includes(ak?.planet ?? '')) { scores.Sage += 2; scores.Leader += 1; }
  if (['Venus', 'Moon'].includes(ak?.planet ?? '')) { scores.Artist += 2; scores.Healer += 2; }
  if (['Saturn'].includes(ak?.planet ?? '')) { scores.Builder += 2; scores.Mystic += 1; }
  if (['Ketu'].includes(ak?.planet ?? '')) { scores.Mystic += 3; }
  if (['Rahu'].includes(ak?.planet ?? '')) { scores.Innovator += 3; }
  if (moonHouse === 12) scores.Mystic += 2;
  if (sunHouse === 10) scores.Leader += 2;

  const archetype = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];

  const archetypeDescs: Record<string, string> = {
    Warrior: 'You are a natural warrior — driven by courage, protection, and decisive action. Your energy is direct and powerful. You thrive when leading through challenge and defending what matters.',
    Sage: 'You are a natural sage — driven by wisdom, knowledge, and understanding. Your energy is contemplative and expansive. You thrive when learning, teaching, and guiding others toward truth.',
    Artist: 'You are a natural artist — driven by beauty, emotion, and creative expression. Your energy is flowing and aesthetic. You thrive when creating, loving, and bringing harmony to the world.',
    Builder: 'You are a natural builder — driven by structure, patience, and lasting achievement. Your energy is steady and reliable. You thrive when creating systems, providing security, and building legacy.',
    Mystic: 'You are a natural mystic — driven by spiritual seeking, detachment, and inner truth. Your energy is introspective and transcendent. You thrive in meditation, solitude, and exploring the unseen.',
    Leader: 'You are a natural leader — driven by authority, vision, and influence. Your energy is commanding and inspiring. You thrive when taking charge, setting direction, and empowering others.',
    Healer: 'You are a natural healer — driven by compassion, nurturing, and emotional depth. Your energy is caring and restorative. You thrive when supporting others, creating safety, and fostering growth.',
    Innovator: 'You are a natural innovator — driven by breaking boundaries, exploring the unconventional, and creating the future. Your energy is restless and revolutionary. You thrive in uncharted territory.',
  };

  const moonTraits: Record<string, string> = {
    Aries: 'impulsive and pioneering thinking, quick mental reactions, and a need for independence',
    Taurus: 'steady and practical thinking, strong memory, and a desire for security and comfort',
    Gemini: 'versatile and analytical thinking, constant mental activity, and curiosity about everything',
    Cancer: 'intuitive and emotionally-driven thinking, strong memory, and deep attachment to the past',
    Leo: 'dignified and confident thinking, creative imagination, and a need for recognition and respect',
    Virgo: 'detailed and critical thinking, analytical precision, and a desire for order and improvement',
    Libra: 'balanced and relational thinking, strong aesthetic sense, and a need for harmony and fairness',
    Scorpio: 'intense and penetrating thinking, emotional depth, and a desire to uncover hidden truths',
    Sagittarius: 'expansive and optimistic thinking, philosophical curiosity, and a need for freedom and meaning',
    Capricorn: 'practical and ambitious thinking, strategic planning, and a desire for achievement and respect',
    Aquarius: 'innovative and unconventional thinking, humanitarian ideals, and a need for independence and reform',
    Pisces: 'intuitive and imaginative thinking, deep empathy, and a tendency toward idealism and spiritual seeking',
  };

  const marsHouseTraits: Record<number, string> = {
    1: 'Your courage and anger are outwardly expressed — you are direct, assertive, and sometimes impulsive in confrontation.',
    2: 'Your drive manifests through speech and financial ambition — you fight for your values and resources.',
    3: 'Your courage shows through communication and initiative — you are bold in action and competitive.',
    4: 'Your energy is directed toward home and security — you are protective and emotionally driven in conflict.',
    5: 'Your drive is creative and intellectual — you pursue romance, speculation, and self-expression with passion.',
    6: 'Your energy is directed toward service and competition — you fight against obstacles and injustice.',
    7: 'Your assertiveness shows in partnerships — you may experience power dynamics in relationships.',
    8: 'Your drive is hidden and transformative — you have the courage to face the deepest fears and secrets.',
    9: 'Your courage is philosophical and principled — you fight for beliefs, dharma, and higher truth.',
    10: 'Your ambition is career-focused — you are driven to achieve status, authority, and professional success.',
    11: 'Your energy goes toward goals and social networks — you are strategic in pursuing gains and friendships.',
    12: 'Your drive is internalized and spiritual — you may suppress anger, leading to passive aggression or spiritual warriorship.',
  };

  const constitution = getAyurvedicConstitution(lagnaSign as ZodiacSign, moonSign as ZodiacSign);
  const marsHouse = marsPos ? getPlanetHouse(marsPos, ascSignIndex) : 1;

  return {
    mentalWiring: `With Moon in ${moonSign}, your mind operates through ${moonTraits[moonSign] ?? 'a unique blend of sensitivity and strength'}. Moon in the ${getOrdinalSuffix(moonHouse)} house places your emotional center in the realm of ${HOUSE_SIGNIFICANCES.find(h => h.number === moonHouse)?.name ?? 'life experiences'}.`,
    emotionalTendencies: `Your emotional nature is primarily ${moonAttr.element === 'Water' ? 'deep and flowing — you feel things intensely and absorb the emotional atmosphere around you' : moonAttr.element === 'Fire' ? 'passionate and quick — your emotions ignite fast and you express them openly' : moonAttr.element === 'Earth' ? 'stable and grounded — you process emotions slowly but feel them deeply and lastingly' : 'variable and intellectual — you analyze emotions before feeling them, seeking to understand before reacting'}.`,
    courageAndFear: marsPos ? `${marsHouseTraits[marsHouse] ?? 'Your courage expresses itself through determined action.'} Mars in ${marsPos.sign} gives you ${isExalted('Mars', marsPos.sign) ? 'exceptional courage and drive' : isDebilitated('Mars', marsPos.sign) ? 'a more measured approach to conflict — your courage comes through persistence rather than aggression' : isInOwnSign('Mars', marsPos.sign) ? 'strong, confident assertiveness' : 'determined energy'}.` : 'Courage patterns determined by Mars placement.',
    leadershipVsFollower: `With ${lagnaSign} ascendant (${lagnaAttr.element} element, ${lagnaAttr.modality} modality), you are naturally ${lagnaAttr.modality === 'Movable' ? 'a leader who initiates action and sets direction' : lagnaAttr.modality === 'Fixed' ? 'a stabilizer who consolidates and preserves — you lead through consistency and reliability' : 'an adapter who bridges and communicates — you lead through versatility and connection'}.`,
    materialisticVsSpiritual: `Your ${constitution.dosha} constitution ${moonHouse === 12 || moonHouse === 9 ? 'combined with your Moon placement suggests strong spiritual inclination alongside material ambition' : moonHouse === 2 || moonHouse === 10 ? 'combined with your Moon placement emphasizes material achievement and practical success' : 'creates a balance between material ambition and spiritual seeking'}.`,
    angerPatterns: marsPos ? `Mars in ${marsPos.sign} (${isExalted('Mars', marsPos.sign) ? 'exalted — powerful but controlled' : isDebilitated('Mars', marsPos.sign) ? 'debilitated — anger may be suppressed or indirect' : isInOwnSign('Mars', marsPos.sign) ? 'own sign — strong and direct' : 'neutral'}) ${marsPos.isRetrograde ? 'and retrograde (internalized aggression)' : ''} suggests ${marsPos.sign === 'Aries' || marsPos.sign === 'Scorpio' ? 'quick, intense anger that burns hot and fast' : marsPos.sign === 'Taurus' || marsPos.sign === 'Libra' ? 'slow-burning anger that builds over time but can be devastating' : marsPos.sign === 'Gemini' || marsPos.sign === 'Virgo' ? 'verbal and analytical anger — you argue with precision' : marsPos.sign === 'Cancer' || marsPos.sign === 'Pisces' ? 'emotionally-driven anger tied to feeling hurt or unprotected' : marsPos.sign === 'Leo' ? 'dignified anger — you react when your pride or authority is challenged' : marsPos.sign === 'Sagittarius' ? 'righteous anger — you fight for principles and beliefs' : marsPos.sign === 'Capricorn' || marsPos.sign === 'Aquarius' ? 'controlled, strategic anger — you plan your responses carefully' : 'complex anger patterns'}.` : 'Anger patterns depend on Mars placement.',
    decisionStyle: `Your decision-making is ${lagnaAttr.modality === 'Movable' ? 'quick and action-oriented — you prefer to decide and move forward' : lagnaAttr.modality === 'Fixed' ? 'deliberate and firm — once decided, you rarely change course' : 'analytical and flexible — you consider multiple angles before committing'}. ${ak ? `With ${ak.planet} as Atmakaraka, your deepest decisions are guided by ${ak.planet === 'Sun' ? 'a need for authority and recognition' : ak.planet === 'Moon' ? 'emotional security and connection' : ak.planet === 'Mars' ? 'courage and protective instinct' : ak.planet === 'Mercury' ? 'logic and adaptability' : ak.planet === 'Jupiter' ? 'wisdom and expansion' : ak.planet === 'Venus' ? 'harmony and relationship' : 'discipline and endurance'}.` : ''}`,
    hiddenInsecurities: `The ${getOrdinalSuffix(moonHouse)} house Moon ${moonHouse === 6 ? 'creates insecurity around health, service, and being useful enough' : moonHouse === 8 ? 'creates deep insecurities around trust, vulnerability, and the unknown' : moonHouse === 12 ? 'creates insecurities around isolation, spiritual worth, and hidden fears' : moonHouse === 10 ? 'creates insecurities around public image, achievement, and authority' : moonHouse === 7 ? 'creates insecurities around partnership, acceptance, and belonging' : 'creates emotional patterns tied to the house themes'}.`,
    publicVsPrivateSelf: `Your public persona (${lagnaSign} ascendant) is ${lagnaAttr.element === 'Fire' ? 'bold, visible, and commanding' : lagnaAttr.element === 'Earth' ? 'reliable, grounded, and practical' : lagnaAttr.element === 'Air' ? 'intellectual, social, and communicative' : 'emotional, intuitive, and nurturing'}, while your private emotional self (${moonSign} Moon) is ${moonAttr.element === 'Fire' ? 'passionate and restless' : moonAttr.element === 'Earth' ? 'sensual and comfort-seeking' : moonAttr.element === 'Air' ? 'curious and mentally active' : 'deeply sensitive and empathetic'}.`,
    intelligenceType: `Your intellectual nature is shaped by Mercury in ${positions['Mercury']?.sign ?? 'unknown sign'} — ${positions['Mercury']?.sign === 'Gemini' || positions['Mercury']?.sign === 'Virgo' ? 'sharp, analytical, and detail-oriented with excellent communication skills' : positions['Mercury']?.sign === 'Pisces' ? 'intuitive, imaginative, and holistic — you understand through feeling more than logic' : positions['Mercury']?.sign === 'Sagittarius' ? 'philosophical, expansive, and big-picture oriented' : 'versatile and adaptable with a practical intelligence'}.`,
    communicationStyle: `With ${lagnaSign} rising and Mercury in ${positions['Mercury']?.sign ?? 'unknown'}, you communicate ${lagnaAttr.element === 'Fire' ? 'with passion and directness' : lagnaAttr.element === 'Air' ? 'with articulation and persuasion' : lagnaAttr.element === 'Earth' ? 'with practicality and substance' : 'with empathy and emotional undertone'}.`,
    sexualEnergy: `Venus in ${positions['Venus']?.sign ?? 'unknown'} (${positions['Venus']?.sign === 'Scorpio' || positions['Venus']?.sign === 'Taurus' || positions['Venus']?.sign === 'Libra' ? 'intensifies sensual and romantic energy' : positions['Venus']?.sign === 'Aries' || positions['Venus']?.sign === 'Leo' ? 'creates passionate and enthusiastic romantic expression' : positions['Venus']?.sign === 'Pisces' ? 'gives idealistic, selfless, and deeply romantic nature' : 'creates a refined and balanced approach to intimacy'}) in the ${getOrdinalSuffix(positions['Venus'] ? getPlanetHouse(positions['Venus'], ascSignIndex) : 7)} house shapes your approach to intimacy and pleasure.`,
    riskAppetite: `Your risk tolerance is ${lagnaAttr.element === 'Fire' ? 'high — you are naturally bold and willing to take chances' : lagnaAttr.element === 'Earth' ? 'calculated — you take risks only when the odds are favorable' : lagnaAttr.element === 'Air' ? 'moderate — you intellectualize risk before acting' : 'cautious — you prefer emotional safety over adventure'}. ${marsPos && marsPos.sign === 'Aries' ? 'Mars in Aries amplifies your willingness to take bold risks.' : marsPos && marsPos.sign === 'Capricorn' ? 'Mars in Capricorn makes your risk-taking strategic and calculated.' : ''}`,
    keyFactors: {
      lagna: `${lagnaSign} ascendant gives you a ${lagnaAttr.element} nature with ${lagnaAttr.modality} energy. You present as ${lagnaAttr.element === 'Fire' ? 'confident and dynamic' : lagnaAttr.element === 'Earth' ? 'stable and reliable' : lagnaAttr.element === 'Air' ? 'intellectual and social' : 'emotional and intuitive'}.`,
      moon: `Moon in ${moonSign} (${getOrdinalSuffix(moonHouse)} house) — your emotional core is ${moonTraits[moonSign]?.split(',')[0] ?? 'deeply sensitive'}.`,
      sun: `Sun in ${sunSign} (${getOrdinalSuffix(sunHouse)} house) — your vital energy and life purpose centers on ${sunHouse === 10 ? 'career and public achievement' : sunHouse === 1 ? 'self-expression and identity' : sunHouse === 5 ? 'creativity and intelligence' : sunHouse === 9 ? 'wisdom and dharma' : 'the themes of the ' + getOrdinalSuffix(sunHouse) + ' house'}.`,
      atmakaraka: ak ? `${ak.planet} Atmakaraka in ${ak.sign} (${getOrdinalSuffix(ak.house)} house) — your soul's deepest desire is ${ak.planet === 'Sun' ? 'authority and recognition' : ak.planet === 'Moon' ? 'emotional fulfillment and connection' : ak.planet === 'Mars' ? 'courage and protection' : ak.planet === 'Mercury' ? 'intellectual mastery and communication' : ak.planet === 'Jupiter' ? 'wisdom and spiritual expansion' : ak.planet === 'Venus' ? 'harmony, beauty, and love' : 'discipline and enduring service'}.` : 'Atmakaraka analysis requires complete planetary data.',
      navamshaLagna: 'See Divisional Charts section for Navamsha ascendant analysis.',
      nakshatraInfluence: `Moon in ${moonPos?.nakshatra ?? 'unknown'} nakshatra shapes your deepest psychological patterns and emotional responses. See Nakshatra Deep Analysis for full details.`,
    },
    personalityArchetype: archetype,
    archetypeDescription: archetypeDescs[archetype] ?? 'Your archetype reflects a unique blend of planetary influences.',
    ayurvedicConstitution: constitution,
  };
}

// ─── 2. Karma & Past Life ──────────────────────────────────────────────────

function generateKarmaPatterns(
  positions: Record<string, PlanetPosition>,
  ascSignIndex: number,
  karakas: KarakaData[],
) {
  const rahuPos = positions['Rahu'];
  const ketuPos = positions['Ketu'];
  const saturnPos = positions['Saturn'];
  const ak = karakas.find(k => k.type === 'Atmakaraka');
  const gk = karakas.find(k => k.type === 'Gnatikaraka');
  const rahuHouse = rahuPos ? getPlanetHouse(rahuPos, ascSignIndex) : 0;
  const ketuHouse = ketuPos ? getPlanetHouse(ketuPos, ascSignIndex) : 0;

  const rahuHouseKarma: Record<number, string> = {
    1: 'Past life imbalance around identity and self-expression — you are driven to establish your unique identity in this lifetime.',
    2: 'Past life issues around wealth and values — you may experience intense desire for or fear of financial security.',
    3: 'Past life around communication and courage — unfinished business with siblings or self-effort.',
    4: 'Past life around home, mother, and emotional security — deep longing for inner peace and belonging.',
    5: 'Past life around creativity and intelligence — you may feel driven to prove your creative worth.',
    6: 'Past life around service and health — karmic debts around helping others or being in servitude.',
    7: 'Past life around partnerships — intense karmic contracts in marriage and business relationships.',
    8: 'Past life around hidden knowledge and transformation — you carry deep ancestral and occult karma.',
    9: 'Past life around dharma and father — you are driven to seek higher truth and may have conflicts with belief systems.',
    10: 'Past life around status and authority — obsession with achievement due to past life imbalance around power.',
    11: 'Past life around gains and social networks — karmic lessons around friendship, community, and desires.',
    12: 'Past life around liberation and surrender — you carry the deepest spiritual karma and may feel a pull toward isolation or meditation.',
  };

  const ketuHouseMastery: Record<number, string> = {
    1: 'You have already mastered self-assertion in past lives — now you seek to move beyond the ego while maintaining your individuality.',
    2: 'Past mastery of wealth and speech — you may feel detached from material accumulation, knowing it is not the source of fulfillment.',
    3: 'Past mastery of courage and communication — you have natural skill but feel little need to prove yourself.',
    4: 'Past mastery of home and emotional security — you intuitively understand domestic harmony but may feel restless at home.',
    5: 'Past mastery of creativity and intelligence — you have innate talent but may struggle to find fresh inspiration.',
    6: 'Past mastery of overcoming obstacles — you handle challenges with ease but may feel unchallenged.',
    7: 'Past mastery of partnerships — you understand relationships deeply but may feel detached from the need for partnership.',
    8: 'Past mastery of transformation and hidden knowledge — you have natural occult abilities but may fear using them.',
    9: 'Past mastery of dharma and philosophy — you have innate wisdom but may reject traditional religious structures.',
    10: 'Past mastery of career and authority — you can lead naturally but may feel little drive for external recognition.',
    11: 'Past mastery of social influence — you understand networks but may prefer solitude over social climbing.',
    12: 'Past mastery of liberation — you are naturally inclined toward meditation and detachment from the material world.',
  };

  const dushtanaHouses = [6, 8, 12];
  const planetsInDushtana = Object.entries(positions)
    .filter(([, pos]) => dushtanaHouses.includes(getPlanetHouse(pos, ascSignIndex)))
    .map(([name]) => name);

  return {
    pastLifeTendencies: rahuPos ? `Rahu in the ${getOrdinalSuffix(rahuHouse)} house indicates ${rahuHouseKarma[rahuHouse] ?? 'karmic patterns related to this house\'s themes'}. Rahu in ${rahuPos.sign} amplifies ${rahuPos.sign === 'Taurus' || rahuPos.sign === 'Libra' ? 'desire for material comfort and relationship security' : rahuPos.sign === 'Aries' || rahuPos.sign === 'Scorpio' ? 'drive for power, independence, and transformation' : rahuPos.sign === 'Gemini' || rahuPos.sign === 'Virgo' ? 'intellectual ambition and need for mental validation' : rahuPos.sign === 'Cancer' || rahuPos.sign === 'Pisces' ? 'emotional seeking and spiritual longing' : rahuPos.sign === 'Leo' ? 'desire for recognition, authority, and creative expression' : rahuPos.sign === 'Sagittarius' || rahuPos.sign === 'Aquarius' ? 'quest for higher knowledge, freedom, and unconventional wisdom' : 'intense ambition and karmic drive'}.` : 'Rahu analysis requires complete data.',
    unfinishedKarmas: `${ak ? `With ${ak.planet} as Atmakaraka, your primary unfinished karma involves ${ak.planet === 'Sun' ? 'developing authentic authority without ego' : ak.planet === 'Moon' ? 'achieving emotional wholeness without dependency' : ak.planet === 'Mars' ? 'channeling courage constructively without destruction' : ak.planet === 'Mercury' ? 'turning knowledge into wisdom through lived experience' : ak.planet === 'Jupiter' ? 'embodying the wisdom you teach' : ak.planet === 'Venus' ? 'finding love that transforms rather than merely pleases' : 'finding liberation through discipline rather than suffering'}.` : ''} ${gk ? `${gk.planet} as Gnatikaraka indicates karmic obstacles around ${gk.planet === 'Sun' ? 'authority and self-worth' : gk.planet === 'Moon' ? 'emotional stability and mother karma' : gk.planet === 'Mars' ? 'conflict, injury, and impulsive action' : gk.planet === 'Mercury' ? 'communication, analysis, and overthinking' : gk.planet === 'Jupiter' ? 'excess, misplaced trust, and over-optimism' : gk.planet === 'Venus' ? 'indulgence, relationship conflicts, and misplaced affection' : 'delays, isolation, and chronic struggle'}.` : ''}`,
    repeatingSufferingLoops: `Ketu in the ${getOrdinalSuffix(ketuHouse)} house suggests ${ketuHouseMastery[ketuHouse] ?? 'areas of past-life mastery that now create detachment'}. ${planetsInDushtana.length > 0 ? `Planets in dushtana houses (${planetsInDushtana.join(', ')}) create karmic pressure points that may trigger repeating patterns of suffering, especially around ${planetsInDushtana.includes('Saturn') ? 'endurance and restriction' : ''} ${planetsInDushtana.includes('Rahu') ? 'obsession and illusion' : ''} ${planetsInDushtana.includes('Mars') ? 'conflict and health' : ''} ${planetsInDushtana.includes('Moon') ? 'emotional instability' : ''}.` : ''}`,
    debtsToward: [
      ...(rahuHouse === 6 || rahuHouse === 8 || rahuHouse === 12 ? ['Society and service — karmic debts through helping others'] : []),
      ...(ketuHouse === 4 || ketuHouse === 9 ? ['Family and ancestors — debts toward parents and lineage'] : []),
      ...(rahuHouse === 7 ? ['Spouse and partners — intense karmic contracts in relationships'] : []),
      ...(rahuHouse === 5 || ketuHouse === 5 ? ['Children and creative expression — karmic lessons through progeny'] : []),
      'Self — the deepest debt is toward your own soul evolution',
    ],
    areasForcingHumility: saturnPos ? `Saturn in ${saturnPos.sign} (${getOrdinalSuffix(getPlanetHouse(saturnPos, ascSignIndex))} house) creates areas where life demands patience and humility — ${getPlanetHouse(saturnPos, ascSignIndex) === 1 ? 'personal identity and health' : getPlanetHouse(saturnPos, ascSignIndex) === 4 ? 'home, mother, and emotional security' : getPlanetHouse(saturnPos, ascSignIndex) === 7 ? 'marriage and partnerships' : getPlanetHouse(saturnPos, ascSignIndex) === 10 ? 'career and public reputation' : 'the themes of the ' + getOrdinalSuffix(getPlanetHouse(saturnPos, ascSignIndex)) + ' house'}. These are not punishments — they are areas where lasting growth requires sustained effort.` : 'Saturn placement determines areas of required humility.',
    whyCertainPainRepeats: `Pain repeats when its karmic lesson remains unlearned. ${rahuPos ? `Rahu in the ${getOrdinalSuffix(rahuHouse)} house creates a compulsive pattern — you are drawn to the house themes repeatedly until you transform desire into wisdom.` : ''} ${ketuPos ? `Ketu in the ${getOrdinalSuffix(ketuHouse)} house creates detachment patterns — you may abandon what you have already mastered, creating a void that calls you back.` : ''} The key is to act with awareness rather than compulsion, and to accept rather than resist the lessons embedded in your chart.`,
    keyIndicators: {
      rahuAnalysis: rahuPos ? `Rahu in ${rahuPos.sign} (${getOrdinalSuffix(rahuHouse)} house) — your karmic hunger and past-life imbalance center on ${rahuHouseKarma[rahuHouse]?.split('—')[0]?.trim() ?? 'this area'}.` : '',
      ketuAnalysis: ketuPos ? `Ketu in ${ketuPos.sign} (${getOrdinalSuffix(ketuHouse)} house) — your past-life mastery and current detachment ${ketuHouseMastery[ketuHouse]?.split('—')[0]?.trim() ?? 'in this area'}.` : '',
      sixthHouseAnalysis: getHouseLordAnalysis(6, positions, ascSignIndex),
      eighthHouseAnalysis: getHouseLordAnalysis(8, positions, ascSignIndex),
      twelfthHouseAnalysis: getHouseLordAnalysis(12, positions, ascSignIndex),
      saturnAnalysis: saturnPos ? `Saturn in ${saturnPos.sign} (${getOrdinalSuffix(getPlanetHouse(saturnPos, ascSignIndex))} house) — the planet of karma demands ${isDebilitated('Saturn', saturnPos.sign) ? 'extra effort and endurance' : isExalted('Saturn', saturnPos.sign) ? 'disciplined action with eventual reward' : 'patience and persistence'} in its house themes.` : '',
      atmakarakaKarmicLesson: ak ? `${ak.planet} Atmakaraka — the soul\'s primary karmic lesson is to develop ${ak.planet === 'Sun' ? 'authentic leadership' : ak.planet === 'Moon' ? 'emotional self-sufficiency' : ak.planet === 'Mars' ? 'constructive courage' : ak.planet === 'Mercury' ? 'wisdom through experience' : ak.planet === 'Jupiter' ? 'humble generosity' : ak.planet === 'Venus' ? 'transformative love' : 'liberation through service'}.` : '',
      karakamshaAnalysis: 'See Divisional Charts section for Karakamsha (AK in Navamsha) analysis.',
    },
  };
}

// ─── 3-12: Remaining sections (abbreviated for file size) ────────────────

function generateCareerDharma(positions: Record<string, PlanetPosition>, ascSignIndex: number, vargas: Record<VargaType, ReturnType<typeof calculateAllDivisionalCharts>[VargaType]>) {
  const d10 = vargas.D10;
  const tenthLord = getSignLord(ZODIAC_SIGNS[(ascSignIndex + 9) % 12] as ZodiacSign);
  const tenthLordPos = positions[tenthLord];
  const d10Asc = d10.ascendantSign;
  const industryMap: Record<string, string[]> = {
    Aries: ['Defense', 'Sports', 'Surgery', 'Engineering', 'Entrepreneurship'],
    Taurus: ['Finance', 'Agriculture', 'Real Estate', 'Food Industry', 'Banking'],
    Gemini: ['Media', 'Writing', 'IT', 'Marketing', 'Telecommunications'],
    Cancer: ['Healthcare', 'Hospitality', 'Education', 'Nutrition', 'Social Work'],
    Leo: ['Government', 'Entertainment', 'Leadership', 'Fashion', 'Politics'],
    Virgo: ['Accounting', 'Data Analysis', 'Healthcare', 'Research', 'Quality Control'],
    Libra: ['Law', 'Diplomacy', 'Design', 'Counseling', 'Partnership Management'],
    Scorpio: ['Research', 'Surgery', 'Investigation', 'Insurance', 'Occult Sciences'],
    Sagittarius: ['Teaching', 'Travel', 'Publishing', 'Philosophy', 'Sports'],
    Capricorn: ['Government', 'Construction', 'Management', 'Mining', 'Administration'],
    Aquarius: ['Technology', 'Social Reform', 'Innovation', 'Aviation', 'Non-profit'],
    Pisces: ['Healing Arts', 'Marine', 'Spiritual Counseling', 'Film', 'Charity'],
  };

  return {
    naturalSkillPattern: `${tenthLord} as 10th house lord ${tenthLordPos ? `in ${tenthLordPos.sign} (${getOrdinalSuffix(getPlanetHouse(tenthLordPos, ascSignIndex))} house)` : ''} gives you natural skills in ${tenthLord === 'Sun' ? 'leadership, governance, and visibility' : tenthLord === 'Moon' ? 'public relations, nurturing, and emotional intelligence' : tenthLord === 'Mars' ? 'execution, strategy, and competitive fields' : tenthLord === 'Mercury' ? 'communication, analysis, and commerce' : tenthLord === 'Jupiter' ? 'teaching, advising, and expansion' : tenthLord === 'Venus' ? 'creativity, aesthetics, and relationship management' : 'structure, endurance, and long-term planning'}.`,
    moneyBehavior: `2nd house lord analysis: ${getHouseLordAnalysis(2, positions, ascSignIndex)} This shapes your relationship with money — ${positions[getSignLord(ZODIAC_SIGNS[(ascSignIndex + 1) % 12] as ZodiacSign)]?.sign === ZODIAC_SIGNS[(ascSignIndex + 1) % 12] ? 'you tend to earn and retain wealth well' : 'you may experience fluctuating finances, requiring disciplined saving'}.`,
    authorityPotential: `${KENDRA_HOUSES.includes(getPlanetHouse(positions['Sun'] ?? positions['Mars']!, ascSignIndex)) ? 'Strong authority potential — Sun or Mars in a Kendra house gives natural command ability.' : 'Authority develops over time — you may need to work harder to earn recognition.'}`,
    entrepreneurshipVsEmployment: `${tenthLord === 'Mars' || tenthLord === 'Sun' || (positions['Rahu'] && [1, 10, 11].includes(getPlanetHouse(positions['Rahu'], ascSignIndex))) ? 'Entrepreneurial tendencies are strong — you are driven to build something independently.' : tenthLord === 'Saturn' || tenthLord === 'Moon' ? 'You may prefer structured environments initially, building toward independence over time.' : 'You can succeed in both paths — your choice depends on risk tolerance and life stage.'}`,
    famePotential: `${[1, 5, 9, 10].includes(getPlanetHouse(positions['Sun']!, ascSignIndex)) || [1, 10].includes(getPlanetHouse(positions['Jupiter']!, ascSignIndex)) ? 'Fame potential exists — Sun or Jupiter in visible houses creates public recognition opportunities.' : 'Recognition comes through sustained effort rather than sudden fame.'}`,
    industryCompatibility: industryMap[d10Asc] ?? ['General Business', 'Consulting', 'Management'],
    riskCapacity: `${positions['Rahu'] && [1, 5, 9, 10].includes(getPlanetHouse(positions['Rahu'], ascSignIndex)) ? 'High risk capacity — Rahu in key houses gives appetite for bold ventures.' : 'Moderate risk capacity — you prefer calculated risks with safety nets.'}`,
    wealthCreationCycles: `Your wealth creation is influenced by the 11th house lord: ${getHouseLordAnalysis(11, positions, ascSignIndex)} Gains come through ${getPlanetHouse(positions['Jupiter']!, ascSignIndex) === 11 ? 'Jupiter in the 11th house — natural expansion of income and social networks' : getPlanetHouse(positions['Venus']!, ascSignIndex) === 2 ? 'Venus influencing the 2nd house — wealth through creativity and partnerships' : 'steady effort and strategic investment over time'}.`,
    foreignLandsBenefit: [9, 12].includes(getPlanetHouse(positions['Rahu']!, ascSignIndex)) || [9, 12].includes(getPlanetHouse(positions['Saturn']!, ascSignIndex)),
    foreignLandsNote: `Rahu or Saturn in 9th/12th house ${[9, 12].includes(getPlanetHouse(positions['Rahu']!, ascSignIndex)) || [9, 12].includes(getPlanetHouse(positions['Saturn']!, ascSignIndex)) ? 'suggests foreign connections may benefit career and growth.' : 'does not strongly indicate foreign benefits.'}`,
    keyFactors: {
      secondHouseAnalysis: getHouseLordAnalysis(2, positions, ascSignIndex),
      sixthHouseAnalysis: getHouseLordAnalysis(6, positions, ascSignIndex),
      tenthHouseAnalysis: getHouseLordAnalysis(10, positions, ascSignIndex),
      eleventhHouseAnalysis: getHouseLordAnalysis(11, positions, ascSignIndex),
      d10CareerChart: `D10 (Dashamsha) ascendant is ${d10Asc} — career themes lean toward ${industryMap[d10Asc]?.slice(0, 3).join(', ') ?? 'professional achievement'}.`,
      arthaTrikona: `Artha Trikona (2nd, 6th, 10th houses) lords: ${[2, 6, 10].map(h => getSignLord(ZODIAC_SIGNS[(ascSignIndex + h - 1) % 12] as ZodiacSign)).join(', ')} — these planets drive your material success.`,
      dhanaYogasPresent: [] as string[],
      rajaYogasPresent: [] as string[],
    },
  };
}

function generateMarriageDynamics(positions: Record<string, PlanetPosition>, ascSignIndex: number, karakas: KarakaData[], vargas: Record<VargaType, ReturnType<typeof calculateAllDivisionalCharts>[VargaType]>) {
  const dk = karakas.find(k => k.type === 'Darakaraka');
  const d9 = vargas.D9;
  const seventhLord = getSignLord(ZODIAC_SIGNS[(ascSignIndex + 6) % 12] as ZodiacSign);
  const seventhLordPos = positions[seventhLord];
  const venusPos = positions['Venus'];
  const jupiterPos = positions['Jupiter'];

  return {
    attractionPattern: `You are attracted to partners who embody ${dk ? `${dk.planet === 'Sun' ? 'confidence, authority, and warmth' : dk.planet === 'Moon' ? 'emotional depth, nurturing, and sensitivity' : dk.planet === 'Mars' ? 'energy, strength, and decisiveness' : dk.planet === 'Mercury' ? 'intelligence, wit, and communication' : dk.planet === 'Jupiter' ? 'wisdom, generosity, and moral strength' : dk.planet === 'Venus' ? 'beauty, refinement, and artistic sensibility' : 'maturity, stability, and reliability'}` : 'qualities indicated by your 7th house'}. ${dk ? `With ${dk.planet} as Darakaraka in ${dk.sign}, your spouse may have ${dk.sign === 'Aries' || dk.sign === 'Leo' ? 'a strong, confident personality' : dk.sign === 'Taurus' || dk.sign === 'Cancer' ? 'a nurturing, stable nature' : dk.sign === 'Gemini' || dk.sign === 'Virgo' ? 'an intellectual, communicative disposition' : dk.sign === 'Libra' || dk.sign === 'Pisces' ? 'a refined, artistic temperament' : dk.sign === 'Scorpio' || dk.sign === 'Capricorn' ? 'a deep, determined character' : 'an adventurous, philosophical outlook'}.` : ''}`,
    emotionalCompatibility: `Emotional compatibility in relationships is governed by Moon in ${positions['Moon']?.sign ?? 'unknown'} and Venus in ${venusPos?.sign ?? 'unknown'}. ${venusPos?.sign === 'Taurus' || venusPos?.sign === 'Libra' ? 'Venus in its own sign gives strong capacity for emotional partnership.' : venusPos?.sign === 'Scorpio' ? 'Venus in Scorpio creates intense, transformative emotional bonds.' : 'Your emotional needs in partnership are shaped by the interplay of Moon and Venus.'}`,
    dominanceIssues: `${seventhLordPos && getPlanetHouse(seventhLordPos, ascSignIndex) === 1 ? 'Partnership may bring dominance dynamics — the 7th lord in the 1st house suggests your partner strongly influences your identity.' : seventhLordPos && [10, 11].includes(getPlanetHouse(seventhLordPos, ascSignIndex)) ? 'Your partner may hold social or professional authority in the relationship.' : 'Power dynamics in relationships are relatively balanced, with natural negotiation.'}`,
    loyaltyIndicators: `Jupiter ${jupiterPos ? `in ${jupiterPos.sign} (${getOrdinalSuffix(getPlanetHouse(jupiterPos, ascSignIndex))} house)` : 'position unknown'} ${jupiterPos && TRIKONA_HOUSES.includes(getPlanetHouse(jupiterPos, ascSignIndex)) ? 'in a Trikona house suggests strong moral and ethical commitment in relationships.' : 'indicates that loyalty develops through shared values and mutual growth.'}`,
    delays: `${positions['Saturn'] && [1, 7].includes(getPlanetHouse(positions['Saturn'], ascSignIndex)) ? 'Saturn in the 1st or 7th house may delay marriage — this delay often brings a more mature and stable partnership.' : positions['Rahu'] && getPlanetHouse(positions['Rahu'], ascSignIndex) === 7 ? 'Rahu in the 7th house may create unconventional timing or circumstances around marriage.' : 'No strong indicators of significant delay in partnership.'}`,
    divorcePotential: `${positions['Mars'] && [1, 4, 7, 8, 12].includes(getPlanetHouse(positions['Mars'], ascSignIndex)) ? 'Mangal Dosha creates some friction in domestic harmony — awareness and matching with a compatible partner mitigates this.' : positions['Rahu'] && getPlanetHouse(positions['Rahu'], ascSignIndex) === 7 ? 'Rahu in the 7th house can create illusions in partnership — honesty and transparency are essential.' : 'No strong indicators of separation — relationships require effort as always.'}`,
    powerImbalance: dk ? `With ${dk.planet} Darakaraka in the ${getOrdinalSuffix(dk.house)} house, ${dk.house === 1 || dk.house === 10 ? 'you or your partner may hold more visible authority' : dk.house === 4 || dk.house === 7 ? 'power is more equally distributed through emotional and domestic negotiation' : dk.house === 8 || dk.house === 12 ? 'power dynamics may be hidden or involve sacrifice' : 'power dynamics evolve naturally over time'}.` : 'Power dynamics depend on Darakaraka placement.',
    spousePsychology: dk ? `Your spouse is likely ${dk.planet === 'Sun' ? 'authoritative, warm, and self-expressive — they may come from a leadership or government background' : dk.planet === 'Moon' ? 'nurturing, intuitive, and emotionally intelligent — they may be from a caring or public profession' : dk.planet === 'Mars' ? 'energetic, decisive, and protective — they may be from technical or competitive fields' : dk.planet === 'Mercury' ? 'intellectual, communicative, and versatile — they may be from business, writing, or teaching' : dk.planet === 'Jupiter' ? 'wise, traditional, and generous — they may be from education, law, or spiritual backgrounds' : dk.planet === 'Venus' ? 'refined, artistic, and romantic — they may be from creative, design, or luxury fields' : 'mature, disciplined, and reliable — they may be older or from structured professions'}.` : 'Spouse psychology is indicated by Darakaraka analysis.',
    marriageTiming: 'Marriage timing is best assessed through Vimshottari Dasha periods that activate the 7th house, its lord, or the Darakaraka. See Timing section for current dasha analysis.',
    qualityOfMarriedLife: `D9 (Navamsha) ascendant is ${d9.ascendantSign} — this reveals the inner quality of marriage. ${d9.ascendantSign === ZODIAC_SIGNS[ascSignIndex] ? 'Same ascendant in D1 and D9 (Vargottama) creates exceptional consistency between personal identity and partnership needs.' : `The shift from ${ZODIAC_SIGNS[ascSignIndex]} in D1 to ${d9.ascendantSign} in D9 indicates that your inner partnership needs may differ from your outer persona — integration of both creates marital harmony.`}`,
    repeatingPatterns: `Relationship patterns repeat when the karmic lesson of the 7th house remains unlearned. ${seventhLordPos ? `With 7th lord ${seventhLord} in the ${getOrdinalSuffix(getPlanetHouse(seventhLordPos, ascSignIndex))} house, your relationships tend to activate themes of ${HOUSE_SIGNIFICANCES.find(h => h.number === getPlanetHouse(seventhLordPos, ascSignIndex))?.name ?? 'life experience'}.` : ''}`,
    keyFactors: {
      seventhHouseAnalysis: getHouseLordAnalysis(7, positions, ascSignIndex),
      venusAnalysis: venusPos ? `Venus in ${venusPos.sign} (${getOrdinalSuffix(getPlanetHouse(venusPos, ascSignIndex))} house) — ${isExalted('Venus', venusPos.sign) ? 'exalted, giving exceptional capacity for love and beauty' : isDebilitated('Venus', venusPos.sign) ? 'debilitated, requiring conscious effort in relationships and self-worth' : isInOwnSign('Venus', venusPos.sign) ? 'in own sign, giving strong and authentic relationship energy' : 'in a neutral position, expressing love naturally'}.` : '',
      jupiterAnalysis: jupiterPos ? `Jupiter in ${jupiterPos.sign} (${getOrdinalSuffix(getPlanetHouse(jupiterPos, ascSignIndex))} house) — ${TRIKONA_HOUSES.includes(getPlanetHouse(jupiterPos, ascSignIndex)) ? 'in a Trikona house, providing dharmic wisdom in relationships' : KENDRA_HOUSES.includes(getPlanetHouse(jupiterPos, ascSignIndex)) ? 'in a Kendra house, giving active wisdom and growth through partnership' : 'influencing relationship philosophy from its house position'}.` : '',
      navamshaD9Analysis: `D9 ascendant ${d9.ascendantSign} with lord ${getSignAttributes(d9.ascendantSign).ruler} — the inner marriage is shaped by ${getSignAttributes(d9.ascendantSign).ruler === 'Sun' ? 'authority and self-expression' : getSignAttributes(d9.ascendantSign).ruler === 'Moon' ? 'emotion and nurturing' : getSignAttributes(d9.ascendantSign).ruler === 'Mars' ? 'energy and initiative' : getSignAttributes(d9.ascendantSign).ruler === 'Mercury' ? 'intellect and communication' : getSignAttributes(d9.ascendantSign).ruler === 'Jupiter' ? 'wisdom and expansion' : getSignAttributes(d9.ascendantSign).ruler === 'Venus' ? 'harmony and beauty' : 'discipline and endurance'}.`,
      darakarakaAnalysis: dk ? `${dk.planet} Darakaraka in ${dk.sign} (${getOrdinalSuffix(dk.house)} house)` : 'Darakaraka not determined.',
      nakshatraCompatibility: `Your Moon nakshatra (${positions['Moon']?.nakshatra ?? 'unknown'}) determines compatibility patterns in the traditional Koota system. Same nakshatra or complementary yoni/gana combinations create the strongest bonds.`,
    },
  };
}

function generateHealthTendencies(positions: Record<string, PlanetPosition>, ascSignIndex: number) {
  const constitution = getAyurvedicConstitution(ZODIAC_SIGNS[ascSignIndex] as ZodiacSign, positions['Moon']?.sign ?? 'Aries');
  const sixthLord = getSignLord(ZODIAC_SIGNS[(ascSignIndex + 5) % 12] as ZodiacSign);
  const marsHouse = positions['Mars'] ? getPlanetHouse(positions['Mars'], ascSignIndex) : 0;
  const moonHouse = positions['Moon'] ? getPlanetHouse(positions['Moon'], ascSignIndex) : 0;

  const weakOrgans: string[] = [];
  if (positions['Saturn'] && [6, 8, 12].includes(getPlanetHouse(positions['Saturn'], ascSignIndex))) weakOrgans.push('Joints, bones, teeth (Saturn affliction)');
  if (positions['Mars'] && [6, 8].includes(marsHouse)) weakOrgans.push('Blood, inflammation, injuries (Mars in dushtana)');
  if (positions['Moon'] && [6, 8, 12].includes(moonHouse)) weakOrgans.push('Mental health, fluids, digestion (Moon affliction)');
  if (positions['Rahu'] && [6, 8, 12].includes(getPlanetHouse(positions['Rahu'], ascSignIndex))) weakOrgans.push('Immune system, toxins, addictions (Rahu affliction)');
  if (weakOrgans.length === 0) weakOrgans.push('No major organ vulnerability indicated — maintain regular health practices');

  return {
    weakOrgans,
    chronicDiseaseTendency: positions['Saturn'] && [6, 8].includes(getPlanetHouse(positions['Saturn'], ascSignIndex)) ? 'Saturn in 6th or 8th house indicates potential for chronic conditions that develop slowly. Regular check-ups and preventive care are important.' : 'No strong chronic disease indicators — maintain healthy lifestyle practices.',
    stressPattern: moonHouse === 6 || moonHouse === 12 ? 'Moon in 6th or 12th house creates vulnerability to stress-related conditions — meditation and emotional processing are essential.' : 'Stress patterns are manageable with proper self-care and emotional awareness.',
    mentalInstability: positions['Moon'] && (positions['Rahu'] && positions['Moon'].signIndex === positions['Rahu'].signIndex) ? 'Moon-Rahu conjunction (Chandra Grahan) creates periods of mental turbulence and emotional confusion — grounding practices and therapy are beneficial.' : positions['Moon'] && (positions['Ketu'] && positions['Moon'].signIndex === positions['Ketu'].signIndex) ? 'Moon-Ketu conjunction creates emotional detachment and spiritual seeking — stay connected to supportive relationships.' : 'No strong indicators of mental instability — emotional self-awareness practices support ongoing well-being.',
    accidentVulnerability: marsHouse === 8 || marsHouse === 6 ? 'Mars in 6th or 8th house increases accident vulnerability — be cautious with vehicles, fire, and sharp objects.' : 'No strong accident vulnerability — standard safety practices are sufficient.',
    addictionTendencies: positions['Rahu'] && [6, 12].includes(getPlanetHouse(positions['Rahu'], ascSignIndex)) ? 'Rahu in 6th or 12th house can create tendencies toward escapist behaviors — mindfulness and healthy outlets are important.' : 'No strong addiction indicators — practice moderation in all habits.',
    ayurvedicConstitution: constitution.dosha,
    ayurvedicNote: constitution.note,
    keyFactors: {
      sixthHouseAnalysis: getHouseLordAnalysis(6, positions, ascSignIndex),
      eighthHouseAnalysis: getHouseLordAnalysis(8, positions, ascSignIndex),
      twelfthHouseAnalysis: getHouseLordAnalysis(12, positions, ascSignIndex),
      saturnAnalysis: positions['Saturn'] ? `Saturn in ${positions['Saturn'].sign} (${getOrdinalSuffix(getPlanetHouse(positions['Saturn'], ascSignIndex))} house)` : '',
      marsAnalysis: positions['Mars'] ? `Mars in ${positions['Mars'].sign} (${getOrdinalSuffix(marsHouse)} house)` : '',
      moonAnalysis: positions['Moon'] ? `Moon in ${positions['Moon'].sign} (${getOrdinalSuffix(moonHouse)} house)` : '',
      rahuAnalysis: positions['Rahu'] ? `Rahu in ${positions['Rahu'].sign} (${getOrdinalSuffix(getPlanetHouse(positions['Rahu'], ascSignIndex))} house)` : '',
    },
  };
}

function generateTimingEvents(positions: Record<string, PlanetPosition>, ascSignIndex: number, kundali: ReturnType<typeof calculateKundali>) {
  const dasha = kundali.dashaPeriods;
  const currentMD = dasha.currentMahadasha;
  const currentAD = dasha.currentAntardasha;
  const upcoming = dasha.allMahadashas
    .filter(d => d.startDate > new Date())
    .slice(0, 3)
    .map(d => {
      const interp = getDashaInterpretation(d.planet);
      return {
        period: `${d.planet} Mahadasha`,
        planet: d.planet,
        startDate: d.startDate.toISOString().split('T')[0],
        endDate: d.endDate.toISOString().split('T')[0],
        interpretation: interp.generalEffect,
        areasAffected: interp.areasAffected,
      };
    });

  return {
    currentMahadasha: currentMD ? `${currentMD.planet} Mahadasha (${currentMD.startDate.toISOString().split('T')[0]} to ${currentMD.endDate.toISOString().split('T')[0]})` : 'Unknown',
    currentAntardasha: currentAD ? `${currentAD.planet} Antardasha (${currentAD.startDate.toISOString().split('T')[0]} to ${currentAD.endDate.toISOString().split('T')[0]})` : 'Unknown',
    dashaInterpretation: currentMD ? getDashaInterpretation(currentMD.planet).generalEffect : 'Dasha interpretation unavailable.',
    upcomingPeriods: upcoming,
    gocharInfluence: 'Current transit influences are detailed in the Planetary Transits section of Insights.',
    keyTimingFactors: `Timing in Vedic astrology uses Vimshottari Dasha (planetary periods) and Gochar (transits). The most significant life events occur when dasha periods activate important house lords and yogas in the chart. Your current ${currentMD?.planet ?? ''} Mahadasha activates the ${currentMD ? getOrdinalSuffix(getPlanetHouse(positions[currentMD.planet]!, ascSignIndex)) : ''} house themes.`,
  };
}

function generateSpiritualEvolution(positions: Record<string, PlanetPosition>, ascSignIndex: number, vargas: Record<VargaType, ReturnType<typeof calculateAllDivisionalCharts>[VargaType]>) {
  const ketuPos = positions['Ketu'];
  const jupiterPos = positions['Jupiter'];
  const d20 = vargas.D20;
  const twelfthLord = getSignLord(ZODIAC_SIGNS[(ascSignIndex + 11) % 12] as ZodiacSign);

  return {
    mokshaTendency: ketuPos && [4, 9, 12].includes(getPlanetHouse(ketuPos, ascSignIndex)) ? 'Strong moksha tendency — Ketu in a moksha house creates deep spiritual longing and natural detachment from material bondage.' : 'Moderate moksha tendency — spiritual seeking develops through life experience and conscious practice.',
    spiritualInclination: jupiterPos && [9, 12].includes(getPlanetHouse(jupiterPos, ascSignIndex)) ? 'Jupiter in 9th or 12th house gives natural spiritual inclination and dharmic understanding. You may be drawn to teaching, pilgrimage, or philosophical study.' : 'Spiritual inclination develops through seeking — you may find your path through questioning and personal exploration.',
    guruKarma: `9th house lord analysis: ${getHouseLordAnalysis(9, positions, ascSignIndex)} Your relationship with teachers and guides is ${TRIKONA_HOUSES.includes(getPlanetHouse(positions['Jupiter']!, ascSignIndex)) ? 'blessed — Jupiter in a Trikona house brings wise and supportive mentors.' : 'evolving — you may need to find your own spiritual path before the right teacher appears.'}`,
    detachmentLevel: ketuPos ? `Ketu in ${ketuPos.sign} (${getOrdinalSuffix(getPlanetHouse(ketuPos, ascSignIndex))} house) — your natural detachment is ${getPlanetHouse(ketuPos, ascSignIndex) === 12 ? 'very high — you are drawn to meditation, solitude, and spiritual practice' : getPlanetHouse(ketuPos, ascSignIndex) === 6 ? 'channeled through service — you find spiritual meaning in helping others' : getPlanetHouse(ketuPos, ascSignIndex) === 9 ? 'expressed through philosophy — you seek spiritual truth through higher learning' : 'moderate — you balance spiritual seeking with material engagement'}.` : 'Detachment level depends on Ketu placement.',
    meditationCapacity: `Your meditation capacity is ${d20.ascendantSign === 'Pisces' || d20.ascendantSign === 'Cancer' || d20.ascendantSign === 'Scorpio' ? 'naturally high — D20 ascendant in a water sign gives deep meditative absorption' : d20.ascendantSign === 'Sagittarius' || d20.ascendantSign === 'Aquarius' ? 'strong and exploratory — you approach meditation with curiosity and philosophical depth' : 'developing — regular practice will deepen your capacity over time'}.`,
    egoLessons: positions['Sun'] ? `Sun in ${positions['Sun'].sign} (${getOrdinalSuffix(getPlanetHouse(positions['Sun'], ascSignIndex))} house) — your ego lessons center on ${isExalted('Sun', positions['Sun'].sign) ? 'balancing confidence with humility — your natural authority must serve others' : isDebilitated('Sun', positions['Sun'].sign) ? 'developing authentic self-worth — your struggle with confidence is the path to genuine strength' : 'recognizing when self-expression serves versus when it dominates'}.` : '',
    materialTrapVsLiberation: `The balance between material engagement and spiritual liberation is shown by your 12th house lord: ${getHouseLordAnalysis(12, positions, ascSignIndex)} ${positions['Ketu'] && getPlanetHouse(positions['Ketu'], ascSignIndex) === 12 ? 'Ketu in the 12th house strongly favors liberation — you are wired for moksha in this lifetime.' : 'Both material engagement and spiritual seeking are important paths for your evolution.'}`,
    keyFactors: {
      ketuAnalysis: ketuPos ? `Ketu in ${ketuPos.sign} (${getOrdinalSuffix(getPlanetHouse(ketuPos, ascSignIndex))} house)` : '',
      twelfthHouseAnalysis: getHouseLordAnalysis(12, positions, ascSignIndex),
      jupiterAnalysis: jupiterPos ? `Jupiter in ${jupiterPos.sign} (${getOrdinalSuffix(getPlanetHouse(jupiterPos, ascSignIndex))} house)` : '',
      d20SpiritualityChart: `D20 (Vimshamsha) ascendant is ${d20.ascendantSign} — your spiritual nature expresses through ${getSignElement(d20.ascendantSign) === 'Fire' ? 'devotional intensity and transformative practice' : getSignElement(d20.ascendantSign) === 'Water' ? 'deep meditation, surrender, and emotional purification' : getSignElement(d20.ascendantSign) === 'Air' ? 'intellectual understanding, breath work, and philosophical inquiry' : 'structured practice, ritual, and disciplined devotion'}.`,
      mokshaHouses: `Moksha houses (4th, 8th, 12th) contain: ${[4, 8, 12].map(h => { const signIdx = (ascSignIndex + h - 1) % 12; const planetsInHouse = Object.entries(positions).filter(([, p]) => getPlanetHouse(p, ascSignIndex) === h).map(([n]) => n); return `${getOrdinalSuffix(h)}: ${ZODIAC_SIGNS[signIdx]}${planetsInHouse.length ? ' (' + planetsInHouse.join(', ') + ')' : ''}`; }).join(', ')}`,
    },
  };
}

function generateFamilyKarma(positions: Record<string, PlanetPosition>, ascSignIndex: number, vargs: Record<VargaType, ReturnType<typeof calculateAllDivisionalCharts>[VargaType]>) {
  const sunPos = positions['Sun'];
  const moonPos = positions['Moon'];
  const d12 = vargs.D12;

  return {
    fatherRelationship: sunPos ? `Sun in ${sunPos.sign} (${getOrdinalSuffix(getPlanetHouse(sunPos, ascSignIndex))} house) — your relationship with your father is ${getPlanetHouse(sunPos, ascSignIndex) === 9 ? 'strongly dharmic — he may be a teacher or moral guide in your life' : getPlanetHouse(sunPos, ascSignIndex) === 10 ? 'focused on authority and public image — he may be a significant career influence' : getPlanetHouse(sunPos, ascSignIndex) === 4 ? 'protective and nurturing — he provides emotional security' : [6, 8, 12].includes(getPlanetHouse(sunPos, ascSignIndex)) ? 'challenging — there may be distance, conflict, or karmic lessons in the father relationship' : 'significant in shaping your identity and self-expression'}. ${isExalted('Sun', sunPos.sign) ? 'Sun exalted gives a strong, respected father figure.' : isDebilitated('Sun', sunPos.sign) ? 'Sun debilitated suggests father relationship requires healing and understanding.' : ''}` : 'Father relationship analysis requires Sun position.',
    motherPsychology: moonPos ? `Moon in ${moonPos.sign} (${getOrdinalSuffix(getPlanetHouse(moonPos, ascSignIndex))} house) — your mother is emotionally ${getSignElement(moonPos.sign) === 'Water' ? 'deep and intuitive, profoundly shaping your emotional foundation' : getSignElement(moonPos.sign) === 'Fire' ? 'dynamic and warm, instilling courage and enthusiasm' : getSignElement(moonPos.sign) === 'Earth' ? 'practical and nurturing, providing stability and security' : 'intellectual and communicative, emphasizing education and adaptability'}. ${isExalted('Moon', moonPos.sign) ? 'Exalted Moon gives an exceptionally nurturing mother.' : isDebilitated('Moon', moonPos.sign) ? 'Debilitated Moon suggests emotional challenges in the mother relationship that require conscious healing.' : ''}` : 'Mother analysis requires Moon position.',
    ancestorKarma: `9th house analysis: ${getHouseLordAnalysis(9, positions, ascSignIndex)} ${positions['Rahu'] && getPlanetHouse(positions['Rahu'], ascSignIndex) === 9 ? 'Rahu in the 9th house indicates strong ancestral karma — there may be unfinished dharma from the father\'s lineage that you are here to resolve.' : ''} ${positions['Sun'] && positions['Rahu'] && positions['Sun'].signIndex === positions['Rahu'].signIndex ? 'Sun-Rahu conjunction (Pitra Dosha) indicates ancestral debts requiring attention — performing Tarpan and honoring ancestors can help resolve these.' : ''}`,
    familyWealthPatterns: `2nd house analysis: ${getHouseLordAnalysis(2, positions, ascSignIndex)} Family wealth patterns are ${positions['Jupiter'] && [2, 11].includes(getPlanetHouse(positions['Jupiter'], ascSignIndex)) ? 'generally positive — Jupiter in wealth houses supports family prosperity.' : positions['Saturn'] && [2, 8].includes(getPlanetHouse(positions['Saturn'], ascSignIndex)) ? 'built through slow, steady effort — family wealth may have come through hard work and discipline.' : 'shaped by the interplay of 2nd and 11th house lords.'}`,
    familySufferingCycles: `8th house analysis: ${getHouseLordAnalysis(8, positions, ascSignIndex)} Family suffering patterns may ${positions['Saturn'] && getPlanetHouse(positions['Saturn'], ascSignIndex) === 8 ? 'be significant — Saturn in the 8th house indicates inherited struggles that require transformation.' : positions['Rahu'] && getPlanetHouse(positions['Rahu'], ascSignIndex) === 8 ? 'involve hidden family secrets or transformative karmic events.' : 'be minimal — the 8th house does not show extreme afflictions.'}`,
    childKarma: `5th house analysis: ${getHouseLordAnalysis(5, positions, ascSignIndex)} ${positions['Jupiter'] && getPlanetHouse(positions['Jupiter'], ascSignIndex) === 5 ? 'Jupiter in the 5th house blesses children and creative intelligence.' : ''} ${positions['Rahu'] && getPlanetHouse(positions['Rahu'], ascSignIndex) === 5 ? 'Rahu in the 5th house may create unconventional circumstances around children or creative expression.' : ''}`,
    responsibilityBurdens: `10th house analysis: ${getHouseLordAnalysis(10, positions, ascSignIndex)} ${positions['Saturn'] && [1, 10].includes(getPlanetHouse(positions['Saturn'], ascSignIndex)) ? 'Saturn in the 1st or 10th house creates a strong sense of responsibility that may feel burdensome but ultimately builds character and enduring success.' : 'Responsibility burdens are moderate — you carry what is needed without excessive weight.'}`,
    keyFactors: {
      fourthHouseAnalysis: getHouseLordAnalysis(4, positions, ascSignIndex),
      ninthHouseAnalysis: getHouseLordAnalysis(9, positions, ascSignIndex),
      tenthHouseAnalysis: getHouseLordAnalysis(10, positions, ascSignIndex),
      sunAnalysis: sunPos ? `Sun in ${sunPos.sign} (${getOrdinalSuffix(getPlanetHouse(sunPos, ascSignIndex))} house)` : '',
      moonAnalysis: moonPos ? `Moon in ${moonPos.sign} (${getOrdinalSuffix(getPlanetHouse(moonPos, ascSignIndex))} house)` : '',
      d12ParentChart: `D12 (Dwadashamsha) ascendant is ${d12.ascendantSign} — parental themes are colored by ${getSignElement(d12.ascendantSign) === 'Fire' ? 'authority, ambition, and leadership in the family' : getSignElement(d12.ascendantSign) === 'Earth' ? 'stability, tradition, and material security in the home' : getSignElement(d12.ascendantSign) === 'Air' ? 'communication, education, and intellectual values in upbringing' : 'emotion, intuition, and spiritual values in the family'}.`,
    },
  };
}

function generateHiddenPatterns(positions: Record<string, PlanetPosition>, ascSignIndex: number) {
  const rahuPos = positions['Rahu'];
  const rahuHouse = rahuPos ? getPlanetHouse(rahuPos, ascSignIndex) : 0;
  const strengths: string[] = [];

  // Identify hidden strengths based on dignities and placements
  for (const [name, pos] of Object.entries(positions)) {
    if (isExalted(name as Planet, pos.sign)) strengths.push(`${name} exalted — exceptional inner strength in ${name === 'Sun' ? 'authority and self-expression' : name === 'Moon' ? 'emotional intelligence' : name === 'Mars' ? 'courage and drive' : name === 'Mercury' ? 'intellect and communication' : name === 'Jupiter' ? 'wisdom and expansion' : name === 'Venus' ? 'love and creativity' : name === 'Saturn' ? 'discipline and endurance' : 'hidden potential'}`);
    if (isInOwnSign(name as Planet, pos.sign) && KENDRA_HOUSES.includes(getPlanetHouse(pos, ascSignIndex))) strengths.push(`${name} in own sign in Kendra — powerful and constructive expression`);
  }

  const saboteurMap: Record<number, string> = {
    1: 'Self-sabotage through over-identification with ego — learning to separate identity from roles.',
    2: 'Self-sabotage through financial anxiety or compulsive spending — healing the relationship with resources.',
    3: 'Self-sabotage through scattered energy or excessive competitiveness — focusing effort strategically.',
    4: 'Self-sabotage through emotional dependency or attachment to comfort — developing inner security.',
    5: 'Self-sabotage through seeking validation through creativity or romance — creating for intrinsic joy.',
    6: 'Self-sabotage through victimhood or excessive self-sacrifice — learning healthy boundaries.',
    7: 'Self-sabotage through losing identity in partnerships — maintaining individuality within connection.',
    8: 'Self-sabotage through fear of vulnerability or control issues — embracing transformation through surrender.',
    9: 'Self-sabotage through spiritual bypass or rigid beliefs — integrating wisdom with lived experience.',
    10: 'Self-sabotage through workaholism or excessive ambition — balancing achievement with inner fulfillment.',
    11: 'Self-sabotage through people-pleasing or scattered social energy — choosing meaningful connections over quantity.',
    12: 'Self-sabotage through escapism or isolation — balancing solitude with engagement.',
  };

  return {
    selfSabotage: rahuPos ? `Rahu in the ${getOrdinalSuffix(rahuHouse)} house creates a pattern: ${saboteurMap[rahuHouse] ?? 'tendency toward illusion and compulsive behavior in this area'}. Awareness is the first step to breaking the pattern.` : '',
    addictions: rahuHouse === 12 || rahuHouse === 6 ? 'Rahu in 6th or 12th house creates vulnerability to escapist habits — mindfulness practices and healthy routines are your protection.' : 'No strong addiction indicators — maintain balanced habits.',
    manipulativeBehavior: positions['Rahu'] && [7, 10].includes(rahuHouse) ? 'Rahu in 7th or 10th house can create tendencies toward strategic manipulation in relationships or career — practice transparency and authentic communication.' : 'No strong manipulative tendencies indicated.',
    egoTraps: positions['Sun'] && isExalted('Sun', positions['Sun'].sign) ? 'Exalted Sun creates a powerful ego — the trap is confusing authority with righteousness. True leadership serves others.' : positions['Sun'] && isDebilitated('Sun', positions['Sun'].sign) ? 'Debilitated Sun creates ego vulnerability — the trap is seeking validation externally. True confidence comes from within.' : 'Ego traps are moderate — stay aware of when self-interest overrides connection.',
    laziness: positions['Saturn'] && getPlanetHouse(positions['Saturn'], ascSignIndex) === 12 ? 'Saturn in the 12th house can manifest as periodic lethargy or lack of motivation — discipline routines help overcome inertia.' : 'No strong laziness indicators — you generally maintain productive energy.',
    escapism: rahuHouse === 12 ? 'Strong escapism tendency with Rahu in the 12th house — you may avoid reality through fantasy, substances, or excessive spirituality. Ground yourself in practical action.' : 'Escapism is not a dominant pattern — you generally face reality directly.',
    obsession: rahuHouse === 5 || rahuHouse === 7 || rahuHouse === 10 ? `Rahu in the ${getOrdinalSuffix(rahuHouse)} house creates obsessive tendencies around ${rahuHouse === 5 ? 'creativity, romance, and speculation' : rahuHouse === 7 ? 'partnerships and social validation' : 'career achievement and status'}. Channel this intensity constructively rather than allowing it to consume you.` : 'Obsessive tendencies are not dominant.',
    isolation: positions['Saturn'] && [12, 8].includes(getPlanetHouse(positions['Saturn'], ascSignIndex)) ? 'Saturn in 8th or 12th house creates periods of isolation — use solitude for self-reflection rather than withdrawal.' : 'Isolation is not a dominant pattern.',
    betrayalTendencies: positions['Rahu'] && getPlanetHouse(positions['Rahu'], ascSignIndex) === 7 ? 'Rahu in the 7th house can indicate betrayal in partnerships — be discerning about trust and maintain clear boundaries.' : 'No strong betrayal tendency indicators.',
    hiddenStrengths: strengths.length > 0 ? strengths : ['Your greatest hidden strength is resilience — the capacity to transform challenges into wisdom.'],
    keyFactors: {
      rahuAnalysis: rahuPos ? `Rahu in ${rahuPos.sign} (${getOrdinalSuffix(rahuHouse)} house)` : '',
      sixthHouseAnalysis: getHouseLordAnalysis(6, positions, ascSignIndex),
      eighthHouseAnalysis: getHouseLordAnalysis(8, positions, ascSignIndex),
      twelfthHouseAnalysis: getHouseLordAnalysis(12, positions, ascSignIndex),
    },
  };
}

function generateDivisionalChartsAnalysis(
  positions: Record<string, PlanetPosition>,
  ascSignIndex: number,
  vargs: Record<VargaType, ReturnType<typeof calculateAllDivisionalCharts>[VargaType]>,
) {
  const navamshaAnalysis = analyzeNavamsha(positions, { sign: ZODIAC_SIGNS[ascSignIndex], signIndex: ascSignIndex, degreeInSign: 0, siderealLongitude: 0 });

  const vargottamaPlanets = navamshaAnalysis.vargottamaPlanets;

  const summarizeVarga = (v: { varga: VargaType; ascendantSign: ZodiacSign; positions: Record<string, { sign: ZodiacSign; isExalted: boolean; isDebilitated: boolean; isInOwnSign: boolean }> }) => {
    const exalted = Object.entries(v.positions).filter(([, p]) => p.isExalted).map(([n]) => n);
    const debilitated = Object.entries(v.positions).filter(([, p]) => p.isDebilitated).map(([n]) => n);
    const ownSign = Object.entries(v.positions).filter(([, p]) => p.isInOwnSign).map(([n]) => n);
    return `${v.ascendantSign} ascendant${exalted.length ? `. Exalted: ${exalted.join(', ')}` : ''}${debilitated.length ? `. Debilitated: ${debilitated.join(', ')}` : ''}${ownSign.length ? `. Own sign: ${ownSign.join(', ')}` : ''}`;
  };

  return {
    d1Main: `D1 (Rasi) — ${ZODIAC_SIGNS[ascSignIndex]} ascendant. The main birth chart reveals your overall life path and personality structure.`,
    d9Navamsha: {
      analysis: `D9 (Navamsha) — ${vargs.D9.ascendantSign} ascendant. ${navamshaAnalysis.strengthSummary}`,
      ascendantSign: vargs.D9.ascendantSign,
      keyPlanets: `Navamsha ascendant lord: ${getSignAttributes(vargs.D9.ascendantSign).ruler}. ${vargottamaPlanets.length > 0 ? `Vargottama: ${vargottamaPlanets.join(', ')} (exceptional strength).` : ''}`,
      soulMaturity: navamshaAnalysis.ascendantModality === 'Movable' ? 'Dynamic soul maturity — you are evolving rapidly through action and experience.' : navamshaAnalysis.ascendantModality === 'Fixed' ? 'Deep soul maturity — your inner foundation is strong and unwavering.' : 'Versatile soul maturity — you adapt and integrate across lifetimes.',
    },
    d10Career: { analysis: summarizeVarga(vargs.D10), ascendantSign: vargs.D10.ascendantSign, careerIndicators: `D10 lord ${getSignAttributes(vargs.D10.ascendantSign).ruler} in D1 shows how career potential manifests in actual life.` },
    d7Children: { analysis: summarizeVarga(vargs.D7), ascendantSign: vargs.D7.ascendantSign },
    d12Parents: { analysis: summarizeVarga(vargs.D12), ascendantSign: vargs.D12.ascendantSign },
    d20Spirituality: { analysis: summarizeVarga(vargs.D20), ascendantSign: vargs.D20.ascendantSign },
    d24Education: { analysis: summarizeVarga(vargs.D24), ascendantSign: vargs.D24.ascendantSign },
    d60DeepKarma: { analysis: summarizeVarga(vargs.D60), ascendantSign: vargs.D60.ascendantSign },
    vargottamaPlanets: vargottamaPlanets,
  };
}

function generateNakshatraDeepAnalysis(positions: Record<string, PlanetPosition>) {
  const moonPos = positions['Moon'];
  if (!moonPos) return {
    moonNakshatra: 'Unknown', psychologicalCoding: 'Requires Moon position.', desireNature: '', hiddenMotivations: '', emotionalWounds: '', behavioralPatterns: '', deity: '', deityInfluence: '', symbol: '', symbolMeaning: '', padaAnalysis: '', nakshatraRulerInfluence: '',
  };

  const nakshatra = NAKSHATRAS[moonPos.nakshatraIndex];
  if (!nakshatra) return {
    moonNakshatra: moonPos.nakshatra, psychologicalCoding: 'Nakshatra data unavailable.', desireNature: '', hiddenMotivations: '', emotionalWounds: '', behavioralPatterns: '', deity: '', deityInfluence: '', symbol: '', symbolMeaning: '', padaAnalysis: '', nakshatraRulerInfluence: '',
  };

  const desireNatures: Record<string, string> = {
    Ashwini: 'healing and rapid transformation', Bharani: 'purification and bearing life\'s burdens', Krittika: 'cutting through illusion and finding truth',
    Rohini: 'growth, creativity, and sensual fulfillment', Mrigashirsha: 'searching for meaning and spiritual fulfillment', Arda: 'transformation through storm and renewal',
    Punarvasu: 'returning home and restoring harmony', Pushya: 'nourishment and spiritual growth', Ashlesha: 'deep insight and hidden knowledge',
    Magha: 'ancestral honor and throne of power', 'Purva Phalguni': 'pleasure, creativity, and renewal', 'Uttara Phalguni': 'sustained commitment and friendship',
    Hasta: 'skill, craftsmanship, and healing hands', Chitra: 'creating beauty and visionary art', Swati: 'independence and self-mastery',
    Vishakha: 'achieving goals through determination', Anuradha: 'friendship, devotion, and success through alliance', Jyeshtha: 'leadership, protection, and mature wisdom',
    Mula: 'destroying illusion and reaching the root', 'Purva Ashadha': 'invincibility and early victory', 'Uttara Ashadha': 'final victory and lasting achievement',
    Shravana: 'listening, learning, and receiving wisdom', Dhanishtha: 'wealth, music, and cosmic rhythm', Shatabhisha: 'healing, secrecy, and hundred physicians',
    'Purva Bhadrapada': 'austerities and rising through sacrifice', 'Uttara Bhadrapada': 'deep wisdom and restraint', Revati: 'nourishment, completion, and safe passage',
  };

  return {
    moonNakshatra: nakshatra.name,
    psychologicalCoding: `Your Moon in ${nakshatra.name} nakshatra (${nakshatra.gana} gana, ${nakshatra.yoni} yoni) gives you ${nakshatra.gana === 'Deva' ? 'a divine, compassionate temperament — you naturally seek harmony and selfless service' : nakshatra.gana === 'Manushya' ? 'a human, practical temperament — you balance material ambition with emotional sensitivity' : 'an intense, independent temperament — you are fierce, self-reliant, and protective'}. Your ${nakshatra.yoni} yoni suggests ${nakshatra.yoni === 'Horse' || nakshatra.yoni === 'Tiger' || nakshatra.yoni === 'Lion' ? 'a powerful, freedom-seeking approach to relationships' : nakshatra.yoni === 'Deer' || nakshatra.yoni === 'Cow' || nakshatra.yoni === 'Goat' ? 'a gentle, nurturing approach to connection' : 'a complex, strategic approach to intimacy'}.`,
    desireNature: `At the deepest level, ${nakshatra.name} desires ${desireNatures[nakshatra.name] ?? 'self-realization and fulfillment of its unique purpose'}. This is the core motivation beneath all your actions and choices.`,
    hiddenMotivations: `Ruled by ${nakshatra.ruler}, your hidden motivations are shaped by ${nakshatra.ruler === 'Ketu' ? 'a desire for liberation and spiritual completion' : nakshatra.ruler === 'Venus' ? 'a need for beauty, harmony, and sensual fulfillment' : nakshatra.ruler === 'Sun' ? 'a drive for recognition, authority, and creative expression' : nakshatra.ruler === 'Moon' ? 'a need for emotional security and nurturing connection' : nakshatra.ruler === 'Mars' ? 'a drive for action, courage, and decisive impact' : nakshatra.ruler === 'Jupiter' ? 'a desire for wisdom, expansion, and meaningful growth' : nakshatra.ruler === 'Saturn' ? 'a need for structure, endurance, and lasting achievement' : 'a complex blend of motivations'}.`,
    emotionalWounds: `The ${nakshatra.symbol} symbol of ${nakshatra.name} suggests that your core emotional wound revolves around ${nakshatra.symbol === 'Horse Head' ? 'feeling rushed or unable to heal quickly enough' : nakshatra.symbol === 'Yoni' ? 'issues around creation, vulnerability, and life-death cycles' : nakshatra.symbol === 'Razor/Flame' ? 'being cut by truth or burned by critical intensity' : nakshatra.symbol === 'Cart/Chariot' ? 'feeling pulled in multiple directions or unable to settle' : nakshatra.symbol === 'Deer Head' ? 'always searching but never quite arriving' : nakshatra.symbol === 'Teardrop' ? 'transforming emotional pain into spiritual power' : 'the tension between your deepest desires and reality'}. Healing comes through ${nakshatra.deity === 'Ashwini Kumaras' ? 'healing practices and serving others' : nakshatra.deity === 'Brahma' ? 'creative expression and building something lasting' : nakshatra.deity === 'Vishnu' ? 'surrender to divine order and trust in the process' : 'understanding the lesson embedded in the wound'}.`,
    behavioralPatterns: `${nakshatra.name} nakshatra creates behavioral patterns of ${nakshatra.nature === 'Rakshasa' ? 'intensity, independence, and fierce self-protection — you may struggle with trust but are deeply loyal once committed' : nakshatra.nature === 'Manushya' ? 'practicality, social awareness, and balanced ambition — you navigate the world with both heart and strategy' : 'compassion, idealism, and spiritual inclination — you seek the highest expression in all things'}. ${nakshatra.element === 'Fire' ? 'Fire element adds passion and initiative.' : nakshatra.element === 'Earth' ? 'Earth element adds stability and patience.' : nakshatra.element === 'Air' ? 'Air element adds intellect and versatility.' : 'Water element adds emotional depth and intuition.'}`,
    deity: nakshatra.deity,
    deityInfluence: `Presiding deity ${nakshatra.deity} blesses you with ${nakshatra.deity === 'Ashwini Kumaras' ? 'healing abilities and the power to rejuvenate' : nakshatra.deity === 'Yama' ? 'understanding of dharma and the discipline to follow it' : nakshatra.deity === 'Agni' ? 'transformative power and the ability to purify' : nakshatra.deity === 'Brahma' ? 'creative intelligence and the power to manifest' : nakshatra.deity === 'Soma' ? 'divine nectar and emotional fulfillment' : nakshatra.deity === 'Rudra' ? 'destructive and regenerative power' : nakshatra.deity === 'Aditi' ? 'boundlessness and freedom from limitation' : nakshatra.deity === 'Brihaspati' ? 'wisdom and spiritual guidance' : nakshatra.deity === 'Nagas' ? 'hidden knowledge and kundalini awakening' : nakshatra.deity === 'Pitris' ? 'ancestral blessings and connection to lineage' : nakshatra.deity === 'Vishnu' ? 'preservation, protection, and cosmic order' : nakshatra.deity === 'Indra' ? 'leadership, courage, and sovereign power' : 'divine grace and spiritual gifts'}.`,
    symbol: nakshatra.symbol,
    symbolMeaning: `The ${nakshatra.symbol} symbol represents ${nakshatra.symbol === 'Horse Head' ? 'speed, healing, and the ability to move quickly between worlds' : nakshatra.symbol === 'Yoni' ? 'the source of creation, life force, and divine feminine power' : nakshatra.symbol === 'Razor/Flame' ? 'the power to cut through illusion and purify through intensity' : nakshatra.symbol === 'Cart/Chariot' ? 'movement, journey, and the vehicle of transformation' : nakshatra.symbol === 'Deer Head' ? 'gentle searching, curiosity, and the quest for fulfillment' : nakshatra.symbol === 'Teardrop' ? 'emotional depth, transformation through grief, and renewal' : nakshatra.symbol === 'Bow/Quiver' ? 'preparedness, focus, and the ability to hit targets' : nakshatra.symbol === 'Cow Udder' ? 'nourishment, generosity, and sustaining others' : nakshatra.symbol === 'Serpent' ? 'hidden wisdom, coiled energy, and kundalini' : nakshatra.symbol === 'Royal Throne' ? 'ancestral authority, heritage, and the right to rule' : nakshatra.symbol === 'Hand' ? 'skill, craftsmanship, and the power of touch' : nakshatra.symbol === 'Bright Jewel' ? 'brilliance, beauty, and the sparkle of creation' : 'a unique cosmic signature that shapes your deepest nature'}.`,
    padaAnalysis: `Your Moon is in ${nakshatra.name} pada ${moonPos.nakshatraPada}. Pada ${moonPos.nakshatraPada} ${moonPos.nakshatraPada === 1 ? 'emphasizes the foundational energy of this nakshatra — you express its qualities in their purest, most instinctive form.' : moonPos.nakshatraPada === 2 ? 'adds financial and material focus — you seek to manifest the nakshatra\'s energy in practical, tangible ways.' : moonPos.nakshatraPada === 3 ? 'adds intellectual and communicative focus — you articulate and analyze the nakshatra\'s themes with precision.' : 'adds spiritual and transcendent focus — you seek the highest expression and ultimate meaning of this nakshatra.'}`,
    nakshatraRulerInfluence: `${nakshatra.ruler} as the ruler of your Moon nakshatra is a dominant influence on your psychology. The placement of ${nakshatra.ruler} in your birth chart determines how this nakshatra energy manifests in your daily life.`,
  };
}

// ─── Main Handler ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // Ensure Swiss Ephemeris is initialized before calculations
    await initializeSwissEphemeris();

    const body = await request.json();
    const { userId } = requestSchema.parse(body);

    // Check cache
    const cached = cache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { profile: true, astrology: true },
    });

    if (!user || !user.profile) {
      return NextResponse.json({ error: 'User not found or profile incomplete' }, { status: 404 });
    }

    const profile = user.profile;
    const lat = profile.latitude ?? 28.6139;
    const lon = profile.longitude ?? 77.2090;
    const tz = profile.timezone ? parseFloat(profile.timezone) || 5.5 : 5.5;

    // Calculate base kundali
    const kundali = calculateKundali(
      new Date(profile.dateOfBirth),
      profile.timeOfBirth,
      lat,
      lon,
      tz,
    );

    const positions = kundali.planetaryPositions;
    const ascSignIndex = kundali.ascendantData.signIndex;

    // Calculate divisional charts
    const vargs = calculateAllDivisionalCharts(positions, kundali.ascendantData);

    // Calculate Jaimini karakas
    const karakas = calculateKarakas(positions, ascSignIndex);

    // Generate all 12 analysis sections
    const comprehensiveAnalysis = {
      calculationInfo: {
        engine: 'Swiss Ephemeris with Meeus Fallback',
        ayanamsa: kundali.ayanamsa,
        calculationDate: new Date().toISOString(),
      },

      // Raw astrology data for store consistency sync
      rawAstrologyData: {
        sunSign: kundali.sunSign,
        moonSign: kundali.moonSign,
        ascendant: kundali.ascendant,
        nakshatra: kundali.nakshatra.name,
        currentDasha: kundali.dashaPeriods.currentMahadasha
          ? `${kundali.dashaPeriods.currentMahadasha.planet}${kundali.dashaPeriods.currentAntardasha ? '/' + kundali.dashaPeriods.currentAntardasha.planet : ''}`
          : '',
        yogas: kundali.yogas.filter(y => y.present).map(y => y.name),
        doshas: kundali.doshas.filter(d => d.present).map(d => d.name),
        planetaryPositions: Object.fromEntries(
          Object.entries(positions).map(([key, pos]) => [
            key,
            {
              sign: pos.sign,
              degree: pos.degreeInSign,
              house: pos.house ?? getHouseFromAscendant(pos.signIndex, ascSignIndex),
              retrograde: pos.isRetrograde,
              nakshatra: pos.nakshatra,
              nakshatraPada: pos.nakshatraPada,
              isCombust: pos.isCombust,
            },
          ])
        ),
      },

      personalityBlueprint: generatePersonalityBlueprint(positions, ascSignIndex, karakas),

      karmaPatterns: generateKarmaPatterns(positions, ascSignIndex, karakas),

      careerDharma: generateCareerDharma(positions, ascSignIndex, vargs),

      marriageDynamics: generateMarriageDynamics(positions, ascSignIndex, karakas, vargs),

      healthTendencies: generateHealthTendencies(positions, ascSignIndex),

      timingEvents: generateTimingEvents(positions, ascSignIndex, kundali),

      spiritualEvolution: generateSpiritualEvolution(positions, ascSignIndex, vargs),

      familyKarma: generateFamilyKarma(positions, ascSignIndex, vargs),

      hiddenPatterns: generateHiddenPatterns(positions, ascSignIndex),

      rareYogas: {
        detectedYogas: kundali.yogas.map(y => ({
          name: y.name,
          present: y.present,
          strength: y.strength,
          description: y.description,
          involvingPlanets: y.involvingPlanets,
          contextualNote: `This yoga ${y.present ? (y.strength === 'Strong' ? 'is strongly formed and likely to manifest significantly, especially during relevant Dasha periods.' : y.strength === 'Moderate' ? 'is moderately formed — it will show results during favorable planetary periods and transit support.' : 'is weakly formed — it exists but requires specific Dasha and Gochar support to fully manifest.') : 'is not present in this chart.'}`,
        })),
        detectedDoshas: kundali.doshas.map(d => ({
          name: d.name,
          present: d.present,
          severity: d.severity,
          description: d.description,
          remedies: d.remedies,
        })),
        yogaContextNote: 'A yoga only works strongly when supported by Dasha periods, strengthened in divisional charts (especially Navamsha), and not heavily afflicted by malefic aspects. The presence of a yoga in D1 is necessary but not sufficient for its full manifestation.',
      },

      divisionalCharts: generateDivisionalChartsAnalysis(positions, ascSignIndex, vargs),

      nakshatraDeepAnalysis: generateNakshatraDeepAnalysis(positions),
    };

    // Cache result
    cache.set(userId, { data: comprehensiveAnalysis, timestamp: Date.now() });

    return NextResponse.json(comprehensiveAnalysis);
  } catch (error) {
    console.error('[ComprehensiveKundali] Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * AyuAstro - KundaliDataProvider
 *
 * SINGLE SOURCE OF TRUTH for kundali data access.
 *
 * This module ensures ALL API endpoints and UI components use the SAME data
 * by reading stored planetary positions, houses, nakshatra, dasha, yogas, and
 * doshas directly from the database — NOT by recalculating from birth details.
 *
 * Recalculation happens ONLY when:
 *   1. No stored data exists in the database
 *   2. Stored data is corrupt or missing critical fields
 *
 * This fixes the fundamental bug where different sections showed different
 * house placements for the same planet because they recalculated independently.
 */

import { db } from '@/lib/db';
import { calculateKundali } from './index';
import {
  type KundaliData,
  type PlanetPosition,
  type HouseData,
  type NakshatraData,
  type DashaData,
  type YogaData,
  type DoshaData,
  type AscendantData,
  type ZodiacSign,
  ZODIAC_SIGNS,
} from './types';

// ─── Result Type ──────────────────────────────────────────────────────────────

export interface KundaliProviderResult {
  /** The kundali data — either from stored DB data or recalculated */
  kundali: KundaliData;
  /** Whether the data came from the DB (true) or was recalculated (false) */
  fromStorage: boolean;
  /** Whether a recalculation was performed and the result should be saved back */
  shouldSave: boolean;
}

// ─── JSON Parsing Helpers ─────────────────────────────────────────────────────

/**
 * Safely parse a JSON string from the database.
 * Returns null if parsing fails.
 */
function safeJsonParse<T>(jsonStr: string | null | undefined, fallback: T | null = null): T | null {
  if (!jsonStr) return fallback;
  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    console.warn('[KundaliProvider] Failed to parse JSON:', jsonStr.substring(0, 100));
    return fallback;
  }
}

/**
 * Ensure all PlanetPosition objects have the `house` field populated.
 * When data is stored as JSON in the DB, the `house` field might be lost
 * if it was undefined at serialization time. This function ensures it's
 * always present by recalculating from signIndex and ascendant signIndex.
 */
function ensureHouseFields(
  positions: Record<string, PlanetPosition>,
  ascendantSignIndex: number
): Record<string, PlanetPosition> {
  for (const key of Object.keys(positions)) {
    const pos = positions[key];
    if (pos && (pos.house === undefined || pos.house === null)) {
      // Recalculate house from signIndex relative to ascendant
      pos.house = ((pos.signIndex - ascendantSignIndex) % 12 + 12) % 12 + 1;
    }
  }
  return positions;
}

/**
 * Reconstruct AscendantData from stored kundali data.
 * The ascendant sign is stored in the AstrologyData table.
 */
function reconstructAscendantData(
  ascendantSign: string,
  positions: Record<string, PlanetPosition>
): AscendantData {
  const signIndex = ZODIAC_SIGNS.indexOf(ascendantSign as ZodiacSign);
  // Try to get degree from stored data
  // The ascendant degree is typically stored in the planetary positions
  // or we can derive it from the positions
  const siderealLongitude = signIndex * 30; // Approximate — exact degree not critical for house mapping
  return {
    sign: ascendantSign as ZodiacSign,
    signIndex,
    degreeInSign: 0, // Not stored separately, approximate
    siderealLongitude,
  };
}

/**
 * Ensure HouseData planets arrays contain strings, not Planet type objects.
 * The DB stores planets as string arrays via `as any[]`, so we normalize.
 */
function normalizeHouseData(houses: HouseData[]): HouseData[] {
  return houses.map(h => ({
    ...h,
    planets: (h.planets || []).map(p => String(p)),
  })) as HouseData[];
}

// ─── Main Provider Function ───────────────────────────────────────────────────

/**
 * Get kundali data for a user from the SINGLE SOURCE OF TRUTH.
 *
 * Strategy:
 * 1. Read stored astrology data from the database
 * 2. Parse JSON fields (planetaryPositions, houses, nakshatra, dashaPeriods, yogas, doshas)
 * 3. Ensure all house fields are populated on planetary positions
 * 4. Normalize house data
 * 5. Return the reconstructed KundaliData
 * 6. Only fall back to recalculation if stored data is missing/corrupt
 *
 * @param userId - The user ID to fetch data for
 * @returns KundaliProviderResult with the kundali data and metadata
 */
export async function getKundaliData(userId: string): Promise<KundaliProviderResult> {
  // Step 1: Fetch user with profile and astrology data
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      astrology: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Step 2: Try to use stored astrology data
  if (user.astrology) {
    const storedPositions = safeJsonParse<Record<string, PlanetPosition>>(user.astrology.planetaryPositions);
    const storedHouses = safeJsonParse<HouseData[]>(user.astrology.houses);
    const storedNakshatra = safeJsonParse<NakshatraData>(user.astrology.nakshatra);
    const storedDasha = safeJsonParse<DashaData>(user.astrology.dashaPeriods);
    const storedYogas = safeJsonParse<YogaData[]>(user.astrology.yogas);
    const storedDoshas = safeJsonParse<DoshaData[]>(user.astrology.doshas);

    // Validate that we have the minimum required data
    if (storedPositions && Object.keys(storedPositions).length > 0) {
      const ascendantSign = user.astrology.ascendant as ZodiacSign;
      const ascendantSignIndex = ZODIAC_SIGNS.indexOf(ascendantSign);
      const ascendantData = reconstructAscendantData(ascendantSign, storedPositions);

      // Ensure house fields are populated on all planetary positions
      const positionsWithHouses = ensureHouseFields(storedPositions, ascendantSignIndex);

      // Normalize house data
      const normalizedHouses = storedHouses ? normalizeHouseData(storedHouses) : [];

      // Reconstruct the full KundaliData from stored parts
      const kundali: KundaliData = {
        birthDate: user.profile?.dateOfBirth ?? '',
        birthTime: user.profile?.timeOfBirth ?? '',
        latitude: user.profile?.latitude ?? 0,
        longitude: user.profile?.longitude ?? 0,
        ayanamsa: 0, // Not stored separately, but not critical for consistency
        sunSign: (user.astrology.sunSign ?? 'Aries') as ZodiacSign,
        moonSign: (user.astrology.moonSign ?? 'Aries') as ZodiacSign,
        ascendant: ascendantSign,
        ascendantData,
        planetaryPositions: positionsWithHouses,
        houses: normalizedHouses,
        chart: {
          houses: normalizedHouses,
          ascendantIndex: ascendantSignIndex,
        },
        nakshatra: storedNakshatra ?? {
          name: 'Ashwini',
          index: 0,
          pada: 1,
          ruler: 'Ketu',
          deity: 'Ashwini Kumaras',
          symbol: 'Horse Head',
          startDegree: 0,
          endDegree: 13.333,
        },
        dashaPeriods: storedDasha ?? {
          currentMahadasha: null,
          currentAntardasha: null,
          allMahadashas: [],
          moonNakshatraLord: 'Ketu',
          dashaStartDate: new Date(),
        },
        yogas: storedYogas ?? [],
        doshas: storedDoshas ?? [],
      };

      return {
        kundali,
        fromStorage: true,
        shouldSave: false, // Data is already stored
      };
    }
  }

  // Step 3: Fallback — recalculate from birth details
  if (!user.profile) {
    throw new Error('No birth details available for recalculation');
  }

  const lat = user.profile.latitude ?? 28.6139;
  const lon = user.profile.longitude ?? 77.2090;
  const tz = user.profile.timezone ? parseFloat(user.profile.timezone) || 5.5 : 5.5;

  const kundali = calculateKundali(
    new Date(user.profile.dateOfBirth),
    user.profile.timeOfBirth,
    lat,
    lon,
    tz,
  );

  return {
    kundali,
    fromStorage: false,
    shouldSave: true, // Should save the recalculated data to DB
  };
}

/**
 * Save kundali data to the database.
 * This is called after recalculation to ensure future requests use stored data.
 */
export async function saveKundaliToDb(userId: string, kundali: KundaliData): Promise<void> {
  const positionsJson = JSON.stringify(kundali.planetaryPositions);
  const housesJson = JSON.stringify(kundali.houses);
  const nakshatraJson = JSON.stringify(kundali.nakshatra);
  const dashaJson = JSON.stringify(kundali.dashaPeriods);
  const yogasJson = JSON.stringify(kundali.yogas);
  const doshasJson = JSON.stringify(kundali.doshas);

  await db.astrologyData.upsert({
    where: { userId },
    update: {
      sunSign: kundali.sunSign,
      moonSign: kundali.moonSign,
      ascendant: kundali.ascendant,
      planetaryPositions: positionsJson,
      houses: housesJson,
      nakshatra: nakshatraJson,
      dashaPeriods: dashaJson,
      yogas: yogasJson,
      doshas: doshasJson,
    },
    create: {
      userId,
      sunSign: kundali.sunSign,
      moonSign: kundali.moonSign,
      ascendant: kundali.ascendant,
      planetaryPositions: positionsJson,
      houses: housesJson,
      nakshatra: nakshatraJson,
      dashaPeriods: dashaJson,
      yogas: yogasJson,
      doshas: doshasJson,
    },
  });
}

/**
 * Convenience: Get kundali data and auto-save if it was recalculated.
 */
export async function getKundaliDataWithSave(userId: string): Promise<KundaliData> {
  const result = await getKundaliData(userId);

  if (result.shouldSave) {
    try {
      await saveKundaliToDb(userId, result.kundali);
    } catch (err) {
      console.error('[KundaliProvider] Failed to save recalculated data:', err);
      // Non-fatal — the data is still valid for this request
    }
  }

  return result.kundali;
}

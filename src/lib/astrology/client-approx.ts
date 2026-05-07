/**
 * AyuAstro - Client-Side Lightweight Approximation
 * 
 * This module provides lightweight zodiac sign approximations for use in
 * client-side components (like onboarding previews). It does NOT use the
 * Swiss Ephemeris native module and is safe for client-side bundling.
 * 
 * For accurate calculations, use the server-side API endpoints which use
 * the full Swiss Ephemeris engine.
 */

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const;

type ZodiacSign = typeof ZODIAC_SIGNS[number];

/** Approximate sidereal sun sign from date of birth (Vedic/Sidereal) */
export function approximateSunSign(dateOfBirth: string): ZodiacSign {
  if (!dateOfBirth) return 'Capricorn';
  
  const month = parseInt(dateOfBirth.split('-')[1]);
  const day = parseInt(dateOfBirth.split('-')[2]);

  // Sidereal zodiac dates (approximately 23 days later than tropical)
  // These are approximate for Vedic astrology
  if ((month === 4 && day >= 14) || (month === 5 && day <= 14)) return 'Aries';
  if ((month === 5 && day >= 15) || (month === 6 && day <= 14)) return 'Taurus';
  if ((month === 6 && day >= 15) || (month === 7 && day <= 16)) return 'Gemini';
  if ((month === 7 && day >= 17) || (month === 8 && day <= 16)) return 'Cancer';
  if ((month === 8 && day >= 17) || (month === 9 && day <= 16)) return 'Leo';
  if ((month === 9 && day >= 17) || (month === 10 && day <= 16)) return 'Virgo';
  if ((month === 10 && day >= 17) || (month === 11 && day <= 15)) return 'Libra';
  if ((month === 11 && day >= 16) || (month === 12 && day <= 15)) return 'Scorpio';
  if ((month === 12 && day >= 16) || (month === 1 && day <= 14)) return 'Sagittarius';
  if ((month === 1 && day >= 15) || (month === 2 && day <= 12)) return 'Capricorn';
  if ((month === 2 && day >= 13) || (month === 3 && day <= 14)) return 'Aquarius';
  return 'Pisces';
}

/** Approximate moon sign (less accurate without full calculation) */
export function approximateMoonSign(dateOfBirth: string): ZodiacSign {
  // Moon changes signs every ~2.5 days, so date-only approximation is rough
  // Use a deterministic but approximate method based on the day of year
  const date = new Date(dateOfBirth);
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  // Moon completes 12 signs in ~27.3 days, so approximate
  const moonSignIndex = Math.floor((dayOfYear / 2.5) % 12);
  return ZODIAC_SIGNS[moonSignIndex];
}

/** Approximate rising/ascendant sign (very rough without birth time + location) */
export function approximateRisingSign(timeOfBirth: string, latitude: number): ZodiacSign {
  if (!timeOfBirth) return 'Taurus';
  
  const [hours] = timeOfBirth.split(':').map(Number);
  const hour = hours || 12;
  
  // Ascendant changes roughly every 2 hours
  // At sunrise (~6am), ascendant ≈ sun sign
  // Each hour moves roughly 15° (half a sign)
  const ascShift = Math.floor((hour - 6 + 24) % 24 / 2);
  
  // Use a default base sign (approximate for Indian latitude)
  const baseSignIndex = 3; // Cancer as rough base for IST sunrise
  const signIndex = (baseSignIndex + ascShift) % 12;
  return ZODIAC_SIGNS[signIndex];
}

/**
 * Get approximate zodiac preview for the onboarding experience.
 * This is a CLIENT-SIDE approximation only — the actual accurate
 * calculation happens server-side via the /api/process-all endpoint.
 */
export function getApproximateZodiacPreview(birthDetails: {
  dateOfBirth: string;
  timeOfBirth: string;
  latitude: number;
  longitude: number;
}): { sunSign: ZodiacSign; moonSign: ZodiacSign; risingSign: ZodiacSign } {
  return {
    sunSign: approximateSunSign(birthDetails.dateOfBirth),
    moonSign: approximateMoonSign(birthDetails.dateOfBirth),
    risingSign: approximateRisingSign(birthDetails.timeOfBirth, birthDetails.latitude),
  };
}

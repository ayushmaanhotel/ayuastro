import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { calculateKundali, getCalculationMethod, initializeSwissEphemeris } from '@/lib/astrology';
import { requireApiUser } from '@/lib/api-auth';

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const astrologySchema = z.object({
  userId: z.string().min(1, 'User ID is required').optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  timeOfBirth: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.number().min(-12).max(14, 'Timezone offset must be between -12 and +14'),
});

// ─── Helper: Serialize dates in dasha periods ────────────────────────────────

function serializeDashaPeriods(dashaPeriods: Record<string, unknown>): string {
  return JSON.stringify(dashaPeriods, (_key, value) => {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  });
}

// ─── POST Handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // Ensure Swiss Ephemeris is initialized before calculations
    await initializeSwissEphemeris();

    const body = await request.json();
    const parsed = astrologySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const auth = await requireApiUser(request, parsed.data.userId);
    if (!auth.ok) return auth.response;
    const { dateOfBirth, timeOfBirth, latitude, longitude, timezone } = parsed.data;
    const userId = auth.userId;

    // Verify user exists
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate kundali using the astrology engine
    const birthDate = new Date(dateOfBirth);
    const kundali = calculateKundali(birthDate, timeOfBirth, latitude, longitude, timezone);

    // Serialize complex objects for database storage
    const planetaryPositionsJSON = JSON.stringify(kundali.planetaryPositions, (_key, value) => {
      if (value instanceof Date) return value.toISOString();
      return value;
    });
    const housesJSON = JSON.stringify(kundali.houses);
    const nakshatraJSON = JSON.stringify(kundali.nakshatra);
    const dashaPeriodsJSON = serializeDashaPeriods(kundali.dashaPeriods as unknown as Record<string, unknown>);
    const yogasJSON = JSON.stringify(kundali.yogas);
    const doshasJSON = JSON.stringify(kundali.doshas);

    // Save to AstrologyData table (upsert)
    await db.astrologyData.upsert({
      where: { userId },
      update: {
        sunSign: kundali.sunSign,
        moonSign: kundali.moonSign,
        ascendant: kundali.ascendant,
        planetaryPositions: planetaryPositionsJSON,
        houses: housesJSON,
        nakshatra: nakshatraJSON,
        dashaPeriods: dashaPeriodsJSON,
        yogas: yogasJSON,
        doshas: doshasJSON,
      },
      create: {
        userId,
        sunSign: kundali.sunSign,
        moonSign: kundali.moonSign,
        ascendant: kundali.ascendant,
        planetaryPositions: planetaryPositionsJSON,
        houses: housesJSON,
        nakshatra: nakshatraJSON,
        dashaPeriods: dashaPeriodsJSON,
        yogas: yogasJSON,
        doshas: doshasJSON,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        sunSign: kundali.sunSign,
        moonSign: kundali.moonSign,
        ascendant: kundali.ascendant,
        ayanamsa: kundali.ayanamsa,
        calculationMethod: getCalculationMethod(),
        planetaryPositions: kundali.planetaryPositions,
        houses: kundali.houses,
        chart: kundali.chart,
        nakshatra: kundali.nakshatra,
        dashaPeriods: kundali.dashaPeriods,
        yogas: kundali.yogas,
        doshas: kundali.doshas,
      },
    });
  } catch (error) {
    console.error('[Astrology API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate astrology data' },
      { status: 500 }
    );
  }
}

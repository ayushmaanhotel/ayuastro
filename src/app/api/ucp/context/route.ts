import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Missing UCP Token' },
        { status: 401 }
      );
    }

    // Lookup preferences matching the ucpToken
    const preferences = await db.userPreferences.findUnique({
      where: { ucpToken: token },
      include: {
        user: {
          include: {
            profile: true,
            astrology: true,
            numerology: true,
            traits: true,
          },
        },
      },
    });

    if (!preferences) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid UCP Token' },
        { status: 401 }
      );
    }

    if (!preferences.ucpEnabled) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: UCP access is disabled in user preferences' },
        { status: 403 }
      );
    }

    const { user } = preferences;

    // Parse astrology fields if available
    let planetaryPositions = null;
    let houses = null;
    let nakshatra = null;
    let yogas = null;
    let doshas = null;
    let dashaPeriods = null;

    if (user.astrology) {
      try {
        planetaryPositions = JSON.parse(user.astrology.planetaryPositions);
      } catch (e) {
        console.warn('Failed to parse planetaryPositions:', e);
      }
      try {
        houses = JSON.parse(user.astrology.houses);
      } catch (e) {
        console.warn('Failed to parse houses:', e);
      }
      try {
        nakshatra = JSON.parse(user.astrology.nakshatra);
      } catch (e) {
        console.warn('Failed to parse nakshatra:', e);
      }
      try {
        yogas = JSON.parse(user.astrology.yogas);
      } catch (e) {
        console.warn('Failed to parse yogas:', e);
      }
      try {
        doshas = JSON.parse(user.astrology.doshas);
      } catch (e) {
        console.warn('Failed to parse doshas:', e);
      }
      try {
        dashaPeriods = JSON.parse(user.astrology.dashaPeriods);
      } catch (e) {
        console.warn('Failed to parse dashaPeriods:', e);
      }
    }

    const cosmicContext = {
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      birthDetails: user.profile ? {
        dateOfBirth: user.profile.dateOfBirth,
        timeOfBirth: user.profile.timeOfBirth,
        placeOfBirth: user.profile.placeOfBirth,
        gender: user.profile.gender,
      } : null,
      astrology: user.astrology ? {
        sunSign: user.astrology.sunSign,
        moonSign: user.astrology.moonSign,
        ascendant: user.astrology.ascendant,
        planetaryPositions,
        houses,
        nakshatra,
        yogas,
        doshas,
        dashaPeriods,
      } : null,
      numerology: user.numerology ? {
        lifePathNumber: user.numerology.lifePathNumber,
        destinyNumber: user.numerology.destinyNumber,
        soulUrgeNumber: user.numerology.soulUrgeNumber,
        personalityNumber: user.numerology.personalityNumber,
        birthdayNumber: user.numerology.birthdayNumber,
      } : null,
      personalityTraits: user.traits ? {
        emotionalIntensity: user.traits.emotionalIntensity,
        attachmentStyle: user.traits.attachmentStyle,
        ambition: user.traits.ambition,
        trust: user.traits.trust,
        communicationOpenness: user.traits.communicationOpenness,
        impulsiveness: user.traits.impulsiveness,
        empathy: user.traits.empathy,
        resilience: user.traits.resilience,
        creativity: user.traits.creativity,
        intuition: user.traits.intuition,
        discipline: user.traits.discipline,
        socialEnergy: user.traits.socialEnergy,
        patience: user.traits.patience,
        adaptability: user.traits.adaptability,
      } : null,
    };

    return NextResponse.json({
      success: true,
      context: cosmicContext,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (error) {
    console.error('[UCP Context API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}

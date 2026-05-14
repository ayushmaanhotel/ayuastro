import { NextResponse } from 'next/server';
import { getCalculatorHealthStatus, initializeSwissEphemeris } from '@/lib/astrology';

/**
 * Health Check API Endpoint
 *
 * GET /api/health
 *
 * Returns the status of the Swiss Ephemeris calculation engine,
 * including whether it's active or using Meeus fallback.
 */
export async function GET() {
  try {
    // Ensure initialization has been attempted
    await initializeSwissEphemeris();

    const status = getCalculatorHealthStatus();

    return NextResponse.json({
      success: true,
      calculation: {
        method: status.method,
        swissEphemerisReady: status.ready,
        version: status.version,
        initAttempted: status.initAttempted,
        error: status.error,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        calculation: {
          method: 'meeus-fallback',
          swissEphemerisReady: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

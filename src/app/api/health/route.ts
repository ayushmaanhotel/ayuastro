import { NextResponse } from 'next/server';
import { getCalculatorHealthStatus, initializeSwissEphemeris } from '@/lib/astrology';
import { getDeepSeekConfigStatus } from '@/lib/ai/deepseek';
import { checkAIService } from '@/lib/ai';

/**
 * Health Check API Endpoint
 *
 * GET /api/health
 *
 * Returns the status of the Swiss Ephemeris calculation engine,
 * including whether it's active or using Meeus fallback.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeLiveAI = searchParams.get('ai') === 'true';

    // Ensure initialization has been attempted
    await initializeSwissEphemeris();

    const status = getCalculatorHealthStatus();
    const deepseekConfig = getDeepSeekConfigStatus();
    const deepseekLive = includeLiveAI ? await checkAIService() : undefined;

    return NextResponse.json({
      success: true,
      calculation: {
        method: status.method,
        swissEphemerisReady: status.ready,
        version: status.version,
        initAttempted: status.initAttempted,
        error: status.error,
      },
      ai: {
        provider: 'deepseek',
        configured: deepseekConfig.configured,
        hasApiKey: deepseekConfig.hasApiKey,
        baseURL: deepseekConfig.baseURL,
        defaultModel: deepseekConfig.defaultModel,
        liveChecked: includeLiveAI,
        available: deepseekLive?.available,
        error: deepseekLive?.error ?? deepseekConfig.error,
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
        ai: {
          provider: 'deepseek',
          ...getDeepSeekConfigStatus(),
          liveChecked: false,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

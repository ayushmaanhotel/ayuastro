// ============================================================================
// AyuAstro - DeepSeek HTTP Client Wrapper
// ============================================================================
// Direct fetch-based OpenAI-compatible client wrapper targeting the DeepSeek API.
// This module must only be used from server-side code.
// ============================================================================

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export type DeepSeekModel = 'deepseek-v4-flash' | 'deepseek-v4-pro';

export interface DeepSeekCompletionOptions {
  model?: DeepSeekModel;
  messages: DeepSeekMessage[];
  temperature?: number;
  max_tokens?: number;
  reasoning_effort?: 'high' | 'max';
  thinking?: {
    type: 'enabled' | 'disabled';
  };
  response_format?: {
    type: 'json_object' | 'text';
  };
}

export interface DeepSeekChoice {
  index: number;
  message: {
    role: 'assistant';
    content: string | null;
    reasoning_content?: string | null;
  };
  finish_reason: string;
}

export interface DeepSeekCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: DeepSeekChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface DeepSeekConfigStatus {
  configured: boolean;
  baseURL: string;
  defaultModel: DeepSeekModel;
  hasApiKey: boolean;
  error?: string;
}

const DEFAULT_BASE_URL = 'https://api.deepseek.com';
const AGENT_ROUTER_BASE_URL = 'https://agentrouter.org/v1';
const DEFAULT_TIMEOUT_MS = 120000;

function normalizeBaseURL(value?: string): string {
  return (value?.trim() || DEFAULT_BASE_URL).replace(/\/+$/, '');
}

function normalizeApiKey(value?: string): string {
  const trimmed = value?.trim() ?? '';
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function getDefaultModel(thinkingEnabled: boolean): DeepSeekModel {
  const configured = process.env.DEEPSEEK_MODEL?.trim();
  if (configured === 'deepseek-v4-flash' || configured === 'deepseek-v4-pro') {
    return configured;
  }
  return 'deepseek-v4-flash';
}

function getApiKey(): string {
  return normalizeApiKey(process.env.DEEPSEEK_API_KEY || process.env.AGENT_ROUTER_TOKEN);
}

function getBaseURL(): string {
  const explicit = process.env.DEEPSEEK_BASE_URL?.trim();
  if (explicit) return normalizeBaseURL(explicit);
  if (process.env.AGENT_ROUTER_TOKEN?.trim() && !process.env.DEEPSEEK_API_KEY?.trim()) {
    return AGENT_ROUTER_BASE_URL;
  }
  return DEFAULT_BASE_URL;
}

export function getDeepSeekConfigStatus(): DeepSeekConfigStatus {
  const apiKey = getApiKey();
  const baseURL = getBaseURL();
  const defaultModel = getDefaultModel(true);

  return {
    configured: Boolean(apiKey),
    baseURL,
    defaultModel,
    hasApiKey: Boolean(apiKey),
    error: apiKey ? undefined : 'DEEPSEEK_API_KEY is missing or empty.',
  };
}

/**
 * Executes a chat completion request to the DeepSeek API.
 */
export async function createDeepSeekCompletion(
  options: DeepSeekCompletionOptions
): Promise<DeepSeekCompletionResponse> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY or AGENT_ROUTER_TOKEN is not defined or is empty in the environment variables.');
  }

  const thinkingEnabled = options.thinking?.type !== 'disabled';
  const model = options.model ?? getDefaultModel(thinkingEnabled);
  const baseURL = getBaseURL();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  const body: Record<string, unknown> = {
    model,
    messages: options.messages,
    stream: false,
  };

  if (options.thinking) {
    body.thinking = options.thinking;
  }

  if (thinkingEnabled) {
    body.reasoning_effort = options.reasoning_effort ?? 'high';
  } else if (options.temperature !== undefined) {
    body.temperature = options.temperature;
  }

  if (options.max_tokens !== undefined) {
    body.max_tokens = options.max_tokens;
  }

  if (options.response_format) {
    body.response_format = options.response_format;
  }

  try {
    const res = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[DeepSeek API] Error response (${res.status}):`, errorText);
      throw new Error(`DeepSeek API request failed with status ${res.status}: ${errorText}`);
    }

    return (await res.json()) as DeepSeekCompletionResponse;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`DeepSeek API request timed out after ${DEFAULT_TIMEOUT_MS / 1000}s.`);
    }
    console.error('[DeepSeek Client] Execution error:', error);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Drop-in wrapper mimicking standard OpenAI completions structure.
 */
export const deepseek = {
  chat: {
    completions: {
      create: createDeepSeekCompletion,
    },
  },
};

export default deepseek;

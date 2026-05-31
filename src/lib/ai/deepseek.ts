// ============================================================================
// AyuAstro - DeepSeek HTTP Client Wrapper
// ============================================================================
// Direct fetch-based OpenAI-compatible client wrapper targeting the DeepSeek API.
// Avoids native library compilation and runtime SDK import conflicts.
// ============================================================================

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekCompletionOptions {
  model?: string;
  messages: DeepSeekMessage[];
  temperature?: number;
  max_tokens?: number;
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
    content: string;
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

/**
 * Executes a chat completion request to the DeepSeek API.
 */
export async function createDeepSeekCompletion(
  options: DeepSeekCompletionOptions
): Promise<DeepSeekCompletionResponse> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY is not defined in the environment variables.');
  }

  // Map to deepseek-v4-flash
  const model = 'deepseek-v4-flash';

  // Construct request body
  const body: any = {
    model,
    messages: options.messages,
  };

  // Map the thinking configuration to the body structure expected by DeepSeek V4 Flash API
  if (options.thinking) {
    body.thinking = options.thinking;
  }

  // Only include temperature if thinking is disabled, as thinking mode does not support temperature customization
  const isThinking = options.thinking?.type === 'enabled';
  if (!isThinking && options.temperature !== undefined) {
    body.temperature = options.temperature;
  }

  if (options.max_tokens !== undefined) {
    body.max_tokens = options.max_tokens;
  }

  if (options.response_format) {
    body.response_format = options.response_format;
  }

  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[DeepSeek API] Error response (${res.status}):`, errorText);
      throw new Error(`DeepSeek API request failed with status ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    return data as DeepSeekCompletionResponse;
  } catch (error) {
    console.error('[DeepSeek Client] Execution error:', error);
    throw error;
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

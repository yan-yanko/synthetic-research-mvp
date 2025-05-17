console.log('[server/llmClient.ts] TOP OF FILE - Test Log 1');

import OpenAI from 'openai';
import { ChatCompletion, ChatCompletionMessageParam } from 'openai/resources/chat/completions';

console.log('[server/llmClient.ts] Before any OpenAI related code - Test Log 2');

// --- Debugging Start ---
// console.log('[server/llmClient.ts] Loading... OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY);
// if (process.env.OPENAI_API_KEY) {
//   console.log('[server/llmClient.ts] OPENAI_API_KEY starts with:', process.env.OPENAI_API_KEY.substring(0, 5));
// }
// --- Debugging End ---

if (!process.env.OPENAI_API_KEY) {
  console.error("CRITICAL: OPENAI_API_KEY environment variable is not set.");
  // Optionally, throw an error to prevent the application from starting/running without the key
  // throw new Error("CRITICAL: OPENAI_API_KEY environment variable is not set.");
}

const defaultOpenAIClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL, // Optional: if using a proxy or non-standard base URL
});

const DEFAULT_MODEL = 'gpt-4o';
const DEFAULT_MAX_TOKENS = 2000; // Adjusted for potentially larger responses
const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT_MS = 60000; // 60 seconds default timeout, as generation can take time

export interface LLMCallParams {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  // baseURL is handled by client instantiation now
}

async function callLLMWithRetries(
  systemPrompt: string,
  userPrompt: string,
  params?: LLMCallParams
): Promise<ChatCompletion> {
  let retries = 0;
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  const model = params?.model || DEFAULT_MODEL;
  const temperature = params?.temperature || 0.7;
  const max_tokens = params?.maxTokens || DEFAULT_MAX_TOKENS;
  const timeout = params?.timeoutMs || DEFAULT_TIMEOUT_MS;

  console.log(`[server/llmClient.ts] Attempting LLM call. Model: ${model}, Temp: ${temperature}, MaxTokens: ${max_tokens}, Timeout: ${timeout}ms`);

  while (retries < MAX_RETRIES) {
    try {
      const completion: ChatCompletion = await defaultOpenAIClient.chat.completions.create({
        model: model,
        messages: messages,
        temperature: temperature,
        max_tokens: max_tokens,
        // top_p: (optional)
        // frequency_penalty: (optional)
        // presence_penalty: (optional)
      }, { timeout });

      if (!completion.choices || completion.choices.length === 0 || !completion.choices[0].message?.content) {
        throw new Error('LLM response was empty or invalid.');
      }
      console.log(`[server/llmClient.ts] LLM call successful. Usage: ${JSON.stringify(completion.usage)}`);
      return completion;
    } catch (error: any) {
      retries++;
      console.error(`[server/llmClient.ts] LLM call failed (attempt ${retries}/${MAX_RETRIES}):`, error.message);
      if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
        console.error('[server/llmClient.ts] Timeout error detected.');
      }
      if (retries >= MAX_RETRIES) {
        console.error('[server/llmClient.ts] Max retries reached. Rethrowing error.');
        throw error; // Rethrow the last error
      }
      // Optional: add a delay before retrying
      // await new Promise(resolve => setTimeout(resolve, 1000 * retries)); 
    }
  }
  // Should not be reached if MAX_RETRIES > 0, but as a fallback:
  throw new Error('LLM call failed after all retries and loop exited unexpectedly.');
}

export const llmClient = {
  callLLM: callLLMWithRetries,
};

console.log('[server/llmClient.ts] LLM Client initialized.');

console.log('[server/llmClient.ts] BOTTOM OF FILE - Test Log 4'); 
console.log('[server/llmClient.ts] TOP OF FILE - Test Log 1');

// import OpenAI from 'openai';
// import { ChatCompletion, ChatCompletionMessageParam } from 'openai/resources/chat/completions';

console.log('[server/llmClient.ts] Before any OpenAI related code - Test Log 2');

// --- Debugging Start ---
// console.log('[server/llmClient.ts] Loading... OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY);
// if (process.env.OPENAI_API_KEY) {
//   console.log('[server/llmClient.ts] OPENAI_API_KEY starts with:', process.env.OPENAI_API_KEY.substring(0, 5));
// }
// --- Debugging End ---

// console.log('[server/llmClient.ts] Instantiating defaultOpenAIClient...');
// console.log('[server/llmClient.ts]   Using apiKey (first 5 chars):', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 5) : 'undefined');
// console.log('[server/llmClient.ts]   Using baseURL:', process.env.OPENAI_BASE_URL);
// const defaultOpenAIClient = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

const DEFAULT_MAX_TOKENS = 1500;
const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT_MS = 30000; // 30 seconds default timeout

export interface LLMCallParams {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number; // For timeout per request, in milliseconds
  baseURL?: string;   // For custom base URL per request
}

/**
 * Calls the LLM with retry logic, custom timeouts, dynamic baseURL, and usage monitoring.
 * @param systemPrompt The system message for the LLM.
 * @param userPrompt The user message for the LLM.
 * @param params LLM parameters like temperature, maxTokens, timeoutMs, baseURL.
 * @returns The OpenAI ChatCompletion object.
 * @throws Throws an error if the API call fails after all retries.
 */
async function callLLMWithRetries(
  _systemPrompt: string,
  _userPrompt: string,
  _params?: any
): Promise<any> {
  console.log('[server/llmClient.ts] callLLMWithRetries CALLED - Test Log 3');
  // Simulate an error similar to the one observed
  throw new Error("Simulated error from dummy llmClient: URL is required"); 
}

export const llmClient = {
  callLLM: callLLMWithRetries,
};

console.log('[server/llmClient.ts] BOTTOM OF FILE - Test Log 4'); 
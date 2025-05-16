import OpenAI from 'openai';
import { ChatCompletion, ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// Default client, used if no custom baseURL is provided in call params
// It will use OPENAI_API_KEY from env.
// It can also be configured with a default baseURL from env if desired:
// const defaultOpenAIClient = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
//   baseURL: process.env.OPENAI_BASE_URL, // Optional: for a global override
// });
// For simplicity, if OPENAI_BASE_URL is not standard, let's initialize it simply:
const defaultOpenAIClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


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
  systemPrompt: string,
  userPrompt: string,
  params?: LLMCallParams
): Promise<ChatCompletion> {
  let attempts = 0;
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  // Select or create OpenAI client based on params.
  // If a baseURL is provided in params, a new client is instantiated for this call.
  // This allows dynamic base URLs per call, though it's less efficient than using a pre-configured client.
  const client = params?.baseURL && params.baseURL !== defaultOpenAIClient.baseURL
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY, baseURL: params.baseURL, timeout: params?.timeoutMs || DEFAULT_TIMEOUT_MS })
    : defaultOpenAIClient;

  // If using defaultOpenAIClient and a specific timeout is requested for THIS call,
  // we need to pass it in RequestOptions if the client itself wasn't re-instantiated.
  // However, the new client instantiation above already incorporates the timeout.
  // If client is defaultOpenAIClient, we may want to ensure its preconfigured timeout is used or allow override via RequestOptions.
  // For now, if a custom baseURL is given, a new client with the specific timeout is made.
  // If no custom baseURL, default client is used. We should allow overriding its timeout for THIS call.

  let requestOptions = {};
  if (client === defaultOpenAIClient && params?.timeoutMs) {
      // Only set timeout in requestOptions if using the default client AND a specific timeout for this call is provided.
      // If a new client was made for a custom baseURL, its timeout is already set during construction.
      requestOptions = { timeout: params.timeoutMs };
  }
   // If the default client was constructed with a timeout, and params.timeoutMs is not set, that pre-configured timeout will apply.
   // If default client was NOT constructed with a timeout, and params.timeoutMs IS set, the requestOptions will pass it.

  while (attempts < MAX_RETRIES) {
    try {
      const response = await client.chat.completions.create({
        model: params?.model || 'gpt-3.5-turbo',
        messages: messages,
        temperature: params?.temperature ?? 0.7,
        max_tokens: params?.maxTokens || DEFAULT_MAX_TOKENS,
        // Removed timeout from here based on linter error
      }, requestOptions); // Pass requestOptions here, which might include a timeout

      if (response.usage) {
        console.log(`Prompt Tokens: ${response.usage.prompt_tokens}, Completion Tokens: ${response.usage.completion_tokens}, Total Tokens: ${response.usage.total_tokens}`);
      }
      
      if (!response.choices || response.choices.length === 0 || !response.choices[0].message?.content) {
        // Check for content presence as well
        throw new Error('LLM returned no choices or message content.');
      }
      return response;
    } catch (error: any) {
      attempts++;
      const modelIdentifier = params?.model || 'gpt-3.5-turbo';
      if (attempts >= MAX_RETRIES) {
        console.error(`LLM call failed after ${MAX_RETRIES} attempts for model ${modelIdentifier}:`, error.message);
        throw error;
      }
      // Exponential backoff: 2s, 4s, 8s for attempts 1, 2, 3 respectively after failure
      const delay = 1000 * (2 ** attempts); 
      console.warn(`LLM call attempt ${attempts} for model ${modelIdentifier} failed. Retrying in ${delay / 1000}s... Error: ${error.message}`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  // This line should ideally be unreachable if MAX_RETRIES >= 1
  throw new Error('LLM call failed after all retries and loop exited unexpectedly.');
}

export const llmClient = {
  callLLM: callLLMWithRetries,
}; 
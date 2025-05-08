/**
 * LLM Client for handling API requests to language models
 */

// Configuration interface for the LLM API
export interface LLMClientConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
}

// Default configuration values
const DEFAULT_CONFIG: LLMClientConfig = {
  model: 'gpt-4',
  maxTokens: 2048,
  temperature: 0.7,
  timeout: 60000 // 60 seconds
};

/**
 * Abstract base class for LLM API clients
 * This allows us to implement multiple LLM providers with the same interface
 */
export abstract class LLMClient {
  protected config: LLMClientConfig;
  
  constructor(config: LLMClientConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  
  /**
   * Process a prompt through the LLM API
   * @param prompt - The text prompt to send to the LLM
   * @returns Promise resolving to the LLM's response
   */
  abstract callLLM(prompt: string): Promise<string>;
}

/**
 * OpenAI API implementation of the LLM client
 */
export class OpenAIClient extends LLMClient {
  constructor(config: LLMClientConfig = {}) {
    super({
      baseUrl: 'https://api.openai.com/v1/chat/completions',
      ...config
    });
    
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key is required');
    }
  }
  
  /**
   * Calls the OpenAI API with the provided prompt
   * @param prompt - The text prompt to send to OpenAI
   * @returns Promise resolving to the API response text
   */
  async callLLM(prompt: string): Promise<string> {
    try {
      const response = await fetch(this.config.baseUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature
        }),
        signal: AbortSignal.timeout(this.config.timeout!)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error calling OpenAI API: ${error.message}`);
      }
      throw new Error('Unknown error occurred while calling OpenAI API');
    }
  }
}

/**
 * Mock LLM client for testing or development without API calls
 */
export class MockLLMClient extends LLMClient {
  private mockResponses: Map<string, string>;
  
  constructor(config: LLMClientConfig = {}) {
    super(config);
    this.mockResponses = new Map();
  }
  
  /**
   * Add a mock response for a specific prompt keyword
   * @param keyword - The keyword to trigger this mock response
   * @param response - The mock response to return
   */
  addMockResponse(keyword: string, response: string): void {
    this.mockResponses.set(keyword.toLowerCase(), response);
  }
  
  /**
   * Returns a predetermined mock response based on the prompt content
   * @param prompt - The text prompt that would normally go to an LLM
   * @returns Promise resolving to a mock response
   */
  async callLLM(prompt: string): Promise<string> {
    // Check for keyword matches in the prompt
    const lowerPrompt = prompt.toLowerCase();
    let matchedResponse: string | undefined;
    
    // Use Array.from() with forEach instead of for..of iteration
    Array.from(this.mockResponses.keys()).forEach(keyword => {
      if (lowerPrompt.includes(keyword) && !matchedResponse) {
        matchedResponse = this.mockResponses.get(keyword);
      }
    });
    
    if (matchedResponse) {
      return matchedResponse;
    }
    
    // Default mock response if no keyword matches
    return `
## Initial Impression
This is a mock response for testing purposes. Your prompt was: "${prompt.substring(0, 50)}..."

## Slide-by-Slide Analysis
### Slide 1
This is mock feedback for slide 1. In a real implementation, this would contain analysis based on the investor persona.

## Investment Decision
- Decision: [NEED MORE INFORMATION]
- Confidence: [MEDIUM]
- Key Strengths: [Clear concept, Promising market]
- Key Concerns: [Execution risks, Competition]
- Questions I Would Ask: [How do you plan to acquire customers?, What is your timeline for profitability?]
`;
  }
}

/**
 * Factory function to create an appropriate LLM client based on environment and configuration
 * @param config - The LLM client configuration
 * @returns An instance of an LLM client
 */
export function createLLMClient(config: LLMClientConfig = {}): LLMClient {
  // Check if we're in a test or development environment
  const isTestEnv = process.env.NODE_ENV === 'test';
  const isDevEnv = process.env.NODE_ENV === 'development' && process.env.USE_MOCK_LLM === 'true';
  
  if (isTestEnv || isDevEnv) {
    return new MockLLMClient(config);
  }
  
  // Default to OpenAI client with API key from environment or config
  const apiKey = config.apiKey || process.env.OPENAI_API_KEY;
  return new OpenAIClient({ ...config, apiKey });
} 
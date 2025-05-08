/**
 * Centralized type definitions for API interactions
 */

/**
 * Configuration for LLM API client
 */
export interface LLMClientConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
}

/**
 * Request to generate investor feedback
 */
export interface GenerateFeedbackRequest {
  deckSlides: string[];
  elevatorPitch: string;
  personaId?: string;
}

/**
 * Error reporting payload structure
 */
export interface ErrorReportPayload {
  error: Error | unknown;
  action: string;
  url?: string; 
  userInput?: Record<string, any>;
  timestamp?: string;
}

/**
 * Request to fetch URL content
 */
export interface FetchUrlRequest {
  url: string;
}

/**
 * Response from URL content fetch
 */
export interface FetchUrlResponse {
  content: string;
}

/**
 * Request for analyzing a pitch deck
 */
export interface PitchDeckAnalysisRequest {
  personaId?: string;
  elevatorPitch?: string;
  file?: File;
}

/**
 * Request for simulating a follow-up response
 */
export interface FollowUpRequest {
  initialFeedback: string;
  followUpContext: string;
  personaId: string;
}

/**
 * Structure for pitch feedback response
 */
export interface PitchFeedbackResponse {
  responses: {
    role: string;
    background: string; 
    feedback: string;
  }[];
  realInvestors?: any[];  // For real investor matches
} 
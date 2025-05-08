/**
 * Centralized type definitions for feedback in the Synthetic Research system
 */

/**
 * Represents feedback for an individual slide
 */
export interface SlideReaction {
  slideNumber: number;
  slideTitle?: string;
  slideContent?: string;
  feedback: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'critical';
  suggestedImprovements?: string[];
}

/**
 * Represents overall feedback from an investor
 */
export interface OverallFeedback {
  investmentDecision: 'Highly Interested' | 'Interested with concerns' | 'Requires major changes' | 'Not interested';
  decisionRationale: string;
  strengthPoints: string[];
  concernPoints: string[];
  followupQuestions: string[];
}

/**
 * Main feedback object returned from the synthetic persona engine
 */
export interface FeedbackObject {
  investorId: string;
  investorName: string;
  investorType: string;
  timestamp: string;
  pitchDeckFilename?: string;
  slideFeedback: SlideReaction[];
  overallFeedback: OverallFeedback;
  processingMetadata?: {
    totalSlides: number;
    processingTimeMs: number;
    elevatorPitchIncluded: boolean;
  };
}

/**
 * Structured feedback response from investor evaluation
 */
export interface FeedbackResponse {
  personaId: string;
  personaName: string;
  personaType: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  initialImpression: string;
  slideAnalysis: Map<number, string>;
  decision: {
    decision: string;
    confidence: string;
  };
  keyTakeaways: {
    type: 'strength' | 'concern' | 'question';
    text: string;
  }[];
  fullResponse: string;
}

/**
 * Legacy feedback item format for backward compatibility
 */
export interface FeedbackItem {
  id: string;
  persona: string;
  feedback: string;
  strengths: string[];
  concerns: string[];
  recommendation: string;
  slides?: {
    [key: string]: { relevance: number; comments: string }
  };
}

/**
 * Summary of sentiment across multiple feedback responses
 */
export interface SummarySentiment {
  positive: number;
  neutral: number;
  negative: number;
}

/**
 * Aggregated summary of all investor feedback
 */
export interface InvestorSummary {
  consensusStatement: string;
  sentimentSummary: SummarySentiment;
  topConcerns: string[];
  topStrengths: string[];
  investmentLikelihood: number; // 0-100 scale
  recommendedNextSteps: string[];
}

/**
 * Response format for follow-up explanations
 */
export interface FollowUpResponse {
  personaId: string;
  personaName: string;
  updatedResponse: string;
  updatedSentiment: 'improved' | 'unchanged' | 'worsened';
} 
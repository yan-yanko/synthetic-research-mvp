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

/**
 * Represents an error state for a persona's feedback generation.
 */
export interface FeedbackError {
  personaId: string;
  personaName: string;
  error: string;
}

export interface InvestorFeedbackResponse {
  personaFeedbacks: PersonaFeedback[];
  consensusReport: ConsensusReport;
  generatedExecutiveSummary?: string;
}

export interface PersonaFeedback {
  persona: string;
  biasApplied: boolean;
  wouldTakeMeeting: "Yes" | "No";
  strengths: string[];
  concerns: string[];
  emotionalTriggers: string[];
  verdict: "Invest" | "Pass" | "Monitor and Revisit Later";
}

export interface ConsensusReport {
  likelihoodToInvest: number;
  summary: string;
}

// The old mockData is commented out as it's incompatible with the new InvestorFeedbackResponse structure
// and the new API handler has its own fallback logic.
/*
export interface MockSlideFeedback {
  slide: string;
  feedback: string;
}
*/

// Updated mockData to align with the new InvestorFeedbackResponse structure
export const mockData: InvestorFeedbackResponse = {
  personaFeedbacks: [
    {
      persona: "Angel Investor (Mock)",
      biasApplied: false,
      wouldTakeMeeting: "No",
      strengths: ["Mock strength 1: Interesting concept"],
      concerns: ["Mock concern 1: Market size unclear", "Mock concern 2: Needs more validation"],
      emotionalTriggers: ["Curiosity"],
      verdict: "Pass"
    },
    {
      persona: "Analytical VC (Mock)",
      biasApplied: true,
      wouldTakeMeeting: "No",
      strengths: ["Mock strength 1: Technically sound (assumed)"],
      concerns: ["Mock concern 1: No data-driven proof shown", "Mock concern 2: Financial projections missing"],
      emotionalTriggers: ["Skepticism"],
      verdict: "Pass"
    }
  ],
  consensusReport: {
    likelihoodToInvest: 15, // Mock value
    summary: "This is mock data. Based on limited mock feedback, overall interest is low. Key concerns revolve around market validation and data."
  },
  generatedExecutiveSummary: "This is a mock executive summary based on the mock pitch deck content. It highlights key aspects and potential for growth."
}; 
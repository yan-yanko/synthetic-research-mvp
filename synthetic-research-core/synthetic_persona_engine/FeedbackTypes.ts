export interface SlideReaction {
  slideNumber: number;
  slideTitle?: string;
  slideContent?: string;
  feedback: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'critical';
  suggestedImprovements?: string[];
}

export interface OverallFeedback {
  investmentDecision: 'Highly Interested' | 'Interested with concerns' | 'Requires major changes' | 'Not interested';
  decisionRationale: string;
  strengthPoints: string[];
  concernPoints: string[];
  followupQuestions: string[];
}

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

export const FeedbackObjectSchema = {
  type: "object",
  properties: {
    investorId: {
      type: "string"
    },
    investorName: {
      type: "string"
    },
    investorType: {
      type: "string"
    },
    timestamp: {
      type: "string",
      format: "date-time"
    },
    pitchDeckFilename: {
      type: "string"
    },
    slideFeedback: {
      type: "array",
      items: {
        type: "object",
        properties: {
          slideNumber: {
            type: "number"
          },
          slideTitle: {
            type: "string"
          },
          slideContent: {
            type: "string"
          },
          feedback: {
            type: "string"
          },
          sentiment: {
            type: "string",
            enum: ["positive", "neutral", "negative", "critical"]
          },
          suggestedImprovements: {
            type: "array",
            items: {
              type: "string"
            }
          }
        },
        required: ["slideNumber", "feedback", "sentiment"]
      }
    },
    overallFeedback: {
      type: "object",
      properties: {
        investmentDecision: {
          type: "string",
          enum: ["Highly Interested", "Interested with concerns", "Requires major changes", "Not interested"]
        },
        decisionRationale: {
          type: "string"
        },
        strengthPoints: {
          type: "array",
          items: {
            type: "string"
          }
        },
        concernPoints: {
          type: "array",
          items: {
            type: "string"
          }
        },
        followupQuestions: {
          type: "array",
          items: {
            type: "string"
          }
        }
      },
      required: ["investmentDecision", "decisionRationale", "strengthPoints", "concernPoints", "followupQuestions"]
    },
    processingMetadata: {
      type: "object",
      properties: {
        totalSlides: {
          type: "number"
        },
        processingTimeMs: {
          type: "number"
        },
        elevatorPitchIncluded: {
          type: "boolean"
        }
      }
    }
  },
  required: ["investorId", "investorName", "investorType", "timestamp", "slideFeedback", "overallFeedback"]
}; 
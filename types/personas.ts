/**
 * Centralized type definitions for investor personas
 */

/**
 * Type definitions for investor types
 */
export type InvestorType = 'Angel' | 'Seed VC' | 'Series A VC' | 'Corporate VC' | 'Operator' | 'SaaS VC' | 'AI Skeptic';

/**
 * Type definitions for communication styles
 */
export type CommunicationStyle = 'blunt' | 'polished' | 'visionary' | 'intellectual';

/**
 * Interface for a synthetic investor persona
 */
export interface SyntheticInvestor {
  id: string;
  name: string;
  type: InvestorType;
  investmentThesis: string;
  behavioralTraits: string[];
  quoteStyle: CommunicationStyle;
  publicDataAnchors?: string[]; // e.g., ['a16z blog', 'Twitter', 'TechCrunch', 'Reddit']
}

/**
 * Interface for a simplified investor response
 */
export interface InvestorResponse {
  role: string;
  background: string;
  feedback: string;
} 
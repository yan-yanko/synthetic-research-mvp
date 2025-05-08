/**
 * Application-wide constants
 */

// API and Network
export const DEFAULT_TIMEOUT_MS = 60000;
export const DEFAULT_REQUEST_TIMEOUT_MS = 30000;

// LLM Settings
export const LLM_DEFAULT_MODEL = 'gpt-4';
export const LLM_DEFAULT_TEMPERATURE = 0.7;
export const LLM_DEFAULT_MAX_TOKENS = 2048;

// UI Constants
export const MAX_FILE_SIZE_MB = 10;
export const MAX_DISPLAYED_FILENAME_LENGTH = 100;

// Investor Types
export const INVESTOR_TYPES = [
  'Angel',
  'Seed VC',
  'Series A VC',
  'Corporate VC',
  'Operator',
  'SaaS VC',
  'AI Skeptic'
] as const;

// Communication Styles
export const COMMUNICATION_STYLES = [
  'blunt',
  'polished',
  'visionary',
  'intellectual'
] as const;

// Decision Types
export const DECISION_TYPES = [
  'Highly Interested',
  'Interested with concerns',
  'Requires major changes',
  'Not interested'
] as const;

// Sentiment Types
export const SENTIMENT_TYPES = [
  'positive',
  'neutral',
  'negative',
  'critical'
] as const;

// Follow-up Sentiment Change Types
export const FOLLOWUP_SENTIMENT_CHANGE_TYPES = [
  'improved',
  'unchanged',
  'worsened'
] as const;

// Error Actions
export const ERROR_ACTIONS = {
  PITCH_UPLOAD: 'pitch_deck_upload',
  FILE_UPLOAD: 'file_upload_component_error',
  FETCH_URL: 'fetch_url_error',
  GENERATE_FEEDBACK: 'generate_feedback_error',
  SIMULATE_FOLLOWUP: 'simulate_followup_error'
}; 
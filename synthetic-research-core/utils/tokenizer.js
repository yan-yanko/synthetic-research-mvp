/**
 * tokenizer.js
 *
 * Shared text tokenization utilities for use across all modules.
 * Supports splitting, cleaning, and preparing text for analysis or LLM input.
 */

// Implementation goes here 

/**
 * Simple tokenizer utility for scoring or prompt inspection.
 */
export function countTokens(text) {
  return text.split(/\s+/).length;
} 
/**
 * matchInvestorFromText()
 * 
 * Purpose:
 * Analyzes combined pitchText + deck text and returns the most relevant synthetic investor profile.
 * 
 * Inputs:
 *  - string: combined input text
 * 
 * Output:
 *  - object: {
 *      name: string (e.g. "Seed-Stage SaaS VC"),
 *      background: string (used in GPT prompt)
 *    }
 * 
 * Implementation:
 * - Heuristic keyword matching (early version)
 * - To be replaced by smarter GPT-based extractor or taxonomy lookup
 */

/**
 * investorSelector.js
 * 
 * Implements heuristics for matching the most appropriate investor profile
 * based on the content of a pitch deck.
 */

/**
 * Analyzes the text of a pitch deck and returns the most appropriate
 * investor profile based on keywords and content themes.
 * 
 * @param {string} text - The text content of the pitch deck
 * @returns {Object} An investor profile object with name and background
 */
export function matchInvestorFromText(text) {
  const lowered = text.toLowerCase();

  // B2B SaaS investor
  if ((lowered.includes('b2b') || lowered.includes('business to business')) && 
      (lowered.includes('saas') || lowered.includes('software as a service'))) {
    return {
      name: "Seed-Stage B2B SaaS VC",
      background: "Invests in scalable B2B software with strong GTM motion"
    };
  }

  // Consumer/community focused investor
  if (lowered.includes('consumer') || 
      lowered.includes('community') || 
      lowered.includes('social') ||
      lowered.includes('marketplace')) {
    return {
      name: "Consumer Angel Investor",
      background: "Former founder, backs early consumer ideas based on vision"
    };
  }

  // Healthcare/biotech investor
  if (lowered.includes('health') || 
      lowered.includes('medical') || 
      lowered.includes('biotech') ||
      lowered.includes('healthcare')) {
    return {
      name: "Healthcare VC",
      background: "Seeks innovative solutions with strong IP and clinical validation"
    };
  }

  // Deep tech/AI investor
  if (lowered.includes('artificial intelligence') || 
      lowered.includes(' ai ') || 
      lowered.includes('machine learning') ||
      lowered.includes('deep tech')) {
    return {
      name: "Deep Tech Investor",
      background: "Invests in foundational technologies with defensible IP and significant technical moats"
    };
  }

  // Default to generalist
  return {
    name: "Generalist Pre-Seed VC",
    background: "Looks for clarity, grit, and category insight"
  };
} 
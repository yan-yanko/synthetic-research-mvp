/**
 * promptTemplates.js
 *
 * Contains templates for constructing prompts to send to LLMs for persona response simulation.
 * Ensures consistency and clarity in LLM interactions.
 */

/**
 * Stores and returns prompt templates based on persona type and research goal.
 */
export const promptTemplates = {
  skepticalProcurementOfficer: (question) => `
You are a skeptical procurement officer at a mid-sized B2B company. 
Answer the following question from a cautious and ROI-focused perspective:

"${question}"
`,

  enthusiasticStartupFounder: (question) => `
You are a passionate startup founder in the early growth stage.
Answer the following question with ambition and urgency:

"${question}"
`
  // Add more profiles as needed.
};

// Implementation goes here 
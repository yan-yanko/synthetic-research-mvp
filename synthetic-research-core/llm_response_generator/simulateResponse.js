/**
 * simulateResponse.js
 *
 * Simulates persona responses using LLMs and prompt templates.
 * Used to generate synthetic feedback for research scenarios.
 */

/**
 * Generates a synthetic response to a user research prompt using selected prompt template and LLM.
 */
import { promptTemplates } from './promptTemplates.js';
import { getLLMConfig } from './variationControl.js';

export async function simulateResponse({ persona, question, openai }) {
  const profilePrompt = promptTemplates[persona.simulationProfile](question);
  const llmConfig = getLLMConfig(persona);

  const res = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "system", content: "You are a market research participant." },
               { role: "user", content: profilePrompt }],
    ...llmConfig
  });

  return res.choices[0].message.content;
}

// Implementation goes here 
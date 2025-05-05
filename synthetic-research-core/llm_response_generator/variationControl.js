/**
 * variationControl.js
 *
 * Controls and manages variation in generated persona responses.
 * Supports testing of different scenarios and response diversity.
 */

/**
 * Controls temperature, randomness, and variability in LLM responses.
 */
export function getLLMConfig(persona) {
  const base = {
    temperature: 0.7,
    max_tokens: 200,
    top_p: 0.9
  };

  if (persona.psychographics.bigFive.neuroticism > 0.7) {
    base.temperature += 0.1;
  }

  if (persona.psychographics.bigFive.extraversion > 0.7) {
    base.max_tokens += 50;
  }

  return base;
}

// Implementation goes here 
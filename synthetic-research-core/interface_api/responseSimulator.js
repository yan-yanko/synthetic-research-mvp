/**
 * responseSimulator.js
 *
 * API for simulating persona responses to research prompts.
 * Integrates with the LLM response generator and persona engine.
 */

/**
 * Takes a survey or interview and returns synthetic responses.
 */

export async function simulateResponsesForAudience({ openai, audience, prompt }) {
  const results = [];

  for (const persona of audience) {
    const personaPrompt = `
You are a synthetic persona designed for market research.

Demographics:
- Age: ${persona.ageBracket}
- Gender: ${persona.gender}
- Role: ${persona.jobRole}
- Industry: ${persona.industry}
- Location: ${persona.location}

Personality traits (Big Five): ${persona.personality}

Respond to the following product message from your point of view:
"${prompt}"

Write in 1st person. Be specific. Mention what resonates or concerns you, and what you would want improved or clarified.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: personaPrompt }],
      temperature: 0.8
    });

    results.push({
      persona,
      response: completion.choices[0].message.content
    });
  }

  return results;
} 
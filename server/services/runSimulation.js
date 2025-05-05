import { buildAudience } from '../../synthetic-research-core/interface_api/audienceBuilder.js';
import { simulateResponsesForAudience } from '../../synthetic-research-core/interface_api/responseSimulator.js';
import { openai } from './openaiClient.js';

export async function runSimulation(prompt, config) {
  const audience = buildAudience(config, 5); // default to 5 responses for speed
  const results = await simulateResponsesForAudience({ openai, audience, prompt });
  return results;
} 
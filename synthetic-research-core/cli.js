/**
 * CLI for testing synthetic research pipeline.
 * Usage:
 *   node cli.js --audience=25 --prompt="What would make you switch to a new B2B SaaS platform?"
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { buildAudience } from './interface_api/audienceBuilder.js';
import { simulateResponsesForAudience } from './interface_api/responseSimulator.js';
import { exportToTranscript } from './interface_api/exportManager.js';
import { argv } from 'node:process';

import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Parse CLI args
const args = Object.fromEntries(argv.slice(2).map(arg => {
  const [key, value] = arg.replace('--', '').split('=');
  return [key, value];
}));

(async () => {
  const size = parseInt(args.audience || '10');
  const prompt = args.prompt || 'What problem does this product solve for you?';

  const audience = buildAudience({ geography: 'US' }, size);
  const responses = await simulateResponsesForAudience({ openai, audience, prompt });

  exportToTranscript(responses, './outputs/synthetic_transcript.txt');
  console.log(`✅ Generated ${responses.length} synthetic responses.`);
})(); 
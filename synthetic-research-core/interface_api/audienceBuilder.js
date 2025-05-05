/**
 * audienceBuilder.js
 *
 * API for building and customizing synthetic research audiences.
 * Provides methods for defining audience segments and characteristics.
 */

import fs from 'fs';
import path from 'path';
import { sampleFromDistribution } from '../utils/randomSampler.js';
import { fileURLToPath } from 'url';

// Get directory path that works in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');
const censusPath = path.join(projectRoot, 'synthetic-research-core', 'dataSources', 'censusDistributions.json');

// Log path for debugging
console.log('Loading census data from:', censusPath);
const census = JSON.parse(fs.readFileSync(censusPath, 'utf-8'));

export function buildAudience(config = {}, count = 5) {
  const { geography = 'US' } = config;

  const demoDist = census[geography];
  if (!demoDist) throw new Error(`No census data for region: ${geography}`);

  const audience = [];

  for (let i = 0; i < count; i++) {
    const persona = {
      ageBracket: sampleFromDistribution(demoDist.age),
      gender: sampleFromDistribution(demoDist.gender),
      jobRole: sampleFromDistribution(demoDist.jobRoles),
      industry: sampleFromDistribution(demoDist.industries),
      location: sampleFromDistribution(demoDist.locations),
      personality: sampleFromDistribution(demoDist.big5),
    };

    audience.push(persona);
  }

  return audience;
} 
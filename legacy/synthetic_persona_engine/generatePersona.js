/**
 * generatePersona.js
 *
 * Generates synthetic personas based on provided constraints and psychographic profiles.
 * Used by the Synthetic Persona Engine to create diverse, realistic audience members for research simulation.
 */

/**
 * Generates a synthetic persona based on demographic inputs and behavioral conditioning.
 */
import { enforceConstraints } from './constraints.js';
import { enrichWithPsychographics } from './psychographics.js';
import { sampleFromDistribution } from '../utils/randomSampler.js';

// Hard-coded data to avoid file system issues
const censusData = {
  "age": {"18-24": 0.15, "25-34": 0.25, "35-44": 0.2, "45-54": 0.2, "55-64": 0.1, "65+": 0.1},
  "gender": {"Male": 0.49, "Female": 0.5, "Other": 0.01},
  "jobRole": {"Manager": 0.2, "Individual Contributor": 0.5, "Executive": 0.1, "Intern": 0.1, "VP": 0.1},
  "geography": {"US": 0.6, "UK": 0.15, "Canada": 0.1, "Germany": 0.1, "Other": 0.05},
  "education": {"None": 0.05, "High School": 0.25, "Bachelor's": 0.45, "Master's": 0.2, "PhD": 0.05},
  "income": {"Low": 0.3, "Medium": 0.5, "High": 0.2}
};

export function generatePersona(config) {
  const persona = {
    age: sampleFromDistribution(censusData.age, config),
    gender: sampleFromDistribution(censusData.gender, config),
    jobRole: sampleFromDistribution(censusData.jobRole, config),
    geography: config.geography || sampleFromDistribution(censusData.geography),
    education: sampleFromDistribution(censusData.education),
    incomeBracket: sampleFromDistribution(censusData.income),
  };

  enforceConstraints(persona);
  enrichWithPsychographics(persona);

  return persona;
}

// Implementation goes here 
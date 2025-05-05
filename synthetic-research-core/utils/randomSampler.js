/**
 * randomSampler.js
 *
 * Provides random sampling utilities for use in persona generation, validation, and simulation.
 * Ensures statistically sound sampling across modules.
 */

/**
 * Samples a value from a probability distribution object.
 */
export function sampleFromDistribution(distObj, config = {}) {
  const entries = Object.entries(distObj);
  const rand = Math.random();
  let cumulative = 0;
  for (const [key, prob] of entries) {
    cumulative += prob;
    if (rand <= cumulative) return key;
  }
  return entries[entries.length - 1][0]; // fallback
}

// Implementation goes here 
/**
 * fidelityScoring.js
 *
 * Scores the fidelity of synthetic personas and their responses compared to real data.
 * Used to quantify the quality and trustworthiness of synthetic research outputs.
 */

/**
 * Computes a composite fidelity score using distribution match, multivariate similarity, and classifier fooling.
 */
import { compareDistributions } from './compareDistributions';
import { benchmark } from './benchmarkRealVsSynthetic';

export function computeFidelityScore(realData, syntheticData) {
  const distributionMetrics = compareDistributions(realData, syntheticData);
  const benchmarkMetrics = benchmark(realData, syntheticData);

  return {
    score: (
      0.4 * (1 - distributionMetrics.chiSquare.pValue) +
      0.3 * benchmarkMetrics.accuracy +
      0.3 * benchmarkMetrics.classifierFoolingRate
    ).toFixed(2),
    breakdown: {
      distributionMatch: distributionMetrics,
      performanceMatch: benchmarkMetrics
    }
  };
}

// Implementation goes here 
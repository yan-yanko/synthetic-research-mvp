/**
 * compareDistributions.js
 *
 * Compares synthetic and real data distributions to assess similarity and identify gaps.
 * Used for validation of synthetic persona generation.
 */

// Implementation goes here 

/**
 * Compares real vs synthetic distribution using statistical tests.
 */
import { chiSquareTest, kolmogorovSmirnovTest } from './statisticalTests';

export function compareDistributions(realData, syntheticData) {
  return {
    chiSquare: chiSquareTest(realData, syntheticData),
    ksTest: kolmogorovSmirnovTest(realData, syntheticData)
  };
} 
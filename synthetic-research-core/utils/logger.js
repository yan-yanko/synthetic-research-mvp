/**
 * logger.js
 *
 * Shared logging utilities for all modules in the synthetic research core.
 * Supports info, warning, and error logging with consistent formatting.
 */

// Implementation goes here 

/**
 * Basic logging for debugging or tracking.
 */
export function logInfo(msg, obj = {}) {
  console.log(`[INFO] ${msg}`, obj);
}

export function logError(msg, err = {}) {
  console.error(`[ERROR] ${msg}`, err);
} 
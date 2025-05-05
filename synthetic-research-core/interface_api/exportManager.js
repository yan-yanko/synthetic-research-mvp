/**
 * exportManager.js
 *
 * Handles export of synthetic research results and data.
 * Supports multiple formats and integration with external tools.
 */

// Implementation goes here 

/**
 * Supports exporting responses in multiple formats.
 */
import fs from 'fs';

export function exportToCSV(data, path) {
  const header = Object.keys(data[0]).join(',');
  const rows = data.map(obj => Object.values(obj).join(','));
  const output = [header, ...rows].join('\n');
  fs.writeFileSync(path, output);
}

export function exportToJSON(data, path) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

export function exportToTranscript(data, path) {
  const lines = data.map(d => `Persona (${d.persona.jobRole}): ${d.response}`);
  fs.writeFileSync(path, lines.join('\n\n'));
} 
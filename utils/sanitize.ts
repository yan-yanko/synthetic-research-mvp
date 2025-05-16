/**
 * Sanitizes a string input by removing specific characters, potential prompt injection tokens,
 * and normalizing line breaks. Also trims leading/trailing whitespace.
 * @param input The string to sanitize.
 * @returns The sanitized string.
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    // console.warn('SanitizeInput received non-string input:', input);
    return ''; // Or handle as appropriate
  }
  
  let sanitized = input;

  // Remove characters often used in HTML/XML tags or for injection attempts
  sanitized = sanitized.replace(/[{}<>]/g, ''); 
  
  // Remove ### sequences (often used as delimiters or for prompt manipulation)
  sanitized = sanitized.replace(/###+/g, ''); 
  
  // Normalize line breaks (convert CR LF and CR to LF, then collapse multiple LFs)
  sanitized = sanitized.replace(/\r\n|\r/g, '\n');
  sanitized = sanitized.replace(/\n+/g, '\n');
  
  return sanitized.trim();
} 
import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Utility function to handle CORS headers for Next.js API routes
 * Returns true if the request was an OPTIONS preflight that was handled
 */
export function setCorsHeaders(req: NextApiRequest, res: NextApiResponse): boolean {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.vcpitcher.com');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end();
    return true; // Request handled
  }

  // Set CORS headers for actual request
  res.setHeader('Access-Control-Allow-Origin', 'https://www.vcpitcher.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  return false; // Request not handled, continue processing
} 
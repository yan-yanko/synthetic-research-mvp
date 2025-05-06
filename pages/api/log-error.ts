import type { NextApiRequest, NextApiResponse } from 'next';
import { setCorsHeaders } from '../../utils/cors';

interface ErrorLogPayload {
  message: string;
  stack?: string;
  url: string;
  timestamp: string;
  action: string;
  userInput?: Record<string, any>;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle CORS
  if (setCorsHeaders(req, res)) {
    return; // Preflight request handled
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const errorData = req.body as ErrorLogPayload;
    
    // Format log for better readability in console
    const logMessage = `
----- FRONTEND ERROR LOG -----
Time: ${errorData.timestamp}
URL: ${errorData.url}
Action: ${errorData.action}
Error: ${errorData.message}
${errorData.stack ? `Stack: ${errorData.stack}` : ''}
${errorData.userInput ? `User Input: ${JSON.stringify(errorData.userInput, null, 2)}` : ''}
-----------------------------
`;

    // Log to console for now (can be replaced with proper logging later)
    console.error(logMessage);

    // Always return 200 to avoid secondary errors
    return res.status(200).json({ success: true });
  } catch (error) {
    // Even in case of error processing the log, return 200
    console.error('Error processing error log:', error);
    return res.status(200).json({ success: true });
  }
} 
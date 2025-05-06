import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { reportError } from '../../utils/errorReporter';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // בסביבת פיתוח שלח לשרת המקומי, אחרת השתמש ב-API הפנימי
    const apiUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5001/api/simulate'
      : 'http://localhost:5001/api/simulate'; // בסביבת ייצור, צריך להשתמש בכתובת השרת האמיתית

    const response = await axios.post(apiUrl, req.body);
    return res.status(200).json(response.data);
  } catch (error: any) {
    await reportError({
      error,
      action: 'api_simulate',
      userInput: {
        bodySize: JSON.stringify(req.body || {}).length
      }
    });
    
    console.error('Error handling simulate request:', error);
    return res.status(500).json({ 
      error: 'Failed to handle simulate request',
      details: error.message 
    });
  }
} 
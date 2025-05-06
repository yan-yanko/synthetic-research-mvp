import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { reportError } from '../../../utils/errorReporter';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // בסביבת פיתוח שלח לשרת המקומי, אחרת השתמש באפליקציית שרת מאוחסנת
    const apiUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5001/api/pitch/simulate-pitch'
      : 'https://synthetic-research-api.onrender.com/api/pitch/simulate-pitch';

    const response = await axios.post(apiUrl, req.body);
    return res.status(200).json(response.data);
  } catch (error: any) {
    await reportError({
      error,
      action: 'api_pitch_simulate',
      userInput: {
        bodySize: JSON.stringify(req.body || {}).length
      }
    });
    
    console.error('Error handling pitch simulation request:', error);
    return res.status(500).json({ 
      error: 'Failed to handle pitch simulation request',
      details: error.message 
    });
  }
} 
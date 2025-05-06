import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

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
      ? 'http://localhost:5001/api/pitch/simulate-pitch'
      : 'http://localhost:5001/api/pitch/simulate-pitch'; // בסביבת ייצור, צריך להשתמש בכתובת השרת האמיתית

    const response = await axios.post(apiUrl, req.body);
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Error handling pitch simulation request:', error);
    return res.status(500).json({ 
      error: 'Failed to handle pitch simulation request',
      details: error.message 
    });
  }
} 
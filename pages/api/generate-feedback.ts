console.log('[API /generate-feedback] File execution started - ABSOLUTE TOP OF FILE V3');
import type { NextApiRequest, NextApiResponse } from 'next';
// THIS FILE SHOULD HAVE NO OTHER IMPORT STATEMENTS (COMMENTED OR OTHERWISE)
// ESPECIALLY NO IMPORTS FROM '../../generateInvestorFeedback' OR '../../types/feedback'

type Data = {
  // feedback?: (FeedbackResponse | FeedbackError)[];
  message?: string; // Changed for test
  error?: string;
};

// console.log('[API /generate-feedback] File execution started - TOP OF FILE'); // REMOVE THIS LINE IF PRESENT

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔥 API HIT 🔥');
  console.log('Request Method:', req.method);
  console.log('Request Body:', JSON.stringify(req.body));

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  return res.status(200).json({ message: 'API hit successfully!' });
} 
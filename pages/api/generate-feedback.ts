console.log('[API /generate-feedback] File execution started - ABSOLUTE TOP OF FILE V3');
import type { NextApiRequest, NextApiResponse } from 'next';
import { getInvestorFeedbackFromAI } from '../../server/aiFeedbackService';
import { type InvestorFeedbackResponse, mockData } from '../../types/feedback';
// THIS FILE SHOULD HAVE NO OTHER IMPORT STATEMENTS (COMMENTED OR OTHERWISE)
// ESPECIALLY NO IMPORTS FROM '../../generateInvestorFeedback' OR '../../types/feedback'

type Data = {
  // feedback?: (FeedbackResponse | FeedbackError)[];
  message?: string; // Changed for test
  error?: string;
};

// console.log('[API /generate-feedback] File execution started - TOP OF FILE'); // REMOVE THIS LINE IF PRESENT

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<InvestorFeedbackResponse | { error: string }>
) {
  console.log('🔥 API HIT 🔥');
  console.log('Request Method:', req.method);
  console.log('Request Body:', JSON.stringify(req.body));

  if (req.method === 'POST') {
    try {
      const { deckUrl } = req.body;

      if (!deckUrl || typeof deckUrl !== 'string') {
        console.warn('[api/generate-feedback] Invalid or missing deckUrl in request body', req.body);
        return res.status(400).json({ error: 'deckUrl is required in the request body and must be a string.' });
      }

      console.log(`[api/generate-feedback] Received request for deckUrl: ${deckUrl}`);
      // No need to pass elevatorPitch as it's being removed/ignored
      const aiFeedback = await getInvestorFeedbackFromAI(deckUrl);
      console.log("[api/generate-feedback] Successfully generated AI feedback.");
      return res.status(200).json(aiFeedback);

    } catch (error: any) {
      console.error('[api/generate-feedback] Error generating AI feedback:', error);
      // Graceful fallback to mock data as per user instruction
      console.log('[api/generate-feedback] Falling back to mock data due to error.');
      return res.status(200).json(mockData); 
      // Alternative: return res.status(500).json({ error: 'Failed to generate feedback. Using mock data as fallback.', data: mockData });
      // For now, sticking to 200 with mockData as the frontend expects the InvestorFeedbackResponse structure.
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 
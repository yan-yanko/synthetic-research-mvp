import type { NextApiRequest, NextApiResponse } from 'next';
import { generateInvestorFeedback } from '../../generateInvestorFeedback'; // Adjust path as necessary
import { FeedbackResponse, FeedbackError } from '../../types/feedback'; // Adjust path as necessary

type Data = {
  feedback?: (FeedbackResponse | FeedbackError)[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { deckSlides, elevatorPitch } = req.body;

  if (!Array.isArray(deckSlides) || typeof elevatorPitch !== 'string') {
    return res.status(400).json({ error: 'Invalid input: deckSlides must be an array and elevatorPitch a string.' });
  }

  try {
    const feedbackResults = await generateInvestorFeedback(deckSlides, elevatorPitch);
    return res.status(200).json({ feedback: feedbackResults });
  } catch (error: any) {
    console.error('[API /generate-feedback] Error generating feedback:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate investor feedback.' });
  }
} 
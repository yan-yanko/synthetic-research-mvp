console.log('[API /generate-feedback] File execution started - ABSOLUTE TOP OF FILE');
import type { NextApiRequest, NextApiResponse } from 'next';
// import { generateInvestorFeedback } from '../../generateInvestorFeedback'; // Adjust path as necessary
// import { FeedbackResponse, FeedbackError } from '../../types/feedback'; // Adjust path as necessary

type Data = {
  // feedback?: (FeedbackResponse | FeedbackError)[];
  message?: string; // Changed for test
  error?: string;
};

// console.log('[API /generate-feedback] File execution started - TOP OF FILE'); // REMOVE THIS LINE IF PRESENT

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log('[API /generate-feedback] Handler invoked - Test Point 1'); // New log
  // --- Debugging Start ---
  console.log('[API /generate-feedback] Request received. Method:', req.method);
  console.log('[API /generate-feedback] Request body:', JSON.stringify(req.body, null, 2));
  // const { deckSlides, elevatorPitch } = req.body;
  // console.log('[API /generate-feedback] deckSlides type:', typeof deckSlides, 'isArray:', Array.isArray(deckSlides));
  // console.log('[API /generate-feedback] elevatorPitch type:', typeof elevatorPitch);
  // --- Debugging End ---

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // if (!Array.isArray(deckSlides) || typeof elevatorPitch !== 'string') {
  //   console.error('[API /generate-feedback] Validation failed! deckSlides isArray:', Array.isArray(deckSlides), 'elevatorPitch type:', typeof elevatorPitch);
  //   return res.status(400).json({ error: 'Invalid input: deckSlides must be an array and elevatorPitch a string.' });
  // }

  try {
    console.log('[API /generate-feedback] Inside try block - BEFORE generateInvestorFeedback call - Test Point 2'); // New log
    // const feedbackResults = await generateInvestorFeedback(deckSlides, elevatorPitch);
    // return res.status(200).json({ feedback: feedbackResults });
    return res.status(200).json({ message: 'generateInvestorFeedback call was BYPASSED for testing.' }); // Dummy response
  } catch (error: any) {
    console.error('[API /generate-feedback] Error during DUMMY generateInvestorFeedback call:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate DUMMY investor feedback.' });
  }
} 
/**
 * OpenAI API Integration
 * 
 * This endpoint handles communication with OpenAI's GPT-4o model.
 * It receives a prompt and returns the model's response.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * API handler for generating responses using GPT-4o
 * 
 * @param req - Next.js API request object
 * @param res - Next.js API response object
 * 
 * Expected request body:
 * {
 *   prompt: string  // The complete prompt to send to GPT
 * }
 * 
 * Response:
 * {
 *   result: string  // The generated response from GPT
 * }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const result = completion.choices[0]?.message?.content || 'No response generated';

    return res.status(200).json({ result });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({ error: 'Error generating response' });
  }
} 
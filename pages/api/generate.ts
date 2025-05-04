/**
 * Synthetic Research MVP - OpenAI API Integration
 * 
 * This endpoint handles the integration with OpenAI's GPT-4o model.
 * It receives a prompt and returns the model's response.
 * 
 * Input:
 * POST request with JSON body containing:
 * {
 *   prompt: string;  // The complete prompt to send to GPT
 * }
 * 
 * Output:
 * JSON response containing:
 * {
 *   result: string;  // The generated response from GPT
 * }
 * 
 * Error Responses:
 * - 400: Invalid request body or missing prompt
 * - 405: Method not allowed (only POST requests accepted)
 * - 500: Error during API call or response processing
 */

import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
      max_tokens: 500
    });

    const result = completion.choices[0].message.content;

    return res.status(200).json({ result });
  } catch (error) {
    console.error('Error in generate endpoint:', error);
    return res.status(500).json({ error: 'Error generating response' });
  }
} 
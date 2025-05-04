/**
 * Synthetic Research MVP - Response Summarization
 * 
 * This endpoint generates a concise summary of multiple persona responses.
 * It uses GPT-4 to analyze and synthesize key insights from the responses.
 * 
 * Input:
 * POST request with JSON body containing:
 * {
 *   responses: Array<{
 *     persona: string;  // Name of the persona
 *     response: string; // The persona's response
 *   }>;
 * }
 * 
 * Output:
 * JSON response containing:
 * {
 *   summary: string;  // The generated summary
 * }
 * 
 * Error Responses:
 * - 400: Invalid request body or missing responses
 * - 405: Method not allowed (only POST requests accepted)
 * - 500: Error during summarization
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
    const { responses } = req.body;

    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return res.status(400).json({ error: 'Valid responses array is required' });
    }

    const prompt = `Please provide a clear, concise summary of the following persona responses. 
Focus on key insights, common themes, and notable differences between personas.
Format the summary in a way that's easy to read and understand.

Responses:
${responses.map(r => `[${r.persona}]: ${r.response}`).join('\n\n')}

Summary:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes research responses. Focus on clarity and conciseness."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const summary = completion.choices[0]?.message?.content || 'No summary generated';

    return res.status(200).json({ summary });
  } catch (error) {
    console.error('Error in summarize endpoint:', error);
    return res.status(500).json({ error: 'Error generating summary' });
  }
} 
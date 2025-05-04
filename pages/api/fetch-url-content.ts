/**
 * Synthetic Research MVP - URL Content Extraction
 * 
 * This endpoint fetches and processes content from a given URL.
 * It extracts readable text content while removing unnecessary elements.
 * 
 * Input:
 * POST request with JSON body containing:
 * {
 *   url: string;  // The URL to fetch content from
 * }
 * 
 * Output:
 * JSON response containing:
 * {
 *   content: string;  // The extracted readable content
 * }
 * 
 * Error Responses:
 * - 400: Invalid request body or missing URL
 * - 405: Method not allowed (only POST requests accepted)
 * - 500: Error during content fetching or processing
 */

import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);

    // Remove unwanted elements
    $('script, style, nav, footer, iframe, noscript').remove();
    $('*').each((_, el) => {
      const $el = $(el);
      if ($el.text().trim() === '') {
        $el.remove();
      }
    });

    // Extract and clean text content
    const content = $('body')
      .text()
      .replace(/\s+/g, ' ')
      .trim();

    return res.status(200).json({ content });
  } catch (error) {
    console.error('Error in fetch-url-content endpoint:', error);
    return res.status(500).json({ error: 'Error fetching URL content' });
  }
} 
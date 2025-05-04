/**
 * URL Content Fetcher
 * 
 * This endpoint fetches and extracts readable content from a given URL.
 * It uses axios for HTTP requests and cheerio for HTML parsing.
 * 
 * The content extraction process:
 * 1. Fetches the HTML content from the URL
 * 2. Removes script and style elements
 * 3. Extracts text content from the body
 * 4. Cleans up the text (removes extra spaces, trims)
 * 5. Returns the cleaned content
 */

import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * API handler for fetching and extracting content from URLs
 * 
 * @param req - Next.js API request object
 * @param res - Next.js API response object
 * 
 * Expected request body:
 * {
 *   url: string  // The URL to fetch content from
 * }
 * 
 * Response:
 * {
 *   content: string  // The extracted readable content
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
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Fetch the webpage content with error handling
    const response = await axios.get(url, {
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SyntheticResearch/1.0; +http://example.com)'
      }
    });
    const html = response.data;

    // Initialize cheerio with the HTML content
    const $ = cheerio.load(html);
    
    // Remove unnecessary elements
    $('script, style, noscript, iframe, embed, object, video, audio').remove();
    
    // Remove navigation and footer elements
    $('nav, header, footer, .nav, .header, .footer').remove();
    
    // Remove comments
    $('*').contents().filter(function() {
      return this.type === 'comment';
    }).remove();
    
    // Extract text content
    let content = $('body').text()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
      .trim();

    // Remove common unwanted patterns
    content = content
      .replace(/\[.*?\]/g, '') // Remove text in square brackets
      .replace(/\(.*?\)/g, '') // Remove text in parentheses
      .replace(/\{.*?\}/g, '') // Remove text in curly braces
      .replace(/<.*?>/g, '')   // Remove any remaining HTML tags
      .replace(/\s+/g, ' ')    // Clean up spaces again
      .trim();

    return res.status(200).json({ content });
  } catch (error) {
    console.error('Error fetching URL content:', error);
    return res.status(500).json({ 
      error: 'Error fetching URL content',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
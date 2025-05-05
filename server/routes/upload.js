/**
 * POST /api/upload/deck
 * 
 * Accepts:
 *  - req.body.pitchText: string (1–2 sentence elevator pitch)
 *  - req.file: uploaded pitch deck (PDF)
 * 
 * Workflow:
 * 1. Parses the PDF into text using pdf-parse
 * 2. Combines pitchText + deck text into GPT prompt
 * 3. Matches the best synthetic investor profile (via heuristics)
 * 4. Returns GPT-4 feedback (strengths, concerns, meeting decision)
 * 
 * Dependencies:
 *  - OpenAI API (via env key)
 *  - Multer for file upload
 *  - Investor selector module
 */

import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import fs from 'fs';
import path from 'path';
import { openai } from '../services/openaiClient.js';
import { matchInvestorFromText } from '../utils/investorSelector.js';
import { matchRealInvestors } from '../../utils/realInvestorMatcher.js';

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

router.post('/deck', upload.single('file'), async (req, res) => {
  try {
    // Extract the pitch text from the request body
    const { pitchText } = req.body || {};
    
    // Validate inputs
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    if (!pitchText) {
      console.warn('No pitch text provided, using only PDF content');
    }
    
    console.log('File received:', req.file.originalname, req.file.mimetype, req.file.size);
    console.log('Pitch text length:', pitchText ? pitchText.length : 0);
    
    // Parse the PDF file
    const fileBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(fileBuffer);
    
    console.log(`Parsed ${pdfData.numpages} pages from PDF`);
    
    // Combine text sources for best matching
    const combinedText = pitchText ? `${pitchText}\n\n${pdfData.text}` : pdfData.text;
    
    // Match appropriate investor profile based on combined content
    const investor = matchInvestorFromText(combinedText);
    console.log('Matched investor profile:', investor.name);

    // Extract startup profile with GPT-4
    let startupProfile = null;
    let investorMatches = [];
    
    if (pitchText) {
      try {
        const profileExtract = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: "system",
              content: "You are a startup analyst. Extract industry vertical, business model (B2B/B2C), and fundraising stage from the following pitch. Return JSON with format: {\"vertical\": string, \"model\": string, \"stage\": string}"
            },
            {
              role: "user",
              content: pitchText
            }
          ],
          temperature: 0.3
        });
        
        startupProfile = JSON.parse(profileExtract.choices[0].message.content);
        console.log('Extracted startup profile:', startupProfile);
        
        // Match real-world investors
        investorMatches = matchRealInvestors(startupProfile);
        console.log(`Matched ${investorMatches.length} real investors`);
      } catch (error) {
        console.error('Error in startup profile extraction:', error);
        // Continue with synthetic investor feedback only
      }
    }

    // Prepare the prompt for GPT-4
    let promptContent = '';
    if (pitchText) {
      promptContent = `Here is the startup's elevator pitch:\n${pitchText}\n\nAnd here is the full pitch deck:\n${pdfData.text}`;
    } else {
      promptContent = `Here is the pitch deck content:\n${pdfData.text}`;
    }

    // Get AI feedback on the pitch
    const feedback = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: "system",
          content: `You are a ${investor.name}. ${investor.background}. Give honest, structured feedback on a pitch deck.`
        },
        {
          role: "user",
          content: `${promptContent}\n\nPlease respond with:\n1. Strengths\n2. Concerns\n3. Would you take a meeting or pass?`
        }
      ],
      temperature: 0.7
    });
    
    // Clean up the uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      investor,
      feedback: feedback.choices[0].message.content,
      startupProfile,
      realInvestors: investorMatches,
      summary: {
        deckPages: pdfData.numpages,
        hasPitchText: !!pitchText,
        profileMatched: investor.name,
        realInvestorsCount: investorMatches.length
      }
    });
  } catch (err) {
    console.error('Error processing pitch deck:', err);
    
    // If file exists, clean it up even if processing failed
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error('Error deleting file:', unlinkErr);
      }
    }
    
    res.status(500).json({ error: 'Failed to process pitch deck', details: err.message });
  }
});

export default router; 
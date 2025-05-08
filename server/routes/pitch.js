/**
 * Pitch feedback API route
 * 
 * This route handles processing pitch decks and elevator pitches,
 * and generating synthetic investor feedback.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const pdfParse = require('pdf-parse');
const path = require('path');
const fs = require('fs');

// Import synthetic persona engine
// In a real app, we'd use: const syntheticPersonaEngine = require('../../synthetic-research-core/synthetic_persona_engine');
// For demo purposes, we'll just mock this functionality

const mockSyntheticPersonas = [
  {
    id: 'maya-financial-focus',
    name: 'Maya Chen',
    type: 'Series A VC',
    investmentThesis: 'businesses with clear unit economics and sustainable growth'
  },
  {
    id: 'arjun-narrative-focus',
    name: 'Arjun Patel',
    type: 'Seed VC',
    investmentThesis: 'founder-market fit and compelling narratives that can disrupt industries'
  },
  {
    id: 'chloe-trend-focus',
    name: 'Chloe Rodriguez',
    type: 'Angel',
    investmentThesis: 'authentic brands with organic traction and social relevance'
  }
];

// Setup file upload
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../../uploads/'));
    },
    filename: function (req, file, cb) {
      cb(null, 'pitch-deck-' + Date.now() + path.extname(file.originalname));
    }
  }),
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed!'), false);
    }
    cb(null, true);
  }
});

/**
 * GET /api/pitch/personas
 * Returns all available synthetic investor personas
 */
router.get('/personas', (req, res) => {
  try {
    res.json({
      success: true,
      personas: mockSyntheticPersonas
    });
  } catch (error) {
    console.error('Error fetching personas:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch personas'
    });
  }
});

/**
 * Mock function to generate feedback from a persona
 * In a real implementation, this would use the actual synthetic persona engine
 */
async function mockGenerateFeedback(pitchDeckText, elevatorPitch, personaId) {
  // Find the persona
  const persona = mockSyntheticPersonas.find(p => p.id === personaId);
  if (!persona) {
    throw new Error(`Persona with ID ${personaId} not found`);
  }
  
  // Count slides (very rough estimate)
  const slideCount = (pitchDeckText.match(/slide|page|\n\s*\n/gi) || []).length + 1;
  
  // Create mock slide feedback
  const slideFeedback = Array.from({ length: slideCount }, (_, i) => ({
    slideNumber: i + 1,
    feedback: `This is feedback for slide ${i + 1} from ${persona.name}`,
    sentiment: Math.random() > 0.7 ? 'critical' : 
              Math.random() > 0.5 ? 'positive' : 'neutral'
  }));
  
  // Create mock overall feedback
  return {
    investorId: persona.id,
    investorName: persona.name,
    investorType: persona.type,
    timestamp: new Date().toISOString(),
    slideFeedback,
    overallFeedback: {
      investmentDecision: Math.random() > 0.7 ? 'Interested with concerns' : 
                          Math.random() > 0.3 ? 'Requires major changes' : 'Highly Interested',
      decisionRationale: `As ${persona.name}, I focus on ${persona.investmentThesis}. This pitch aligns with my investment criteria to some degree.`,
      strengthPoints: [
        'Clear problem statement',
        'Interesting market opportunity'
      ],
      concernPoints: [
        'Revenue projections seem optimistic',
        'Competition analysis could be more thorough'
      ],
      followupQuestions: [
        'How did you arrive at your market size estimate?',
        'What is your customer acquisition strategy?',
        'How do you plan to use the investment funds?'
      ]
    },
    processingMetadata: {
      totalSlides: slideCount,
      processingTimeMs: Math.floor(Math.random() * 5000) + 1000,
      elevatorPitchIncluded: !!elevatorPitch
    }
  };
}

/**
 * POST /api/pitch/analyze
 * Analyzes a pitch deck and generates synthetic investor feedback
 */
router.post('/analyze', upload.single('pitchDeck'), async (req, res) => {
  try {
    // Get investor ID from request
    const personaId = req.body.personaId || 'maya-financial-focus'; // Default to Maya
    
    // Get elevator pitch from request
    const elevatorPitch = req.body.elevatorPitch || '';
    
    let pitchDeckText = '';
    
    // Process uploaded PDF if provided
    if (req.file) {
      try {
        const pdfBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(pdfBuffer);
        pitchDeckText = pdfData.text || '';
      } catch (pdfError) {
        console.error('Error parsing PDF:', pdfError);
        return res.status(400).json({
          success: false,
          error: 'Failed to parse PDF file'
        });
      }
    } else if (!elevatorPitch) {
      return res.status(400).json({
        success: false,
        error: 'Either a pitch deck or elevator pitch is required'
      });
    }
    
    // Generate feedback
    const feedback = await mockGenerateFeedback(pitchDeckText, elevatorPitch, personaId);
    
    // Clean up uploaded file
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting temporary file:', err);
      });
    }
    
    res.json({
      success: true,
      feedback,
      pitchDeckLength: pitchDeckText.length,
      elevatorPitchLength: elevatorPitch.length
    });
    
  } catch (error) {
    console.error('Error processing pitch analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze pitch'
    });
  }
});

module.exports = router; 
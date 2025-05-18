import express from 'express';
import { openai } from '../services/openaiClient.js';
import { matchRealInvestors } from '../../utils/realInvestorMatcher.js';

const router = express.Router();

router.post('/simulate-pitch', async (req, res) => {
  const { pitchText } = req.body;

  if (!pitchText) {
    return res.status(400).json({ error: "Pitch text is required" });
  }

  const investors = [
    {
      role: "Angel investor",
      background: "former founder, values mission and founder insight"
    },
    {
      role: "Seed-stage VC",
      background: "invests in B2B SaaS, looks for $1B outcomes"
    },
    {
      role: "Growth-stage investor",
      background: "metrics-focused, skeptical, questions everything"
    }
  ];

  const calls = investors.map(({ role, background }) => {
    return openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a ${role}. ${background}. Review startup pitches critically.`
        },
        {
          role: "user",
          content: `This is the pitch: \n${pitchText}\n\nPlease answer:\n1. What's compelling?\n2. What raises red flags?\n3. Would you take a meeting?`
        }
      ],
      temperature: 0.8
    });
  });

  try {
    // Extract startup profile with GPT-4
    let startupProfile = null;
    let realInvestors = [];
    
    try {
      const profileExtract = await openai.chat.completions.create({
        model: 'gpt-4o',
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
      
      const messageContent = profileExtract.choices[0]?.message?.content;
      if (messageContent) {
        try {
          startupProfile = JSON.parse(messageContent);
          console.log('Extracted startup profile:', startupProfile);
          
          // Match real-world investors only if profile is successfully extracted and truthy
          if (startupProfile) {
            realInvestors = matchRealInvestors(startupProfile);
            console.log(`Matched ${realInvestors.length} real investors`);
          } else {
            console.warn('Startup profile parsed to a non-truthy value. Skipping real investor matching.');
          }
        } catch (jsonParseError) {
          console.error('Error parsing startup profile JSON:', jsonParseError);
          // startupProfile remains null, realInvestors remains []
        }
      } else {
        console.error('No content received from OpenAI for startup profile extraction.');
        // startupProfile remains null, realInvestors remains []
      }
    } catch (extractionError) {
      console.error('Error during startup profile extraction or real investor matching:', extractionError);
      // Continue with synthetic investor feedback only
      // startupProfile remains null, realInvestors remains []
    }

    const responses = await Promise.all(calls);
    res.json({
      responses: responses.map((r, i) => ({
        role: investors[i].role,
        background: investors[i].background,
        feedback: r.choices[0].message.content
      })),
      startupProfile,
      realInvestors
    });
  } catch (err) {
    console.error("OpenAI error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router; 
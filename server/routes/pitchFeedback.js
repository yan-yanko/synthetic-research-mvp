import express from 'express';
import { openai } from '../services/openaiClient.js';

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
      model: "gpt-4",
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
    const responses = await Promise.all(calls);
    res.json({
      responses: responses.map((r, i) => ({
        role: investors[i].role,
        background: investors[i].background,
        feedback: r.choices[0].message.content
      }))
    });
  } catch (err) {
    console.error("OpenAI error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router; 
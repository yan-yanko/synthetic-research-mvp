import express from 'express';
import { runSimulation } from '../services/runSimulation.js';
import { openai } from '../services/openaiClient.js';

const router = express.Router();

// Simple GET endpoint for testing
router.get('/raw-test', (req, res) => {
  res.json({ message: 'Raw test endpoint is working. Send a POST request with message field to test OpenAI connection.' });
});

router.post('/', async (req, res) => {
  try {
    const { prompt, audienceConfig } = req.body;
    const results = await runSimulation(prompt, audienceConfig);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Simulation failed' });
  }
});

router.post('/raw-test', async (req, res) => {
  try {
    const { message } = req.body;
    console.log('Raw test request received with message:', message);

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'user', content: message }
      ],
      temperature: 0.7
    });

    const result = { reply: response.choices[0].message.content };
    console.log('Sending response:', result);
    return res.json(result);
  } catch (err) {
    console.error('🔥 OpenAI Error:', err);
    res.status(500).json({ error: err.message || 'OpenAI call failed' });
  }
});

export default router; 
import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'Synthetic Research API',
    version: '1.0.0',
    endpoints: {
      '/': 'This information page',
      '/api/simulate': 'POST - Run a full audience simulation',
      '/api/simulate/raw-test': 'POST - Direct test of OpenAI connection',
      '/api/pitch/simulate-pitch': 'POST - Simulate investor feedback on a pitch',
      '/api/upload/deck': 'POST - Upload and analyze a pitch deck PDF file'
    }
  });
});

export default router; 
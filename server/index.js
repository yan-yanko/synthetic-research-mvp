import express from 'express';
import dotenv from 'dotenv';
import simulateRoute from './routes/simulate.js';
import indexRoute from './routes/index.js';
import pitchFeedback from './routes/pitchFeedback.js';
import uploadRoute from './routes/upload.js';
import cors from 'cors';

dotenv.config({ path: '.env.local' });

const app = express();
app.use(cors());
app.use(express.json());

// Use index routes
app.use('/', indexRoute);

// API routes
app.use('/api/simulate', simulateRoute);
app.use('/api/pitch', pitchFeedback);
app.use('/api/upload', uploadRoute);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🧠 Synthetic Research API running on port ${PORT}`);
}); 
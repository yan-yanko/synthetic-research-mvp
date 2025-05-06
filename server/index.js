import express from 'express';
import dotenv from 'dotenv';
import simulateRoute from './routes/simulate.js';
import indexRoute from './routes/index.js';
import pitchFeedback from './routes/pitchFeedback.js';
import uploadRoute from './routes/upload.js';
import cors from 'cors';

dotenv.config({ path: '.env.local' });

const app = express();

// Configure CORS to explicitly allow the Vercel front-end domain
const corsOptions = {
  origin: [
    'https://vcpitcher.com',
    'https://synthetic-research-mvp.vercel.app',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());

// Debugging middleware to log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} Origin: ${req.headers.origin || 'unknown'}`);
  next();
});

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
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Check if API key is defined
if (!process.env.OPENAI_API_KEY) {
  console.error('🔴 ERROR: OPENAI_API_KEY is not defined in environment variables!');
} else {
  console.log('✅ OpenAI API key is configured');
}

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); 
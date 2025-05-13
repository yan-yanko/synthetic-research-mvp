/**
 * Synthetic Research MVP - Main UI Component
 * 
 * This is the primary user interface for the Synthetic Research MVP.
 * It provides a simple interface for simulating audience research using AI-powered personas.
 * 
 * Features:
 * - Toggle between text and URL input
 * - Input validation and processing
 * - Integration with OpenAI GPT-4o
 * - Display of persona-specific responses
 * - AI-generated summary of all responses
 * - PDF report generation
 * - User feedback collection
 * - Onboarding flow
 * 
 * The component manages the entire research flow from input to results display.
 */

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with email capture backend/service
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col justify-center items-center py-16 px-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">Upload Your Deck → Get Investor Feedback</h1>
        <p className="text-center text-gray-600 mb-8 text-lg">
          Instantly simulate honest, structured feedback from a panel of synthetic VCs. No signup required.
        </p>
        <Link href="/deck-upload" legacyBehavior>
          <a className="w-full mb-6 inline-block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-lg shadow transition">Upload Your Pitch Deck</a>
        </Link>
        <form onSubmit={handleEmailSubmit} className="w-full flex flex-col items-center">
          <label className="block text-sm font-medium text-gray-700 mb-2">Get early access updates:</label>
          <div className="flex w-full">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="Your email"
              className="flex-1 p-3 border border-gray-300 rounded-l-md text-sm focus:outline-none"
              disabled={submitted}
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 rounded-r-md text-sm font-semibold disabled:opacity-60"
              disabled={submitted}
            >
              {submitted ? 'Thank you!' : 'Notify Me'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
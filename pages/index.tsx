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
import { Layout } from '@/components/ui/Layout';

export default function Home() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    console.info("Submitting email form:", e, "Current email state:", email);
    e.preventDefault();
    // TODO: Integrate with email capture backend/service
    setSubmitted(true);
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-150px)] flex flex-col justify-center items-center py-12 px-4 text-center">
        <div className="max-w-2xl w-full bg-card border border-border rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-textPrimary">
            Upload Your Deck → Get Investor Feedback
          </h1>
          <p className="text-textSecondary mb-8 text-lg md:text-xl">
            Instantly simulate honest, structured feedback from a panel of synthetic VCs. No signup required.
          </p>
          <Link href="/deck-upload" legacyBehavior>
            <a 
              className="w-full max-w-md mb-8 inline-block bg-primary hover:bg-primary/80 text-white font-semibold py-3 px-6 rounded-lg text-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1"
            >
              Upload Your Pitch Deck
            </a>
          </Link>
          <form onSubmit={handleEmailSubmit} className="w-full max-w-md mx-auto">
            <label className="block text-sm font-medium text-textSecondary mb-2">
              Get early access updates:
            </label>
            <div className="flex">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="Your email"
                className="flex-1 p-3 border border-border bg-background text-textPrimary rounded-l-md text-sm focus:ring-primary focus:border-primary focus:outline-none disabled:opacity-50"
                disabled={submitted}
              />
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 rounded-r-md text-sm font-semibold disabled:opacity-60 transition-colors duration-300"
                disabled={submitted}
              >
                {submitted ? 'Thank you!' : 'Notify Me'}
              </button>
            </div>
            {submitted && (
              <p className="text-green-500 mt-3 text-sm">Thanks for signing up! We'll keep you posted.</p>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
} 
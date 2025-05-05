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

import React from 'react';
import Link from 'next/link';

/**
 * Default personas for the research simulation
 * Each persona has a unique ID, display name, and a prompt prefix that sets
 * their context for the GPT model
 */
const personas = [
  {
    id: 'cmo_b2b',
    name: 'CMO at B2B Tech Company',
    promptPrefix: 'You are a Chief Marketing Officer at a fast-growing B2B SaaS company. You are strategic, data-driven, and care about ROI.'
  },
  {
    id: 'founder_smb',
    name: 'Founder of SMB',
    promptPrefix: 'You are the founder of a small business in retail. You care about practical impact and ease of implementation.'
  },
  {
    id: 'genz_consumer',
    name: 'Gen Z Consumer',
    promptPrefix: 'You are a Gen Z consumer who cares about authenticity, social values, and digital experience.'
  }
];

/**
 * Main application component
 * 
 * Manages the application state and provides the UI for:
 * - Input selection (text/URL)
 * - Content input
 * - Research execution
 * - Results display
 */
export default function Home() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-4">Would a real investor take your meeting?</h1>
      <p className="mb-6 text-gray-700">
        Upload your pitch and get realistic, investor-style feedback in under 5 minutes.
      </p>

      <Link
        href="/deck-upload"
        className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800"
      >
        Upload Pitch & Get Feedback
      </Link>

      <section className="mt-16 space-y-8">
        <h2 className="text-xl font-semibold">How It Works</h2>
        <ol className="list-decimal list-inside text-gray-800 space-y-2">
          <li>Upload your pitch deck and 1-sentence elevator pitch.</li>
          <li>We simulate an investor's reaction using real investment logic.</li>
          <li>You get back honest feedback — and see which real investors might be a fit.</li>
        </ol>
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-semibold mb-4">Example Feedback</h2>
        <div className="bg-gray-100 p-4 rounded">
          <strong>Seed-stage SaaS VC:</strong>
          <p className="mt-2 text-sm text-gray-700">
            "Your market sizing is compelling, but I'd need to see more traction to move forward. I'd probably pass for now, but would ask for an update in 90 days."
          </p>
        </div>
      </section>
    </main>
  );
} 
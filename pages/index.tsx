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
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Head>
        <title>Synthetic Investor Feedback Platform</title>
        <meta name="description" content="Get realistic investor feedback on your pitch materials using AI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Transform Your Pitch Into
            <span className="text-blue-600 block mt-2">Investor-Ready Success</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get instant, realistic feedback from AI-powered investor personas. Perfect your pitch before stepping into the real meeting room.
          </p>
          <Link 
            href="/deck-upload"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            Start Your Pitch Review
            <span className={`ml-2 transition-transform duration-300 ${isHovered ? 'translate-x-2' : ''}`}>→</span>
          </Link>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="text-blue-600 text-3xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold mb-3">Uplift & Confidence</h3>
            <p className="text-gray-600">Get the confidence boost you need with actionable feedback that highlights your strengths and opportunities</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="text-blue-600 text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-3">Smart Fit</h3>
            <p className="text-gray-600">Our AI matches your pitch with the most relevant investor persona for targeted, actionable feedback</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="text-blue-600 text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-3">Portfolio-Ready Output</h3>
            <p className="text-gray-600">Receive professional, structured feedback that you can directly incorporate into your pitch materials</p>
          </motion.div>
        </div>

        {/* Coming Soon Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-gray-50 rounded-2xl p-8 text-center"
        >
          <h2 className="text-2xl font-bold mb-6">Coming Soon</h2>
          <div className="flex flex-wrap justify-center gap-4 text-gray-600">
            <span className="px-4 py-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-300">Real VC Recommendations</span>
            <span className="px-4 py-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-300">Notion Export</span>
            <span className="px-4 py-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-300">Feedback History</span>
            <span className="px-4 py-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-300">Pricing Plans</span>
          </div>
        </motion.div>
      </main>

      <footer className="bg-gray-50 py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>Built by Yan Yanko • <a href="https://www.yanyanko.com" className="text-blue-600 hover:underline transition-colors duration-300">yanyanko.com</a></p>
        </div>
      </footer>
    </div>
  );
} 
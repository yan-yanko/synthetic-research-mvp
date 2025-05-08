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
import { InvestorPanel } from '../components/InvestorPanel';

export default function Home() {
  // Sample data for demonstration
  const [deckSlides, setDeckSlides] = useState<string[]>([
    'Introduction to WidgetAI - Making Widgets Smarter',
    'Problem: Traditional widgets lack intelligence and adaptability, requiring manual configuration.',
    'Solution: Our AI-powered widget platform learns from user behavior and automatically optimizes.',
    'Market: $4.2B widget market growing at 18% CAGR, with 60% of enterprises expressing need for smart widgets.',
    'Product: Core platform with proprietary ML algorithm and easy integration API.',
    'Traction: 12 enterprise beta customers, 3 paid pilots ($150K ARR), NPS score of 72.',
    'Business Model: SaaS pricing at $15/user/month with enterprise tiers starting at $50K/year.',
    'Competition: Legacy widget providers lack AI capabilities; tech giants focusing on other priorities.',
    'Team: Former product leads from TechCorp, engineering from AI Leaders Inc.',
    'Financials: $1.2M ARR target by EOY, 68% gross margins, CAC payback in 9 months.',
    'Fundraising: Seeking $3M seed to expand engineering team and scale GTM efforts.'
  ]);
  
  const [elevatorPitch, setElevatorPitch] = useState<string>(
    "WidgetAI transforms ordinary enterprise widgets into intelligent systems that learn and adapt to user behavior. Our platform reduces widget configuration time by 85% while increasing user productivity by 32%. We're targeting the $4.2B widget market with a SaaS model already generating early revenue from Fortune 500 pilots."
  );

  const [showDemo, setShowDemo] = useState(false);

  const addNewSlide = () => {
    setDeckSlides([...deckSlides, '']);
  };

  const removeSlide = (indexToRemove: number) => {
    if (deckSlides.length > 1) {
      setDeckSlides(deckSlides.filter((_, idx) => idx !== indexToRemove));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-2">Synthetic Investor Feedback</h1>
        <p className="text-center text-gray-600 mb-8">
          Generate realistic feedback from different investor personas with AI panel summary
        </p>
        
        <div className="max-w-3xl mx-auto mb-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Demo Startup Pitch</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Elevator Pitch
            </label>
            <textarea
              value={elevatorPitch}
              onChange={(e) => setElevatorPitch(e.target.value)}
              className="w-full rounded-md border border-gray-300 shadow-sm p-2 min-h-[120px]"
              placeholder="Enter your elevator pitch..."
            />
          </div>
          
          <div className="mb-4">
            <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
              <span>Pitch Deck Slides</span>
              <button 
                onClick={addNewSlide}
                className="text-blue-600 hover:text-blue-800 text-xs"
              >
                + Add Slide
              </button>
            </label>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-60 overflow-y-auto">
              {deckSlides.map((slide, idx) => (
                <div key={idx} className="mb-2 flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs font-medium mr-2 flex-shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    value={slide}
                    onChange={(e) => {
                      const newSlides = [...deckSlides];
                      newSlides[idx] = e.target.value;
                      setDeckSlides(newSlides);
                    }}
                    className="flex-1 p-1 border border-gray-200 rounded text-sm"
                  />
                  <button
                    onClick={() => removeSlide(idx)}
                    className="ml-2 text-red-500 hover:text-red-700"
                    title="Remove slide"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={() => setShowDemo(!showDemo)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {showDemo ? 'Hide Feedback' : 'Generate Investor Feedback'}
            </button>
          </div>
        </div>
        
        {showDemo && (
          <div className="max-w-6xl mx-auto">
            <InvestorPanel deckSlides={deckSlides} elevatorPitch={elevatorPitch} />
          </div>
        )}
      </div>
    </div>
  );
} 
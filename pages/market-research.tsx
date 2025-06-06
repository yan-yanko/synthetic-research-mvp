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

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { PeachLoader } from '@/components/ui/PeachLoader';
// PDF functionality is completely disabled for Vercel deployment

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
export default function MarketResearch() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [inputType, setInputType] = useState<'text' | 'url'>('text');
  const [summary, setSummary] = useState<string>('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [feedback, setFeedback] = useState<'useful' | 'notSure' | 'offTarget' | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('onboardingSeen');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboardingSeen', 'true');
    setShowOnboarding(false);
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // PDF generation disabled for deployment
  const generatePDF = () => {
    if (typeof window === 'undefined' || !reportRef.current) return;
    
    // Show alert for now
    window.alert('PDF generation is temporarily disabled in this online version.');
  };

  /**
   * Runs the research simulation for a given content
   * @param content - The text content to analyze
   */
  const runResearch = async (content: string) => {
    setLoading(true);
    setSummary('');
    setSummaryError('');
    const newResponses: Record<string, string> = {};

    // Backend API URL
    const generateApiUrl = 'https://synthetic-research-api.onrender.com/api/generate';
    
    for (const persona of personas) {
      const fullPrompt = `${persona.promptPrefix}\n\nReact to the following message as if it were presented to you by a marketer:\n\n"${content}"\n\nWhat do you think? What concerns you? What appeals to you?`;

      try {
        console.log(`Sending prompt to ${generateApiUrl} for persona ${persona.id}`);
        const res = await fetch(generateApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: fullPrompt })
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error(`API error for ${persona.id}:`, errorText);
          throw new Error(`Failed to get response for ${persona.name}`);
        }

        const data = await res.json();
        newResponses[persona.id] = data.result;
      } catch (error) {
        console.error(`Error processing persona ${persona.id}:`, error);
        newResponses[persona.id] = `Error: Unable to generate response for ${persona.name}`;
      }
    }

    setResponses(newResponses);
    setLoading(false);

    // Generate summary of all responses
    setSummaryLoading(true);
    try {
      const summarizeApiUrl = 'https://synthetic-research-api.onrender.com/api/summarize';
      console.log(`Sending summarize request to ${summarizeApiUrl}`);
      
      const summaryRes = await fetch(summarizeApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: Object.entries(newResponses).map(([personaId, response]) => ({
            personaId,
            personaName: personas.find(p => p.id === personaId)?.name,
            response
          }))
        })
      });

      if (!summaryRes.ok) {
        const errorText = await summaryRes.text();
        console.error('Summary API error:', errorText);
        throw new Error('Failed to generate summary');
      }

      const summaryData = await summaryRes.json();
      setSummary(summaryData.summary);
      setSummaryError('');
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummaryError('Failed to generate summary. Please try again.');
    } finally {
      setSummaryLoading(false);
    }
  };

  /**
   * Handles form submission based on input type
   * For URL input, fetches content first before running research
   */
  const handleSubmit = async () => {
    setError('');
    
    if (inputType === 'url') {
      try {
        const urlApiUrl = 'https://synthetic-research-api.onrender.com/api/fetch-url-content';
        console.log(`Fetching content from URL: ${input} via ${urlApiUrl}`);
        
        const res = await fetch(urlApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: input })
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('URL fetch error:', errorText);
          throw new Error('Failed to fetch URL content');
        }
        
        const data = await res.json();
        if (data.content) {
          await runResearch(data.content);
        } else {
          throw new Error('No content returned from URL');
        }
      } catch (error) {
        console.error('Error fetching URL content:', error);
        setError('Failed to fetch content from the URL. Please try a different URL or use text input.');
      }
    } else {
      await runResearch(input);
    }
  };

  const handleFeedback = (type: 'useful' | 'notSure' | 'offTarget') => {
    setFeedback(type);
    setShowThankYou(true);
    
    // Log feedback to console (can be replaced with API call later)
    console.log('User feedback:', {
      type,
      timestamp: new Date().toISOString(),
      summary,
      responses
    });

    // Hide thank you message after 3 seconds
    setTimeout(() => {
      setShowThankYou(false);
    }, 3000);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {showOnboarding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            {currentStep === 1 && (
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Welcome to Synthetic Research</h2>
                <p className="text-gray-600 mb-6">
                  Get directional feedback in minutes using AI-powered personas.
                </p>
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={nextStep}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">How It Works</h2>
                <p className="text-gray-600 mb-6">
                  You can paste your message or a live URL – we simulate how your audience will react.
                </p>
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={prevStep}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                  >
                    Back
                  </button>
                  <button
                    onClick={nextStep}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Ready to Start?</h2>
                <p className="text-gray-600 mb-6">
                  Let's get some valuable insights about your content.
                </p>
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={prevStep}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleOnboardingComplete}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Let's Go
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-center mt-6 space-x-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full ${
                    currentStep === step ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold">Synthetic Research Tool</h1>
        <p className="text-gray-500">Get instant feedback from AI personas</p>
        <Link href="/" className="text-blue-500 hover:underline mt-2 inline-block">
          ← Back to Dashboard
        </Link>
      </header>

      {/* Input Type Toggle */}
      <div className="mb-4 flex justify-center">
        <button
          onClick={() => setInputType('text')}
          className={`px-4 py-2 rounded-l-md ${inputType === 'text' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Text Input
        </button>
        <button
          onClick={() => setInputType('url')}
          className={`px-4 py-2 rounded-r-md ${inputType === 'url' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          URL Input
        </button>
      </div>

      {/* Input Area */}
      {inputType === 'url' ? (
        <div className="mb-4">
          <input
            type="url"
            className="w-full border p-2 rounded"
            placeholder="Enter URL (e.g., https://example.com)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <p className="mt-2 text-sm text-gray-500">
            The system will fetch the content from the URL and analyze it as if you had entered the text directly.
          </p>
        </div>
      ) : (
        <div className="mb-4">
          <textarea
            className="w-full border p-2 rounded"
            rows={4}
            placeholder="Enter your product message, value prop, or campaign text..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <p className="mt-2 text-sm text-gray-500">
            Enter the text you want to analyze. Each persona will provide their perspective on your message.
          </p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || !input}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        Run Research
      </button>

      {loading && (
        <div className="mt-6">
          <PeachLoader message="Running research, please wait..." />
        </div>
      )}

      {error && (
        <div className="mt-2 text-red-600">{error}</div>
      )}

      {/* Results Area */}
      {Object.keys(responses).length > 0 && !loading && (
        <div ref={reportRef} className="mt-8 p-4 border rounded">
          <h2 className="text-xl font-semibold mb-4">Persona Responses</h2>
          {personas.map((persona) => (
            <div key={persona.id} className="mb-4">
              <h3 className="font-semibold mb-2">{persona.name}</h3>
              <p className="text-gray-700">{responses[persona.id]}</p>
            </div>
          ))}

          {/* Summary Section */}
          <div className="mt-6 pt-4 border-t">
            <h3 className="text-lg font-semibold mb-2">Overall Summary</h3>
            {summaryLoading && <PeachLoader message="Generating summary..." />}
            {summaryError && <p className="text-red-500">{summaryError}</p>}
            {summary && !summaryError && (
              <p className="text-gray-700 whitespace-pre-line">{summary}</p>
            )}
          </div>
          
          {/* PDF Export Button - Disabled */}
          <div className="mt-6 text-center">
            <button
              onClick={generatePDF}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Download PDF Report
            </button>
          </div>
        </div>
      )}

      {/* User Feedback Section */}
      {!loading && Object.keys(responses).length > 0 && (
        <div className="mt-8 p-4 border rounded bg-gray-50">
          <h3 className="text-lg font-semibold mb-3">Was this research useful?</h3>
          <div className="flex space-x-4">
            <button
              onClick={() => handleFeedback('useful')}
              className={`px-4 py-2 rounded ${
                feedback === 'useful'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
            >
              Useful
            </button>
            <button
              onClick={() => handleFeedback('notSure')}
              className={`px-4 py-2 rounded ${
                feedback === 'notSure'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              }`}
            >
              Not Sure
            </button>
            <button
              onClick={() => handleFeedback('offTarget')}
              className={`px-4 py-2 rounded ${
                feedback === 'offTarget'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-100 text-red-800 hover:bg-red-200'
              }`}
            >
              Off-Target
            </button>
          </div>
          {showThankYou && (
            <div className="mt-4 text-green-600">
              Thank you for your feedback!
            </div>
          )}
        </div>
      )}
    </div>
  );
} 
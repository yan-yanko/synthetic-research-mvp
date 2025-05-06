import React, { useState } from 'react';
import PitchResults from '../components/PitchResults';
import { reportError } from '../utils/errorReporter';

interface InvestorResponse {
  role: string;
  background: string;
  feedback: string;
}

interface PitchFeedbackResponse {
  responses: InvestorResponse[];
  realInvestors?: any[];  // For the real investor matches
}

export default function PitchTest() {
  const [pitchText, setPitchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<InvestorResponse[]>([]);
  const [realInvestors, setRealInvestors] = useState<any[]>([]);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pitchText.trim()) {
      setError('Please enter your pitch text');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // Direct URL to the Render backend
    const apiUrl = 'https://synthetic-research-api.onrender.com/api/pitch/simulate-pitch';
    console.log(`Submitting pitch to ${apiUrl}`);
    
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitchText }),
      });
      
      // Get the full response text for debugging
      const responseText = await res.text();
      console.log(`Response status: ${res.status}`);
      console.log(`Response text length: ${responseText.length} chars`);
      
      if (!res.ok) {
        let errorMessage = `Request failed with status ${res.status}`;
        
        // Try to parse the response as JSON
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          // If parse failed, use the raw text with length limit
          if (responseText.length > 100) {
            errorMessage += `: ${responseText.substring(0, 100)}...`;
          } else if (responseText) {
            errorMessage += `: ${responseText}`;
          }
        }
        
        console.error('API error:', errorMessage);
        throw new Error(errorMessage);
      }
      
      // Parse the successful response
      let data: PitchFeedbackResponse;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing successful response:', parseError);
        throw new Error('Invalid response format from server');
      }
      
      console.log('API request successful');
      setResponses(data.responses);
      
      // Set real investors if available
      if (data.realInvestors && data.realInvestors.length > 0) {
        setRealInvestors(data.realInvestors);
      } else {
        setRealInvestors([]);
      }
    } catch (err) {
      // Log the error with our reporter utility
      await reportError({
        error: err,
        action: 'pitch_simulation',
        userInput: {
          pitchTextLength: pitchText.length,
          apiUrl
        }
      });
      
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Simulation error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Investor Pitch Simulator</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="pitchText" className="block text-lg font-medium mb-2">
            Enter your startup pitch:
          </label>
          <textarea
            id="pitchText"
            rows={10}
            className="w-full p-3 border border-gray-300 rounded-md"
            placeholder="Describe your startup, market opportunity, traction, and funding ask..."
            value={pitchText}
            onChange={(e) => setPitchText(e.target.value)}
          />
        </div>
        
        {error && (
          <div className="text-red-600 mb-4">{error}</div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium disabled:opacity-50"
        >
          {loading ? 'Simulating Investor Reactions...' : 'Simulate Investor Reactions'}
        </button>
      </form>
      
      {responses.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Investor Feedback</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {responses.map((response, index) => (
              <div key={index} className="border rounded-lg p-4 shadow-md">
                <h3 className="text-xl font-bold mb-1">{response.role}</h3>
                <p className="text-sm text-gray-600 mb-3">{response.background}</p>
                <div className="text-gray-800 whitespace-pre-line">{response.feedback}</div>
              </div>
            ))}
          </div>
          
          {/* Show real investor recommendations if available */}
          {realInvestors.length > 0 && (
            <div className="mt-8">
              <PitchResults 
                feedback={responses[0]?.feedback || ''} 
                investorMatches={realInvestors} 
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
} 
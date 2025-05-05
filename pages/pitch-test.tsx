import React, { useState } from 'react';

interface InvestorResponse {
  role: string;
  background: string;
  feedback: string;
}

export default function PitchTest() {
  const [pitchText, setPitchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<InvestorResponse[]>([]);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pitchText.trim()) {
      setError('Please enter your pitch text');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('http://localhost:5001/api/pitch/simulate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitchText }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to get investor feedback');
      }
      
      const data = await res.json();
      setResponses(data.responses);
    } catch (err) {
      console.error('Error simulating investor feedback:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
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
        </div>
      )}
    </div>
  );
} 
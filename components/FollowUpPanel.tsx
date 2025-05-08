import { useState } from 'react';
import { simulateFollowUp, analyzeFollowUpChanges } from '../utils/simulateFollowUp';
import { FeedbackResponse } from '../generateInvestorFeedback';
import { SyntheticInvestor } from '../personas/investorPersonas';

interface FollowUpPanelProps {
  feedback: FeedbackResponse;
  persona: SyntheticInvestor;
}

export function FollowUpPanel({ feedback, persona }: FollowUpPanelProps) {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!input.trim()) {
      setError('Please enter a response before submitting');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const res = await simulateFollowUp(feedback.fullResponse, input, persona);
      
      // Analyze the changes between original and updated feedback
      const changes = analyzeFollowUpChanges(feedback, res.updatedResponse);
      
      setResponse({
        ...res,
        changes: changes.changes,
        significance: changes.significance
      });
    } catch (err) {
      console.error('Error simulating follow-up:', err);
      setError('Failed to generate follow-up response. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const getSentimentChangeColor = (sentiment: string) => {
    switch (sentiment) {
      case 'improved':
        return 'text-green-600';
      case 'worsened':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'improved':
        return '↗️';
      case 'worsened':
        return '↘️';
      default:
        return '↔️';
    }
  };

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'significant':
        return 'bg-blue-100 text-blue-800';
      case 'moderate':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mt-6 p-4 border rounded-lg bg-white shadow-sm">
      <h4 className="text-md font-bold mb-2 flex items-center">
        <span className="mr-2">📣</span> Respond to {persona.name}
      </h4>
      
      <div className="mb-4 text-sm text-gray-600">
        <p>Address their concerns or provide additional clarification to see if you can improve their investment stance.</p>
      </div>
      
      <textarea
        className="w-full border rounded-md p-3 text-sm"
        rows={4}
        placeholder="Explain your business model further, clarify market projections, describe your unique advantages..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
      
      <button
        className={`mt-3 ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded-md text-sm transition-colors`}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Simulating Response...
          </span>
        ) : (
          'Submit Response'
        )}
      </button>

      {response && (
        <div className="mt-6 bg-slate-50 p-4 rounded-lg border">
          <div className="flex justify-between items-start">
            <h5 className="font-semibold text-gray-900 flex items-center">
              Updated Feedback from {response.personaName}
            </h5>
            <span className={`${getSentimentChangeColor(response.updatedSentiment)} font-medium text-sm flex items-center`}>
              {getSentimentIcon(response.updatedSentiment)} {response.updatedSentiment.charAt(0).toUpperCase() + response.updatedSentiment.slice(1)}
            </span>
          </div>
          
          {response.changes && response.changes.length > 0 && (
            <div className="mt-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSignificanceColor(response.significance)}`}>
                {response.significance} changes
              </span>
              <ul className="mt-2 text-sm text-gray-700 space-y-1">
                {response.changes.map((change: string, idx: number) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-blue-500 mr-1">•</span> {change}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-4 whitespace-pre-wrap text-sm text-gray-800 bg-white p-3 rounded-md border shadow-sm">
            {response.updatedResponse}
          </div>
        </div>
      )}
    </div>
  );
} 
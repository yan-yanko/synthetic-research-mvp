import { useState } from 'react';
import { simulateFollowUp } from '../utils/simulateFollowUp';
import { FeedbackResponse, FollowUpResponse } from '../types/feedback';
import { SyntheticInvestor } from '../types/personas';
import { LoadingIndicator } from './LoadingIndicator';

interface FollowUpPanelProps {
  feedback: FeedbackResponse;
  persona: SyntheticInvestor;
}

/**
 * Component for simulating investor follow-up responses to clarifications
 */
export function FollowUpPanel({ feedback, persona }: FollowUpPanelProps) {
  const [followUpContext, setFollowUpContext] = useState<string>('');
  const [followUpResponse, setFollowUpResponse] = useState<FollowUpResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(false);
  
  // Generate a follow-up response based on user explanation
  const handleFollowUp = async () => {
    if (!followUpContext.trim()) {
      setError('Please enter your follow-up explanation first');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await simulateFollowUp(
        feedback.fullResponse,
        followUpContext,
        persona
      );
      
      setFollowUpResponse(response);
    } catch (err) {
      console.error('Error simulating follow-up:', err);
      setError('Failed to generate follow-up response');
    } finally {
      setLoading(false);
    }
  };
  
  // Extract sections from updated response
  const renderUpdatedResponse = () => {
    if (!followUpResponse) return null;
    
    // Extract sections using regex
    const extractSection = (sectionName: string): string => {
      const regex = new RegExp(`## ${sectionName}\\s*\\n([\\s\\S]*?)(?=##|$)`, 'i');
      const match = followUpResponse.updatedResponse.match(regex);
      return match ? match[1].trim() : '';
    };
    
    const updatedAssessment = extractSection('Updated Assessment');
    const investmentStatus = extractSection('Investment Status');
    const remainingConcerns = extractSection('Remaining Concerns');
    const newPositives = extractSection('New Positives');
    const followupQuestion = extractSection('Follow-up Question');
    
    return (
      <div className="mt-4 p-4 border rounded">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium">Updated Assessment</h4>
          <span className={`px-2 py-1 text-xs rounded-full ${
            followUpResponse.updatedSentiment === 'improved' ? 'bg-green-100 text-green-800' :
            followUpResponse.updatedSentiment === 'worsened' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            Sentiment: {followUpResponse.updatedSentiment.charAt(0).toUpperCase() + followUpResponse.updatedSentiment.slice(1)}
          </span>
        </div>
        
        <p className="text-sm text-gray-700 mb-4">{updatedAssessment}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-green-700">New Positives</h5>
            <div className="mt-1 p-2 bg-green-50 rounded">
              {newPositives ? (
                <p className="text-gray-700">{newPositives}</p>
              ) : (
                <p className="text-gray-500 italic">No new positives identified</p>
              )}
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-red-700">Remaining Concerns</h5>
            <div className="mt-1 p-2 bg-red-50 rounded">
              {remainingConcerns ? (
                <p className="text-gray-700">{remainingConcerns}</p>
              ) : (
                <p className="text-gray-500 italic">No remaining concerns</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <h5 className="font-medium text-blue-700">Investment Status</h5>
          <p className="mt-1 text-gray-700">{investmentStatus}</p>
        </div>
        
        {followupQuestion && (
          <div className="mt-4">
            <h5 className="font-medium text-purple-700">Follow-up Question</h5>
            <p className="mt-1 text-gray-700">{followupQuestion}</p>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="mt-6 border-t pt-4">
      <div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <span className="mr-2">{showForm ? '▼' : '►'}</span>
          <span className="font-medium">Follow-up with clarifications</span>
        </button>
        
        {showForm && (
          <div className="mt-3">
            <p className="text-sm text-gray-600 mb-2">
              Provide additional explanation or address investor concerns to see how it affects their assessment:
            </p>
            
            <textarea
              value={followUpContext}
              onChange={(e) => setFollowUpContext(e.target.value)}
              className="w-full p-3 border rounded-md resize-none"
              rows={4}
              placeholder="Explain how you would address this investor's concerns..."
            />
            
            {error && (
              <p className="text-red-600 text-sm mt-1">{error}</p>
            )}
            
            <button
              onClick={handleFollowUp}
              disabled={loading || !followUpContext.trim()}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Simulate Investor Response
            </button>
          </div>
        )}
      </div>
      
      {loading && (
        <LoadingIndicator 
          message="Simulating investor response..." 
          size="small" 
        />
      )}
      
      {followUpResponse && renderUpdatedResponse()}
    </div>
  );
} 
import { useEffect, useState } from 'react';
import { generateInvestorFeedback, FeedbackResponse } from '../generateInvestorFeedback';
import { investorPersonas } from '../personas/investorPersonas';
import FeedbackViewer from './FeedbackViewer';
import { InvestorSummaryPanel } from './InvestorSummaryPanel';
import { FollowUpPanel } from './FollowUpPanel';

interface InvestorPanelProps {
  deckSlides: string[];
  elevatorPitch: string;
}

export function InvestorPanel({ deckSlides, elevatorPitch }: InvestorPanelProps) {
  const [feedback, setFeedback] = useState<FeedbackResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [expandedPersona, setExpandedPersona] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(true);

  useEffect(() => {
    async function fetchFeedback() {
      setLoading(true);
      try {
        const res = await generateInvestorFeedback(deckSlides, elevatorPitch);
        setFeedback(res);
      } catch (error) {
        console.error('Error generating investor feedback:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (deckSlides.length > 0 || elevatorPitch) {
      fetchFeedback();
    } else {
      setLoading(false);
    }
  }, [deckSlides, elevatorPitch]);

  const togglePersonaExpansion = (personaId: string) => {
    if (expandedPersona === personaId) {
      setExpandedPersona(null);
    } else {
      setExpandedPersona(personaId);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600';
      case 'neutral':
        return 'text-yellow-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="text-center p-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
        <p className="mt-4 text-gray-600">Simulating investor reactions...</p>
        <p className="text-sm text-gray-500 mt-2">This might take a minute or two...</p>
      </div>
    );
  }

  if (feedback.length === 0) {
    return (
      <div className="text-center text-gray-500 p-10">
        <p>No investor feedback available. Please provide a pitch deck or elevator pitch.</p>
      </div>
    );
  }

  const renderViewControls = () => (
    <div className="flex justify-between items-center mb-6">
      <div className="inline-flex rounded-md shadow-sm" role="group">
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
            viewMode === 'card'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => setViewMode('card')}
        >
          Card View
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
            viewMode === 'table'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => setViewMode('table')}
        >
          Table View
        </button>
      </div>
      
      <button
        onClick={() => setShowSummary(!showSummary)}
        className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
      >
        <span>{showSummary ? 'Hide' : 'Show'} AI Summary</span>
        <span>{showSummary ? '▼' : '▶'}</span>
      </button>
    </div>
  );

  const renderSummaryTable = () => (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="py-3 px-6">Persona</th>
            <th scope="col" className="py-3 px-6">Sentiment</th>
            <th scope="col" className="py-3 px-6">Decision</th>
            <th scope="col" className="py-3 px-6">Top Concern</th>
            <th scope="col" className="py-3 px-6">Actions</th>
          </tr>
        </thead>
        <tbody>
          {feedback.map((f) => {
            const topConcern = f.keyTakeaways.find(item => item.type === 'concern');
            return (
              <tr key={f.personaId} className="bg-white border-b hover:bg-gray-50">
                <th scope="row" className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">
                  {f.personaName}
                </th>
                <td className="py-4 px-6">
                  <span className={getSentimentColor(f.sentiment)}>
                    {f.sentiment.charAt(0).toUpperCase() + f.sentiment.slice(1)}
                  </span>
                </td>
                <td className="py-4 px-6">
                  {f.decision.decision}
                </td>
                <td className="py-4 px-6">
                  {topConcern ? topConcern.text : 'None mentioned'}
                </td>
                <td className="py-4 px-6">
                  <button
                    onClick={() => togglePersonaExpansion(f.personaId)}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {expandedPersona === f.personaId ? 'Hide Details' : 'View Details'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderCardView = () => (
    <div className="space-y-6">
      {feedback.map((f) => (
        <div key={f.personaId} className="border rounded-xl overflow-hidden shadow bg-white">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">{f.personaName}</h3>
              <div className="flex space-x-2 items-center">
                <span className={`text-sm font-medium ${getSentimentColor(f.sentiment)}`}>
                  {f.sentiment.charAt(0).toUpperCase() + f.sentiment.slice(1)}
                </span>
                <span className="bg-gray-200 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                  {f.personaType}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {f.initialImpression.substring(0, 150)}{f.initialImpression.length > 150 ? '...' : ''}
            </p>
          </div>
          
          <div className="p-4">
            <div className="flex justify-between">
              <div>
                <strong className="text-sm text-gray-700">Key Takeaways:</strong>
                <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                  {f.keyTakeaways
                    .filter(item => item.type === 'strength' || item.type === 'concern')
                    .slice(0, 3)
                    .map((point, idx) => (
                      <li key={idx} className={point.type === 'concern' ? 'text-red-600' : 'text-green-600'}>
                        {point.text}
                      </li>
                    ))
                  }
                </ul>
              </div>
              <div className="ml-2">
                <strong className="text-sm text-gray-700">Decision:</strong>
                <div className="mt-1 px-3 py-1 text-xs rounded-full bg-gray-100">
                  {f.decision.decision} ({f.decision.confidence})
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => togglePersonaExpansion(f.personaId)}
                className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
              >
                {expandedPersona === f.personaId ? 'Hide Detailed Analysis' : 'Show Detailed Analysis'}
              </button>
            </div>
            
            {expandedPersona === f.personaId && (
              <div className="mt-4 pt-4 border-t">
                <FeedbackViewer feedback={f} viewMode="card" />
                
                <FollowUpPanel 
                  feedback={f} 
                  persona={investorPersonas.find(p => p.id === f.personaId)!} 
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto py-6">
      <h2 className="text-2xl font-bold text-center mb-6">Investor Feedback Analysis</h2>
      
      {/* Show the summary panel at the top if enabled */}
      {showSummary && feedback.length > 0 && (
        <InvestorSummaryPanel feedback={feedback} />
      )}
      
      {renderViewControls()}
      {viewMode === 'table' ? renderSummaryTable() : renderCardView()}
      
      {expandedPersona && viewMode === 'table' && (
        <div className="mt-6 p-4 border rounded-xl bg-white">
          <h3 className="text-lg font-bold mb-4">Detailed Analysis</h3>
          <FeedbackViewer 
            feedback={feedback.find(f => f.personaId === expandedPersona)!} 
            viewMode="table" 
          />
          
          <FollowUpPanel 
            feedback={feedback.find(f => f.personaId === expandedPersona)!} 
            persona={investorPersonas.find(p => p.id === expandedPersona)!} 
          />
        </div>
      )}
    </div>
  );
} 
import { useEffect, useState, useMemo } from 'react';
import { generateInvestorFeedback } from '../generateInvestorFeedback';
import { investorPersonas } from '../personas/investorPersonas';
import FeedbackViewer from './FeedbackViewer';
import { InvestorSummaryPanel } from './InvestorSummaryPanel';
import { FollowUpPanel } from './FollowUpPanel';
import { FileUploadPanel } from './FileUploadPanel';
import { SlideReviewPanel } from './SlideReviewPanel';
import { LoadingIndicator } from './LoadingIndicator';
import { FeedbackResponse } from '../types/feedback';
import { SyntheticInvestor } from '../types/personas';

interface InvestorPanelProps {
  deckSlides?: string[];
  elevatorPitch?: string;
}

/**
 * Main component for investor feedback analysis
 */
export function InvestorPanel({ deckSlides = [], elevatorPitch = "" }: InvestorPanelProps) {
  const [feedback, setFeedback] = useState<FeedbackResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [expandedPersona, setExpandedPersona] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(true);
  const [parsedSlides, setParsedSlides] = useState<string[]>(deckSlides);
  const [pitchText, setPitchText] = useState<string>(elevatorPitch);
  const [error, setError] = useState<string>("");
  const [showParsedSlides, setShowParsedSlides] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Memoize the filtered persona
  const selectedPersona = useMemo(() => {
    return expandedPersona 
      ? investorPersonas.find(p => p.id === expandedPersona) 
      : null;
  }, [expandedPersona]);

  // Handle file upload results
  const handleSlidesDetected = (slides: string[], pitch: string, file: File) => {
    setParsedSlides(slides);
    setPitchText(pitch);
    setUploadedFile(file);
    setShowParsedSlides(true);
  };

  // Generate feedback from investor personas
  const generateFeedback = async () => {
    if (!parsedSlides.length && !pitchText.trim()) {
      setError("Please upload a file or enter an elevator pitch");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const res = await generateInvestorFeedback(parsedSlides, pitchText);
      setFeedback(res);
      // Hide parsed slides after generating feedback
      setShowParsedSlides(false);
    } catch (error) {
      console.error('Error generating investor feedback:', error);
      setError('Failed to generate investor feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
      <LoadingIndicator 
        message="Simulating investor reactions..." 
        subMessage="This might take a minute or two..." 
        size="large"
      />
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
                
                {selectedPersona && (
                  <FollowUpPanel 
                    feedback={f} 
                    persona={selectedPersona} 
                  />
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderActionButtons = () => (
    <div className="mt-4">
      <button
        type="button"
        onClick={generateFeedback}
        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
      >
        Generate Feedback
      </button>
    </div>
  );

  return (
    <div className="container mx-auto py-6">
      <h2 className="text-2xl font-bold text-center mb-6">Investor Feedback Analysis</h2>
      
      {/* File Upload Panel */}
      <FileUploadPanel 
        onSlidesDetected={handleSlidesDetected} 
        initialPitch={elevatorPitch}
      />
      
      {/* Slide Review Panel */}
      {showParsedSlides && (
        <SlideReviewPanel 
          slides={parsedSlides} 
          onHideSlides={() => setShowParsedSlides(false)} 
        />
      )}

      {/* Generate feedback button */}
      {!loading && (parsedSlides.length > 0 || pitchText) && (
        renderActionButtons()
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {/* Show the summary panel at the top if enabled */}
      {showSummary && feedback.length > 0 && (
        <InvestorSummaryPanel feedback={feedback} />
      )}
      
      {feedback.length > 0 && (
        <>
          {renderViewControls()}
          {viewMode === 'table' ? renderSummaryTable() : renderCardView()}
          
          {expandedPersona && viewMode === 'table' && selectedPersona && (
            <div className="mt-6 p-4 border rounded-xl bg-white">
              <h3 className="text-lg font-bold mb-4">Detailed Analysis</h3>
              <FeedbackViewer 
                feedback={feedback.find(f => f.personaId === expandedPersona)!} 
                viewMode="table" 
              />
              
              <FollowUpPanel 
                feedback={feedback.find(f => f.personaId === expandedPersona)!} 
                persona={selectedPersona} 
              />
            </div>
          )}
        </>
      )}
    </div>
  );
} 
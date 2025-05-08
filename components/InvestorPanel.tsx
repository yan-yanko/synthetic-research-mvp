import { useEffect, useState, useRef } from 'react';
import { generateInvestorFeedback, FeedbackResponse } from '../generateInvestorFeedback';
import { investorPersonas } from '../personas/investorPersonas';
import FeedbackViewer from './FeedbackViewer';
import { InvestorSummaryPanel } from './InvestorSummaryPanel';
import { FollowUpPanel } from './FollowUpPanel';
import { processFileContent } from '../utils/pdfReader';

interface InvestorPanelProps {
  deckSlides?: string[];
  elevatorPitch?: string;
}

export function InvestorPanel({ deckSlides = [], elevatorPitch = "" }: InvestorPanelProps) {
  const [feedback, setFeedback] = useState<FeedbackResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [expandedPersona, setExpandedPersona] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(true);
  const [parsedSlides, setParsedSlides] = useState<string[]>(deckSlides);
  const [pitchText, setPitchText] = useState<string>(elevatorPitch);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAutoDetectedPitch, setIsAutoDetectedPitch] = useState<boolean>(false);
  const [showParsedSlides, setShowParsedSlides] = useState<boolean>(false);
  const [expandedSlideIndex, setExpandedSlideIndex] = useState<number | null>(null);

  useEffect(() => {
    if (parsedSlides.length > 0 || pitchText) {
      // Don't auto-generate feedback anymore when slides/pitch are updated
      // Let the user review and click the button instead
    }
  }, [parsedSlides, pitchText]);

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

  // Handle file upload 
  const handleFileUpload = async (file: File | null) => {
    if (!file) {
      setError('No file selected');
      return;
    }
    
    setUploadedFile(file);
    setError('');
    setLoading(true);
    
    try {
      // Process the file using our utility
      const { slides, pitch } = await processFileContent(file);
      
      setParsedSlides(slides);
      
      // Always set the detected pitch, but mark it as auto-detected
      if (pitch) {
        setPitchText(pitch);
        setIsAutoDetectedPitch(true);
      }
      
      console.log(`Processed ${slides.length} slides from ${file.name}`);
      
      // Show parsed slides for review
      setShowParsedSlides(true);
      setLoading(false);
    } catch (err) {
      console.error('Error processing file:', err);
      setError(err instanceof Error ? err.message : 'Failed to process the uploaded file');
      setLoading(false);
    }
  };

  const toggleSlideExpansion = (index: number) => {
    if (expandedSlideIndex === index) {
      setExpandedSlideIndex(null);
    } else {
      setExpandedSlideIndex(index);
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

  const renderFileUploadPanel = () => (
    <div className="mb-6 p-4 border rounded-md bg-gray-50">
      <h3 className="text-lg font-semibold mb-3">Upload Your Pitch Deck</h3>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <label className="block mb-2 text-sm font-medium">Select a file:</label>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".pdf,.ppt,.pptx"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              Choose File
            </button>
            <span className="text-sm text-gray-600">
              {uploadedFile ? uploadedFile.name : 'No file selected'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Accepted formats: .pdf, .ppt, .pptx</p>
          
          {/* File details */}
          {uploadedFile && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded text-sm">
              <p><span className="font-medium">File:</span> {uploadedFile.name}</p>
              <p><span className="font-medium">Size:</span> {Math.round(uploadedFile.size / 1024)} KB</p>
              <p><span className="font-medium">Slides detected:</span> {parsedSlides.length}</p>
            </div>
          )}
        </div>
        
        <div className="flex-grow">
          <label className="block mb-2 text-sm font-medium">
            Elevator pitch:
            {isAutoDetectedPitch && (
              <span className="ml-2 text-xs bg-yellow-100 px-2 py-0.5 rounded-full text-yellow-800">
                Auto-detected
              </span>
            )}
          </label>
          <textarea
            value={pitchText}
            onChange={(e) => {
              setPitchText(e.target.value);
              // If user edits the pitch, it's no longer auto-detected
              if (isAutoDetectedPitch) {
                setIsAutoDetectedPitch(false);
              }
            }}
            className={`w-full p-2 border rounded resize-none ${isAutoDetectedPitch ? 'bg-yellow-50 border-yellow-300' : ''}`}
            rows={3}
            placeholder="Describe your startup in a few sentences..."
          />
          <p className="text-xs text-gray-500 mt-1">
            {isAutoDetectedPitch ? 'This pitch was automatically extracted from your document. Edit as needed.' : 'Enter a brief elevator pitch about your startup.'}
          </p>
        </div>
      </div>
      
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      
      {showParsedSlides && parsedSlides.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-sm mb-2">Parsed Slides for Review:</h4>
          <div className="max-h-60 overflow-y-auto border rounded bg-white">
            {parsedSlides.map((slide, index) => (
              <div 
                key={index}
                className="border-b last:border-b-0 p-2 hover:bg-gray-50 cursor-pointer"
                onClick={() => toggleSlideExpansion(index)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Slide {index + 1}</span>
                  <span className="text-xs text-gray-500">
                    {expandedSlideIndex === index ? 'Collapse ▲' : 'Expand ▼'}
                  </span>
                </div>
                {expandedSlideIndex === index ? (
                  <p className="text-sm mt-1 text-gray-700 whitespace-pre-line">{slide}</p>
                ) : (
                  <p className="text-sm mt-1 text-gray-700 truncate">{slide.substring(0, 100)}{slide.length > 100 ? '...' : ''}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {!loading && (parsedSlides.length > 0 || pitchText) && (
        <div className="mt-4">
          <button
            type="button"
            onClick={generateFeedback}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
          >
            Generate Feedback
          </button>
          {showParsedSlides && (
            <button
              type="button"
              onClick={() => setShowParsedSlides(false)}
              className="ml-3 text-gray-600 hover:text-gray-800 underline"
            >
              Hide Slides
            </button>
          )}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="text-center p-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
        <p className="mt-4 text-gray-600">Simulating investor reactions...</p>
        <p className="text-sm text-gray-500 mt-2">This might take a minute or two...</p>
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
      
      {/* File Upload Panel */}
      {renderFileUploadPanel()}
      
      {/* Show the summary panel at the top if enabled */}
      {showSummary && feedback.length > 0 && (
        <InvestorSummaryPanel feedback={feedback} />
      )}
      
      {feedback.length > 0 && (
        <>
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
        </>
      )}
    </div>
  );
} 
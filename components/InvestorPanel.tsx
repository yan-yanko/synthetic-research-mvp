import { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateInvestorFeedback } from '../generateInvestorFeedback';
import { investorPersonas } from '../personas/investorPersonas';
import FeedbackViewer from './FeedbackViewer';
import { InvestorSummaryPanel } from './InvestorSummaryPanel';
import { FollowUpPanel } from './FollowUpPanel';
import { SlideReviewPanel } from './SlideReviewPanel';
import { PeachLoader } from '@/components/ui/PeachLoader';
import { FeedbackResponse, FeedbackError } from '../types/feedback';
import { SyntheticInvestor } from '../types/personas';
import { Toaster, toast } from 'sonner';

// @ts-ignore - Add html2pdf import if not present
// const html2pdf: any = require('html2pdf.js'); // REMOVE THIS LINE

interface InvestorPanelProps {
  deckSlides?: string[];
  elevatorPitch?: string;
  uploadedFileName?: string;
}

// Helper type guard
function isFeedbackResponse(item: FeedbackResponse | FeedbackError): item is FeedbackResponse {
  return !(item as FeedbackError).error;
}

/**
 * Main component for investor feedback analysis
 */
export function InvestorPanel({ deckSlides = [], elevatorPitch = "", uploadedFileName }: InvestorPanelProps) {
  const [feedback, setFeedback] = useState<(FeedbackResponse | FeedbackError)[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [expandedPersona, setExpandedPersona] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(true);
  const [error, setError] = useState<string>("");
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const feedbackExportRef = useRef<HTMLDivElement>(null);

  // Memoize the filtered persona
  const selectedPersona = useMemo(() => {
    return expandedPersona 
      ? investorPersonas.find(p => p.id === expandedPersona) 
      : null;
  }, [expandedPersona]);

  // Generate feedback from investor personas
  const generateFeedback = async () => {
    if (!deckSlides.length && !elevatorPitch.trim()) {
      setError("Pitch deck slides or elevator pitch text is required.");
      toast.error("Pitch deck slides or elevator pitch text is required.");
      return;
    }

    setLoading(true);
    setError("");
    const toastId = toast.loading("Generating investor feedback...");
    
    try {
      const res = await generateInvestorFeedback(deckSlides, elevatorPitch);
      setFeedback(res);
      toast.success("Feedback generated successfully!", { id: toastId });
    } catch (error) {
      console.error('Error generating investor feedback:', error);
      setError('Failed to generate investor feedback. Please try again.');
      toast.error('Failed to generate investor feedback. Please try again.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Trigger feedback generation automatically when props are available
  useEffect(() => {
    if (!initialLoadComplete && (deckSlides.length > 0 || elevatorPitch.trim())) {
      generateFeedback();
      setInitialLoadComplete(true);
    }
  }, [deckSlides, elevatorPitch, initialLoadComplete]);

  const togglePersonaExpansion = (personaId: string) => {
    if (expandedPersona === personaId) {
      setExpandedPersona(null);
    } else {
      setExpandedPersona(personaId);
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    let badgeClass = '';
    let label = '';
    switch (sentiment) {
      case 'positive':
        badgeClass = 'bg-green-100 text-green-800';
        label = 'Positive';
        break;
      case 'neutral':
        badgeClass = 'bg-yellow-100 text-yellow-800';
        label = 'Neutral';
        break;
      case 'negative':
        badgeClass = 'bg-red-100 text-red-800';
        label = 'Negative';
        break;
      default:
        badgeClass = 'bg-gray-100 text-gray-600';
        label = sentiment;
    }
    return <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>{label}</span>;
  };

  const handleExportPDF = async () => {
    if (feedbackExportRef.current) {
      const exportInProgressToastId = toast.loading('Generating PDF, please wait...');
      const fileName = uploadedFileName 
        ? `investor-feedback-${uploadedFileName.replace(/\.pdf$/i, '')}.pdf` 
        : 'investor-feedback.pdf';
      
      try {
        // Dynamically import html2pdf.js
        const html2pdf = (await import('html2pdf.js')).default;

        await html2pdf()
          .from(feedbackExportRef.current)
          .set({
            margin: 0.5,
            filename: fileName,
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
          })
          .save();
        
        toast.success(`Successfully exported to ${fileName}`, { id: exportInProgressToastId });
      } catch (err: any) {
        console.error("Error exporting PDF:", err);
        toast.error('Failed to export PDF. Please try again.', { id: exportInProgressToastId });
      }
    }
  };

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

  // Memoize successfully fetched feedback responses for display
  const successfulFeedback = useMemo(() => {
    return feedback.filter(isFeedbackResponse);
  }, [feedback]);

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
          {successfulFeedback.map((f: FeedbackResponse) => {
            const topConcern = f.keyTakeaways.find(item => item.type === 'concern');
            return (
              <tr key={f.personaId} className="bg-white border-b hover:bg-gray-50">
                <th scope="row" className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">
                  {f.personaName}
                </th>
                <td className="py-4 px-6">
                  {getSentimentBadge(f.sentiment)}
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
      {successfulFeedback.map((f: FeedbackResponse) => (
        <div key={f.personaId} className="border rounded-xl overflow-hidden shadow bg-white">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">{f.personaName}</h3>
              <div className="flex space-x-2 items-center">
                {getSentimentBadge(f.sentiment)}
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

  const renderActionAndExportButtons = () => (
    <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
      <button
        type="button"
        onClick={generateFeedback} 
        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded w-full sm:w-auto"
        disabled={loading && feedback.length > 0}
      >
        {loading && feedback.length === 0 ? 'Generating Initial Feedback...' : (loading ? 'Regenerating...' : 'Regenerate Feedback')}
      </button>
      {successfulFeedback.length > 0 && !loading && (
        <button
          type="button"
          onClick={handleExportPDF}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full sm:w-auto"
        >
          Export to PDF
        </button>
      )}
    </div>
  );

  return (
    <div className="container mx-auto py-6">
      <Toaster richColors position="top-right" />
      <h2 className="text-2xl font-bold text-center mb-6">Investor Feedback Analysis</h2>
      
      {error && <div className="my-4 p-3 bg-red-100 text-red-700 rounded border border-red-300">Error: {error}</div>}

      <AnimatePresence mode="wait">
        {loading && feedback.length === 0 ? (
          <motion.div key="loader" className="mt-8">
            <PeachLoader message="Simulating investor reactions... This might take a minute or two..." />
          </motion.div>
        ) : successfulFeedback.length > 0 ? (
          <motion.div 
            key="feedbackContent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            ref={feedbackExportRef}
          >
            {showSummary && <InvestorSummaryPanel feedback={successfulFeedback} />}
            {renderViewControls()}
            {viewMode === 'table' ? renderSummaryTable() : renderCardView()}
          </motion.div>
        ) : null}
      </AnimatePresence>
      
      {(!loading || feedback.length > 0 || deckSlides.length > 0 || elevatorPitch.trim()) && 
        renderActionAndExportButtons() 
      }

    </div>
  );
} 
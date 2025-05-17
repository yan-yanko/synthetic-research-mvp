import React, { useState, useEffect, useRef } from 'react';
import { FeedbackResponse, FeedbackError } from '../types/feedback'; // Adjust path as needed
import { PersonaCard } from './ui/PersonaCard'; // Import from original name
import { InvestorSummaryPanel } from './InvestorSummaryPanel';
import { PeachLoader } from '@/components/ui/PeachLoader';
import { toast } from 'sonner';
import { investorPersonas } from '../personas/investorPersonas'; // Import all personas
import { SyntheticInvestor } from '../types/personas'; // Import SyntheticInvestor type

// Define a more flexible API response type
type ApiResponse = 
  { feedback: (FeedbackResponse | FeedbackError)[] } |
  { message: string; error?: undefined } | // Allow message, error should be undefined
  { error: string; feedback?: undefined; message?: undefined }; // Allow error, others undefined

interface InvestorPanelProps {
  deckBase64Content: string;
  elevatorPitch: string;
  originalFileName?: string;
}

export function InvestorPanel({ deckBase64Content, elevatorPitch, originalFileName }: InvestorPanelProps) {
  const [activeFeedback, setActiveFeedback] = useState<(FeedbackResponse | FeedbackError)[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const feedbackContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (deckBase64Content) {
      const fetchFeedback = async () => {
        setLoadingFeedback(true);
        setError(null);
        const toastId = toast.loading('Simulating investor feedback...');
        try {
          const response = await fetch('/api/generate-feedback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ deckBase64Content, elevatorPitch }),
          });

          // Error handling for non-ok responses MUST come before trying to parse .json()
          if (!response.ok) {
            let errorMsg = `API Error: ${response.status}`;
            try {
              const errorData: { error?: string, message?: string } = await response.json();
              errorMsg = errorData.error || errorData.message || `Failed to fetch feedback: ${response.statusText}`;
            } catch (jsonError) {
              // If parsing errorData fails, use the statusText or a generic message
              errorMsg = `Failed to fetch feedback: ${response.statusText} (and error response was not valid JSON).`;
            }
            throw new Error(errorMsg);
          }

          const data: ApiResponse = await response.json();

          if ('feedback' in data && data.feedback) {
            setActiveFeedback(data.feedback);
            toast.success('Feedback generated successfully!', { id: toastId });
          } else if ('message' in data && data.message) {
            toast.success(data.message, { id: toastId });
            setActiveFeedback([]); // Clear or handle appropriately if only a message is received
          } else {
            // This condition implies the response was OK but content was unexpected
            throw new Error('Invalid or empty response structure from API.');
          }
        } catch (err: any) {
          console.error("Error fetching investor feedback:", err);
          setError(err.message || 'An unknown error occurred while fetching feedback.');
          toast.error(err.message || 'Failed to generate feedback.', { id: toastId });
        }
        setLoadingFeedback(false);
      };

      fetchFeedback();
    }
  }, [deckBase64Content, elevatorPitch]);

  const handleExportPDF = async () => {
    if (feedbackContainerRef.current) {
      const toastId = toast.loading('Exporting PDF...');
      try {
        const html2pdf = (await import('html2pdf.js')).default;
        await html2pdf().from(feedbackContainerRef.current).set({
          margin: [0.5, 0.5, 0.5, 0.5], // inches
          filename: originalFileName ? `${originalFileName.replace('.pdf', '')}-feedback.pdf` : 'investor-feedback.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, logging: false, useCORS: true },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        }).save();
        toast.success('PDF exported successfully!', { id: toastId });
      } catch (err: any) {
        console.error("Error exporting PDF:", err);
        toast.error(err.message || 'Failed to export PDF.', { id: toastId });
      }
    }
  };

  if (loadingFeedback) {
    return (
      <div className="min-h-[400px] flex flex-col justify-center items-center">
        <PeachLoader message="Simulating investor feedback... This may take a moment."/>
        <p className="text-sm text-gray-500 mt-2">Please wait while our AI investors review your deck.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border border-red-300 bg-red-50 rounded-lg text-center">
        <h3 className="text-xl font-semibold text-red-700 mb-2">Error Generating Feedback</h3>
        <p className="text-red-600">{error}</p>
        <p className="text-sm text-gray-500 mt-3">Please try uploading your deck again. If the problem persists, contact support.</p>
      </div>
    );
  }

  const successfulFeedbacks = activeFeedback.filter(f => !('error' in f)) as FeedbackResponse[];
  const errorFeedbacks = activeFeedback.filter(f => 'error' in f) as FeedbackError[];

  return (
    <div ref={feedbackContainerRef}>
      {originalFileName && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800">Investor Feedback for: <span className="font-bold text-primary">{originalFileName}</span></h2>
        </div>
      )}
      
      <InvestorSummaryPanel feedback={successfulFeedbacks} />

      <div className="mt-8">
        <h3 className="text-2xl font-semibold mb-6 text-gray-800">Individual Investor Analyses:</h3>
        {errorFeedbacks.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded">
            <p className="text-sm text-yellow-700">
              Some personas encountered issues: {errorFeedbacks.map(ef => `${ef.personaName} (${ef.error})`).join(', ')}
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {successfulFeedbacks.map((feedbackItem) => {
            const persona = investorPersonas.find(p => p.id === feedbackItem.personaId);
            if (!persona) return null; // Should not happen if data is consistent
            return (
              <PersonaCard 
                key={feedbackItem.personaId} 
                persona={persona} 
                selected={false} // Not used for selection here
                onSelect={() => {}} // Dummy onSelect, not used for selection here
              />
            );
          })}
        </div>
      </div>

      {activeFeedback.length > 0 && (
        <div className="mt-12 text-center">
          <button
            onClick={handleExportPDF}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-0.5"
          >
            Export All Feedback as PDF
          </button>
        </div>
      )}
    </div>
  );
} 
import React, { useState, useEffect, useRef } from 'react';
import { FeedbackResponse, FeedbackError } from '../types/feedback'; // Adjust path as needed
import { PersonaCard } from './ui/PersonaCard'; // Import from original name
import { InvestorSummaryPanel } from './InvestorSummaryPanel';
import { PeachLoader } from '@/components/ui/PeachLoader';
import { toast } from 'sonner';
import { investorPersonas } from '../personas/investorPersonas'; // Import all personas
import { SyntheticInvestor } from '../types/personas'; // Import SyntheticInvestor type

interface InvestorPanelProps {
  deckSlides: string[];
  elevatorPitch: string;
  uploadedFileName?: string;
}

export function InvestorPanel({ deckSlides, elevatorPitch, uploadedFileName }: InvestorPanelProps) {
  const [activeFeedback, setActiveFeedback] = useState<(FeedbackResponse | FeedbackError)[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const feedbackContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (deckSlides && deckSlides.length > 0) {
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
            body: JSON.stringify({ deckSlides, elevatorPitch }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to fetch feedback: ${response.statusText}`);
          }

          const data: { feedback?: (FeedbackResponse | FeedbackError)[] } = await response.json();
          if (data.feedback) {
            setActiveFeedback(data.feedback);
            toast.success('Feedback generated successfully!', { id: toastId });
          } else {
            throw new Error('No feedback data received from API.');
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
  }, [deckSlides, elevatorPitch]);

  const handleExportPDF = async () => {
    if (feedbackContainerRef.current) {
      const toastId = toast.loading('Exporting PDF...');
      try {
        const html2pdf = (await import('html2pdf.js')).default;
        await html2pdf().from(feedbackContainerRef.current).set({
          margin: [0.5, 0.5, 0.5, 0.5], // inches
          filename: uploadedFileName ? `${uploadedFileName.replace('.pdf', '')}-feedback.pdf` : 'investor-feedback.pdf',
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
      {uploadedFileName && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800">Investor Feedback for: <span className="font-bold text-primary">{uploadedFileName}</span></h2>
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
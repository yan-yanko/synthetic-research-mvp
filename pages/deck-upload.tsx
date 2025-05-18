import React, { useState, useEffect } from 'react';
import { FileUploadPanel } from '../components/FileUploadPanel';
import { Layout } from '@/components/ui/Layout';
import { DeckProcessingScreen } from '../components/DeckProcessingScreen';
import { PitchDetailsScreen } from '../components/PitchDetailsScreen';
import { AnalysisSetupScreen } from '../components/AnalysisSetupScreen';
import { FeedbackDisplayScreen } from '../components/FeedbackDisplayScreen';
import type { InvestorFeedbackResponse } from '../types/feedback'; // Updated import path

// Define types for the flow steps and collected data
type FlowStep = 'upload' | 'processing' | 'details' | 'analysisSetup' | 'feedbackDisplay';

// Define a type for pitch details
export interface PitchDetails {
  industry: string;
  fundingStage: string;
  seekingAmount: string; // Keep as string for input, parse later if needed
  primaryRegion: string;
  executiveSummary: string;
  // elevatorPitch: string; // Removed as per request
}

// Define a type for analysis setup
export interface AnalysisSetup {
  selectedPersonas: string[];
  selectedFeedbackTypes: string[];
}

// Define a type for the API response data -- THIS WILL BE REMOVED
// export interface InvestorFeedbackResponse { 
//   emailResponses: string;
//   meetingNotes: {
//     strengths: string;
//     concerns: string;
//   };
//   slideFeedback: Array<{ slide: string; feedback: string }>;
//   consensusReport: {
//     likelihoodToInvest: string;
//     overallFeedback: string;
//   };
// }

export default function DeckUploaderPage() {
  const [currentFlowStep, setCurrentFlowStep] = useState<FlowStep>('upload');

  // Data from FileUploadPanel
  const [deckBase64Content, setDeckBase64Content] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string | null>(null);
  
  // Data from PitchDetailsScreen
  const [pitchDetails, setPitchDetails] = useState<PitchDetails | null>(null);

  // Data from AnalysisSetupScreen
  const [analysisSetup, setAnalysisSetup] = useState<AnalysisSetup | null>(null);
  const [apiResponseData, setApiResponseData] = useState<InvestorFeedbackResponse | null>(null); // State for API response

  const handleDeckProcessedInPanel = (base64: string | null, fileName: string | null) => {
    setDeckBase64Content(base64);
    setOriginalFileName(fileName);
    if (base64 && fileName) {
      setCurrentFlowStep('processing');
    } else {
      setCurrentFlowStep('upload');
    }
  };

  const handleProcessingComplete = () => {
    setCurrentFlowStep('details');
  };

  const handlePitchDetailsComplete = (details: PitchDetails) => {
    setPitchDetails(details);
    setCurrentFlowStep('analysisSetup');
  };

  const handleAnalysisSetupComplete = (setup: AnalysisSetup, responseData: InvestorFeedbackResponse | null) => {
    setAnalysisSetup(setup);
    setApiResponseData(responseData);

    // If API response contains a generated executive summary, update pitchDetails
    if (responseData && responseData.generatedExecutiveSummary) {
      setPitchDetails(prevDetails => ({
        ...(prevDetails || {
          industry: '',
          fundingStage: '',
          seekingAmount: '',
          primaryRegion: '',
          executiveSummary: '' // Default structure if prevDetails was null
        }),
        executiveSummary: responseData.generatedExecutiveSummary!, // Non-null assertion as we checked its existence
      }));
    }

    setCurrentFlowStep('feedbackDisplay');
  };

  // Render logic based on currentFlowStep
  const renderCurrentStep = () => {
    switch (currentFlowStep) {
      case 'upload':
        return <FileUploadPanel onUploadComplete={handleDeckProcessedInPanel} />;
      case 'processing':
        return <DeckProcessingScreen onProcessingComplete={handleProcessingComplete} />;
      case 'details':
        return <PitchDetailsScreen onDetailsComplete={handlePitchDetailsComplete} />;
      case 'analysisSetup':
        return <AnalysisSetupScreen 
          onSetupComplete={handleAnalysisSetupComplete} 
          pitchFileName={originalFileName || "Unknown Deck"} 
          deckBase64={deckBase64Content}
          currentPitchDetails={pitchDetails}
        />;
      case 'feedbackDisplay':
        if (!pitchDetails || !analysisSetup || !deckBase64Content /* Removed check for apiResponseData here, FeedbackScreen will use mock if null */) {
          setCurrentFlowStep('upload');
          return <p>Error: Missing critical data for feedback display. Resetting...</p>;
        }
        return (
          <FeedbackDisplayScreen 
            deckInfo={{...pitchDetails, originalFileName: originalFileName || "Unknown Deck"}}
            analysisSettings={analysisSetup}
            apiResponseData={apiResponseData} // Pass API response data
          />
        );
      default:
        return <p>Invalid flow step.</p>;
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2 text-textPrimary">Get Feedback on Your Startup Pitch</h1>
        <p className="mb-6 text-textSecondary">
          Follow the steps to upload your deck and receive simulated investor feedback.
        </p>
        {renderCurrentStep()}
      </div>
    </Layout>
  );
} 
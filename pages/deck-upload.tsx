import React, { useState } from 'react';
import { FileUploadPanel } from '../components/FileUploadPanel';
import { InvestorPanel } from '../components/InvestorPanel';
import { Layout } from '@/components/ui/Layout';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function DeckUploaderPage() {
  const [deckBase64Content, setDeckBase64Content] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string | null>(null);
  const [isDeckProcessed, setIsDeckProcessed] = useState(false);
  const [elevatorPitch, setElevatorPitch] = useState<string>("");
  const [showInvestorPanel, setShowInvestorPanel] = useState(false);

  const handleDeckProcessed = (base64: string | null, fileName: string | null) => {
    setDeckBase64Content(base64);
    setOriginalFileName(fileName);
    setIsDeckProcessed(!!base64 && !!fileName);
    if (!base64) {
        setShowInvestorPanel(false);
    }
  };

  const handleGenerateFeedback = () => {
    if (isDeckProcessed && deckBase64Content) {
      setShowInvestorPanel(true);
    } else {
      alert("Please upload and process a pitch deck first.");
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2 text-textPrimary">Get Feedback on Your Startup Pitch</h1>
        <p className="mb-6 text-textSecondary">
          Upload your pitch deck, provide an elevator pitch, and we'll simulate what real investors might say.
        </p>

        {!showInvestorPanel ? (
          <>
            <FileUploadPanel onUploadComplete={handleDeckProcessed} />
            
            <div className="mt-6 mb-6 p-6 border border-gray-200 rounded-xl bg-white shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-gray-900">2. Provide Your Elevator Pitch</h2>
              <Textarea
                placeholder="Enter your elevator pitch here (max 500 characters)..."
                value={elevatorPitch}
                onChange={(e) => setElevatorPitch(e.target.value)}
                maxLength={500}
                className="min-h-[100px] text-base"
              />
              <p className="text-xs text-gray-500 mt-1">{elevatorPitch.length}/500 characters</p>
            </div>

            {isDeckProcessed && deckBase64Content && (
                 <Button 
                    onClick={handleGenerateFeedback} 
                    className="w-full py-3 text-lg font-semibold bg-green-600 hover:bg-green-700"
                    disabled={!elevatorPitch.trim()}
                >
                    Generate Investor Feedback
                </Button>
            )}
          </>
        ) : (
          <InvestorPanel 
            deckBase64Content={deckBase64Content!}
            elevatorPitch={elevatorPitch}
            originalFileName={originalFileName} 
          />
        )}
      </div>
    </Layout>
  );
} 
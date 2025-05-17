import React, { useState } from 'react';
import { FileUploadPanel } from '../components/FileUploadPanel';
import { InvestorPanel } from '../components/InvestorPanel';
import { Layout } from '@/components/ui/Layout';

export default function DeckUploader() {
  const [deckSlides, setDeckSlides] = useState<string[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [elevatorPitch, setElevatorPitch] = useState<string>(""); // Assuming pitch is empty for now or handled elsewhere

  const handleUploadComplete = (slides: string[], file: File | null) => {
    setDeckSlides(slides);
    setUploadedFile(file); // Keep the full file object for now
    setUploadComplete(!!file);
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2 text-textPrimary">Get Feedback on Your Startup Pitch</h1>
        <p className="mb-6 text-textSecondary">
          Upload your pitch deck (PDF only), and we'll simulate what a real investor might say — including whether they'd take the meeting.
        </p>
        {!uploadComplete ? (
          <FileUploadPanel onUploadComplete={handleUploadComplete} />
        ) : (
          <InvestorPanel 
            deckSlides={deckSlides} 
            elevatorPitch={elevatorPitch}
            uploadedFileName={uploadedFile?.name} // Pass the filename
          />
        )}
      </div>
    </Layout>
  );
} 
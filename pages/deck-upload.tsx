import React, { useState } from 'react';
import { InvestorPanel } from '../components/InvestorPanel';
import { FileUploadPanel } from '../components/FileUploadPanel';

export default function DeckUploader() {
  const [slides, setSlides] = useState<string[]>([]);
  const [pitch, setPitch] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  // Handler for FileUploadPanel
  const handleSlidesDetected = (slides: string[], pitch: string, file: File | null) => {
    setSlides(slides);
    setPitch(pitch);
    setFile(file);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Get Feedback on Your Startup Pitch</h1>
      <p className="mb-6 text-gray-600">
        Upload your elevator pitch and your deck (PDF, PPTX, or Google Slides), and we'll simulate what a real investor might say — including whether they'd take the meeting.
      </p>
      <FileUploadPanel onSlidesDetected={handleSlidesDetected} />
      <InvestorPanel deckSlides={slides} elevatorPitch={pitch} />
    </div>
  );
} 
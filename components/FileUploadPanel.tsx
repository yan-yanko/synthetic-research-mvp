import { useState, useRef } from 'react';
import { processFileContent } from '../utils/pdfReader';

export interface FileUploadPanelProps {
  onSlidesDetected: (slides: string[], pitch: string, file: File) => void;
  initialPitch?: string;
}

/**
 * A component for uploading and processing pitch deck files
 */
export function FileUploadPanel({ onSlidesDetected, initialPitch = '' }: FileUploadPanelProps) {
  const [pitchText, setPitchText] = useState<string>(initialPitch);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAutoDetectedPitch, setIsAutoDetectedPitch] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

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
      
      // Only update the pitch if it's not already set or if it's the default value
      if (pitch) {
        setPitchText(pitch);
        setIsAutoDetectedPitch(true);
      }
      
      console.log(`Processed ${slides.length} slides from ${file.name}`);
      
      // Notify parent component of detected slides and pitch
      onSlidesDetected(slides, pitchText || pitch, file);
      setLoading(false);
    } catch (err) {
      console.error('Error processing file:', err);
      setError(err instanceof Error ? err.message : 'Failed to process the uploaded file');
      setLoading(false);
    }
  };

  return (
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
              disabled={loading}
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
            {isAutoDetectedPitch 
              ? 'This pitch was automatically extracted from your document. Edit as needed.' 
              : 'Enter a brief elevator pitch about your startup.'}
          </p>
        </div>
      </div>
      
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
} 
import React, { useState, useRef, useEffect } from 'react';
import PitchResults from '../components/PitchResults';
import { reportError } from '../utils/errorReporter';

// Error Boundary specifically for the file upload component
class FileUploadErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    console.error('FileUploadErrorBoundary caught an error:', error, info);
    reportError({
      error,
      action: 'file_upload_component_error',
      userInput: {
        componentStack: info.componentStack
      }
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-300 text-red-800 p-4 rounded-md">
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p>We encountered an error with the file upload. Please try again or contact support if the issue persists.</p>
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Safe file display component that never crashes
const SafeFileDisplay = ({ file }: { file: File | null }) => {
  // Multiple defensive checks
  if (!file) {
    return <div className="text-red-600 text-sm">No file selected</div>;
  }
  
  try {
    if (typeof file !== 'object') {
      console.error('File is not an object:', file);
      return <div className="text-red-600 text-sm">Invalid file object</div>;
    }
    
    if (!file.name) {
      console.error('File has no name property:', file);
      return <div className="text-red-600 text-sm">File has no name</div>;
    }
    
    // Additional safety for rendering
    const safeFileName = String(file.name).substring(0, 100); // Prevent massive filenames
    return <div className="text-sm text-gray-600 mt-2 font-bold">{safeFileName}</div>;
  } catch (err) {
    console.error('Error rendering file name:', err);
    return <div className="text-red-600 text-sm">Error displaying file info</div>;
  }
};

export default function DeckUploader() {
  // Store file in a ref as well to avoid race conditions
  const fileRef = useRef<File | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pitchText, setPitchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAreaRef = useRef<HTMLDivElement>(null);
  
  // Safely synchronize file state with ref
  useEffect(() => {
    fileRef.current = file;
  }, [file]);

  // Example elevator pitch
  const examplePitch = "Our startup, EcoTrack, is developing a mobile app that helps consumers track and reduce their carbon footprint through daily choices. The app uses AI to analyze purchase patterns and suggest eco-friendly alternatives. We've built a prototype with 500 beta users who reduced their carbon impact by 20% on average. We have partnerships with 5 sustainable brands who pay for premium placement. Our team includes an ex-Google product manager and an environmental scientist. We're raising $500K to launch fully and reach 50,000 users in 12 months.";

  // Safer file select logic
  const handleFileSelect = (newFile: File | null) => {
    try {
      // Clear previous errors
      setError('');
      
      // Validate file exists
      if (!newFile) {
        console.log('No file provided to handleFileSelect');
        setFile(null);
        return;
      }
      
      // Validate file is an object
      if (typeof newFile !== 'object') {
        console.error('Invalid file type provided:', typeof newFile);
        setError('Invalid file format');
        setFile(null);
        return;
      }
      
      // Validate file has necessary properties
      if (!newFile.type) {
        console.error('File has no type property');
        setError('Cannot determine file type');
        setFile(null);
        return;
      }
      
      // Check file type
      if (newFile.type === 'application/pdf') {
        console.log('PDF file selected:', newFile.name);
        setFile(newFile);
      } else {
        console.error('Non-PDF file selected:', newFile.type);
        setError('Please select a valid PDF file');
        setFile(null);
      }
    } catch (err) {
      console.error('Error in handleFileSelect:', err);
      setError('Error processing selected file');
      setFile(null);
    }
  };

  // Safely handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    try {
      e.preventDefault();
      if (uploadAreaRef.current) {
        uploadAreaRef.current.classList.add('drag-over');
      }
    } catch (err) {
      console.error('Error in handleDragOver:', err);
    }
  };

  const handleDragLeave = () => {
    try {
      if (uploadAreaRef.current) {
        uploadAreaRef.current.classList.remove('drag-over');
      }
    } catch (err) {
      console.error('Error in handleDragLeave:', err);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    try {
      e.preventDefault();
      
      if (uploadAreaRef.current) {
        uploadAreaRef.current.classList.remove('drag-over');
      }
      
      // Safe array access
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const droppedFile = files[0];
        handleFileSelect(droppedFile);
      } else {
        console.warn('No files in drop event');
      }
    } catch (err) {
      console.error('Error in handleDrop:', err);
      setError('Error processing dropped file');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Submit triggered, file state:', file);
      
      // Get synchronized file from ref to avoid race conditions
      const currentFile = fileRef.current;
      
      // Multiple defensive checks for file
      if (!currentFile) {
        setError('Please select a file');
        return;
      }
      
      if (typeof currentFile !== 'object') {
        setError('Invalid file object');
        return;
      }
      
      if (!currentFile.name) {
        setError('File has no name');
        return;
      }
      
      // Check for text input
      if (!pitchText || !pitchText.trim()) {
        setError('Please provide your elevator pitch');
        return;
      }
      
      // Everything validated, proceed with form submission
      setLoading(true);
      setError('');
      setResult(null);
      
      const formData = new FormData();
      // Safe append
      try {
        formData.append('file', currentFile);
        formData.append('pitchText', pitchText);
      } catch (err) {
        console.error('Error creating FormData:', err);
        setError('Error preparing upload data');
        setLoading(false);
        return;
      }
      
      // Use local Next.js API endpoint
      const apiUrl = '/api/upload/deck';
      console.log(`Sending deck to ${apiUrl}`);
      
      let response;
      try {
        response = await fetch(apiUrl, {
          method: 'POST',
          body: formData
        });
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Network error. Please check your connection and try again.');
        setLoading(false);
        return;
      }
      
      // Get the full response text for debugging
      let responseText;
      try {
        responseText = await response.text();
        console.log(`Response status: ${response.status}`);
        console.log(`Response text length: ${responseText?.length || 0} chars`);
        
        // Log the full response for debugging
        console.log("Full response from backend:", response);
      } catch (err) {
        console.error('Error reading response:', err);
        setError('Error processing server response');
        setLoading(false);
        return;
      }
      
      // If not a successful response
      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;
        
        // Try to parse the response as JSON
        try {
          if (responseText && responseText.trim()) {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorData.details || errorMessage;
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          // If parse failed, use the raw text with length limit
          if (responseText && responseText.length > 100) {
            errorMessage += `: ${responseText.substring(0, 100)}...`;
          } else if (responseText) {
            errorMessage += `: ${responseText}`;
          }
        }
        
        console.error('API error:', errorMessage);
        setError(errorMessage);
        setLoading(false);
        return;
      }
      
      // Parse the successful response
      let data;
      try {
        if (responseText && responseText.trim()) {
          data = JSON.parse(responseText);
        } else {
          throw new Error('Empty response');
        }
      } catch (parseError) {
        console.error('Error parsing successful response:', parseError);
        setError('Invalid response format from server');
        setLoading(false);
        return;
      }
      
      console.log('API request successful');
      setResult(data);
    } catch (err) {
      // Global error handler
      console.error('Global error in handleSubmit:', err);
      
      // Log the error with our reporter utility - using optional chaining for safety
      await reportError({
        error: err,
        action: 'pitch_deck_upload',
        userInput: {
          hasPitchText: Boolean(pitchText?.trim()),
          fileSize: file?.size,
          fileName: file?.name,
          apiUrl: '/api/upload/deck'
        }
      });
      
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while analyzing the pitch';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const useExamplePitch = () => {
    try {
      setPitchText(examplePitch);
    } catch (err) {
      console.error('Error in useExamplePitch:', err);
    }
  };

  // Log file state but protect from console errors
  useEffect(() => {
    try {
      console.log("🟡 Current file state:", file ? {
        name: file.name,
        type: file.type,
        size: file.size
      } : "No file");
    } catch (err) {
      console.error("Error logging file state:", err);
    }
  }, [file]);

  return (
    <FileUploadErrorBoundary>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Get Feedback on Your Startup Pitch</h1>
        <p className="mb-6 text-gray-600">
          Upload your elevator pitch and your deck, and we'll simulate what a real investor might say — including whether they'd take the meeting.
        </p>
        <ul className="list-disc pl-5 text-sm text-gray-700 mb-6">
          <li>Honest, structured feedback from a synthetic VC</li>
          <li>Strengths and concerns</li>
          <li>Meeting recommendation (yes/no)</li>
          <li>Suggested real investors you should approach</li>
        </ul>
        
        <form onSubmit={handleSubmit}>
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <label htmlFor="pitch-text" className="block font-bold mb-2">
              Your elevator pitch or executive summary:
            </label>
            <textarea
              id="pitch-text"
              rows={5}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Describe your startup in 1-2 paragraphs. What problem you're solving, your solution, market opportunity, traction, team, and funding ask..."
              value={pitchText}
              onChange={(e) => setPitchText(e.target.value)}
            />
            <button 
              type="button"
              className="mt-2 text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
              onClick={useExamplePitch}
            >
              See example pitch
            </button>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <label className="block font-bold mb-2">
              Upload your pitch deck (PDF):
            </label>
            <div
              ref={uploadAreaRef}
              className="border-2 border-dashed border-gray-300 p-6 text-center rounded-md bg-white"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <p>Drag & drop your PDF file here</p>
              <p>or</p>
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  try {
                    const files = e.target.files;
                    if (!files || files.length === 0) {
                      setError('Please select a file before submitting');
                      setFile(null);
                      return;
                    }
                    handleFileSelect(files[0]);
                  } catch (err) {
                    console.error('Error in file input change:', err);
                    setError('Error processing selected file');
                    setFile(null);
                  }
                }}
              />
              <button
                type="button"
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={() => {
                  try {
                    if (fileInputRef.current) {
                      fileInputRef.current.click();
                    }
                  } catch (err) {
                    console.error('Error clicking file input:', err);
                  }
                }}
              >
                Select PDF File
              </button>
              
              {/* Safe file display via dedicated component */}
              <SafeFileDisplay file={file} />
            </div>
          </div>
          
          {error && (
            <div className="text-red-600 mb-4">{error}</div>
          )}
          
          <button
            type="submit"
            disabled={loading || !file || !pitchText.trim()}
            className="bg-green-600 text-white px-6 py-3 rounded-md font-medium disabled:opacity-50"
          >
            {loading ? 'Analyzing your pitch...' : 'Get Feedback'}
          </button>
        </form>
        
        {loading && (
          <div className="text-center my-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2">This may take up to a minute</p>
          </div>
        )}
        
        {result && (
          <div className="mt-8 border rounded-md p-6">
            <h2 className="text-2xl font-bold mb-4">🧠 Simulated Investor Response</h2>
            
            <div className="bg-blue-50 p-4 rounded-md mb-4 text-sm">
              <p>Analysis completed on {new Date().toLocaleDateString()}</p>
              <p>Analyzed {result?.summary?.deckPages || '?'} page pitch deck and {pitchText?.length || 0} character elevator pitch</p>
            </div>
            
            {result?.investor && (
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <h3 className="text-xl font-bold mb-3">{result.investor.name || 'Investor'} Feedback</h3>
                {result.investor.background && (
                  <p className="text-gray-600 mb-4">{result.investor.background}</p>
                )}
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-green-700 flex items-center">
                      <span className="mr-2">✓</span> What's Compelling
                    </h4>
                    <div className="mt-2 pl-6">
                      {/* Safely extract strengths section from feedback */}
                      <div className="whitespace-pre-line">
                        {result.feedback && typeof result.feedback === 'string' && result.feedback.includes('Strengths')
                          ? result.feedback.split('Strengths')[1].split('Concerns')[0] 
                          : 'Strengths section not found in feedback'}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-red-700 flex items-center">
                      <span className="mr-2">⚠</span> What's Risky
                    </h4>
                    <div className="mt-2 pl-6">
                      {/* Safely extract concerns section from feedback */}
                      <div className="whitespace-pre-line">
                        {result.feedback && typeof result.feedback === 'string' && result.feedback.includes('Concerns')
                          ? result.feedback.split('Concerns')[1].split('Would you take a meeting')[0] 
                          : 'Concerns section not found in feedback'}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-blue-700 flex items-center">
                      <span className="mr-2">🤝</span> Meeting Decision
                    </h4>
                    <div className="mt-2 pl-6">
                      {/* Safely extract meeting decision from feedback */}
                      <div className="whitespace-pre-line font-medium">
                        {result.feedback && typeof result.feedback === 'string' && result.feedback.includes('Would you take a meeting')
                          ? result.feedback.split('Would you take a meeting')[1]
                          : 'Meeting decision not found in feedback'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {result?.realInvestors && Array.isArray(result.realInvestors) && result.realInvestors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4">🔗 Real Investor Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {result.realInvestors.slice(0, 3).map((investor: any, index: number) => (
                    <div key={index} className="border rounded-md p-4 bg-white hover:shadow-md transition">
                      <h4 className="font-bold">{investor?.name || 'Investor'}</h4>
                      {investor?.thesis && (
                        <p className="text-sm text-gray-600 my-2">{investor.thesis}</p>
                      )}
                      {investor?.website && (
                        <a 
                          href={investor.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Visit website
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {result?.feedback && (
              <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200 space-y-4">
                <h3 className="text-xl font-bold mb-2">Detailed Feedback</h3>
                
                {Array.isArray(result.feedback.strengths) && result.feedback.strengths.length > 0 && (
                  <div>
                    <strong className="text-green-700 flex items-center">
                      <span className="mr-2">📈</span> Strengths:
                    </strong>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                      {result.feedback.strengths.map((strength: string, i: number) => (
                        <li key={i} className="text-gray-700">{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {Array.isArray(result.feedback.concerns) && result.feedback.concerns.length > 0 && (
                  <div>
                    <strong className="text-red-700 flex items-center">
                      <span className="mr-2">⚠️</span> Concerns:
                    </strong>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                      {result.feedback.concerns.map((concern: string, i: number) => (
                        <li key={i} className="text-gray-700">{concern}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {result.feedback.recommendation && (
                  <div>
                    <strong className="text-blue-700 flex items-center">
                      <span className="mr-2">🤝</span> Meeting Recommendation:
                    </strong>
                    <p className="ml-7 mt-1 font-medium">{result.feedback.recommendation}</p>
                  </div>
                )}
                
                {Array.isArray(result.feedback.suggestedInvestors) && result.feedback.suggestedInvestors.length > 0 && (
                  <div>
                    <strong className="text-purple-700 flex items-center">
                      <span className="mr-2">🎯</span> Suggested Investors:
                    </strong>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                      {result.feedback.suggestedInvestors.map((investor: string, i: number) => (
                        <li key={i} className="text-gray-700">{investor}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-8 border-t pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div>
                  <h3 className="font-bold mb-2">📤 Save this report (coming soon)</h3>
                  <p className="text-sm text-gray-600">Export to PDF or receive via email</p>
                </div>
                
                <div className="mt-4 md:mt-0">
                  <h3 className="font-bold mb-2">Get notified about new features</h3>
                  <div className="flex">
                    <input 
                      type="email" 
                      placeholder="Your email" 
                      className="border rounded-l p-2 text-sm w-48"
                    />
                    <button 
                      type="button"
                      className="bg-blue-600 text-white rounded-r px-3 text-sm"
                    >
                      Notify Me
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </FileUploadErrorBoundary>
  );
} 
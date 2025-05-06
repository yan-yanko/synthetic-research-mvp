import React, { useState, useRef } from 'react';
import PitchResults from '../components/PitchResults';

export default function DeckUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [pitchText, setPitchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAreaRef = useRef<HTMLDivElement>(null);

  // Example elevator pitch
  const examplePitch = "Our startup, EcoTrack, is developing a mobile app that helps consumers track and reduce their carbon footprint through daily choices. The app uses AI to analyze purchase patterns and suggest eco-friendly alternatives. We've built a prototype with 500 beta users who reduced their carbon impact by 20% on average. We have partnerships with 5 sustainable brands who pay for premium placement. Our team includes an ex-Google product manager and an environmental scientist. We're raising $500K to launch fully and reach 50,000 users in 12 months.";

  const handleFileSelect = (newFile: File | null) => {
    if (newFile && newFile.type === 'application/pdf') {
      setFile(newFile);
      setError('');
    } else if (newFile) {
      setFile(null);
      setError('Please select a valid PDF file');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (uploadAreaRef.current) {
      uploadAreaRef.current.classList.add('drag-over');
    }
  };

  const handleDragLeave = () => {
    if (uploadAreaRef.current) {
      uploadAreaRef.current.classList.remove('drag-over');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (uploadAreaRef.current) {
      uploadAreaRef.current.classList.remove('drag-over');
    }
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !pitchText.trim()) {
      setError('Please provide both elevator pitch and pitch deck');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pitchText', pitchText);
    
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      const response = await fetch('/api/upload/deck', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process the pitch deck');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while analyzing the pitch');
    } finally {
      setLoading(false);
    }
  };

  const useExamplePitch = () => {
    setPitchText(examplePitch);
  };

  return (
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
              onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            />
            <button
              type="button"
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => fileInputRef.current?.click()}
            >
              Select PDF File
            </button>
            {file && (
              <div className="mt-2 font-bold text-green-600">{file.name}</div>
            )}
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
            <p>Analyzed {result.summary.deckPages} page pitch deck and {pitchText.length} character elevator pitch</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h3 className="text-xl font-bold mb-3">{result.investor.name} Feedback</h3>
            <p className="text-gray-600 mb-4">{result.investor.background}</p>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-green-700 flex items-center">
                  <span className="mr-2">✓</span> What's Compelling
                </h4>
                <div className="mt-2 pl-6">
                  {/* Extract strengths section from feedback */}
                  <div className="whitespace-pre-line">
                    {result.feedback.includes('Strengths') 
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
                  {/* Extract concerns section from feedback */}
                  <div className="whitespace-pre-line">
                    {result.feedback.includes('Concerns') 
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
                  {/* Extract meeting decision from feedback */}
                  <div className="whitespace-pre-line font-medium">
                    {result.feedback.includes('Would you take a meeting') 
                      ? result.feedback.split('Would you take a meeting')[1]
                      : 'Meeting decision not found in feedback'}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {result.realInvestors && result.realInvestors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4">🔗 Real Investor Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.realInvestors.slice(0, 3).map((investor: any, index: number) => (
                  <div key={index} className="border rounded-md p-4 bg-white hover:shadow-md transition">
                    <h4 className="font-bold">{investor.name}</h4>
                    <p className="text-sm text-gray-600 my-2">{investor.thesis}</p>
                    {investor.website && (
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
                  <button className="bg-blue-600 text-white rounded-r px-3 text-sm">
                    Notify Me
                  </button>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
} 
import { useState } from 'react';
import PersonaConfigurator from './components/PersonaConfigurator';
import PromptInput from './components/PromptInput';
import ResultsViewer from './components/ResultsViewer';
import { simulate } from './api/simulate';

export default function App() {
  const [audienceConfig, setAudienceConfig] = useState({});
  const [prompt, setPrompt] = useState('');
  const [results, setResults] = useState([]);

  const handleGenerate = async () => {
    try {
      const data = await simulate(prompt, audienceConfig);
      setResults(data);
    } catch (err) {
      console.error('Simulation failed', err);
    }
  };

  // Simple alert for PDF functionality
  const handleExport = () => {
    window.alert('PDF export is temporarily disabled in this version.');
  };

  return (
    <div className="p-6 space-y-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Synthetic Research Sandbox</h1>
      <PersonaConfigurator onChange={setAudienceConfig} />
      <PromptInput prompt={prompt} setPrompt={setPrompt} />
      <div className="flex gap-2">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleGenerate}
        >
          Generate Responses
        </button>
        
        {results.length > 0 && (
          <button
            className="bg-green-600 text-white px-4 py-2 rounded flex items-center"
            onClick={handleExport}
          >
            Export to PDF
          </button>
        )}
      </div>
      <div id="results-container">
        <ResultsViewer results={results} />
      </div>
    </div>
  );
} 
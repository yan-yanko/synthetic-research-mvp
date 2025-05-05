import { useState } from 'react';
import PersonaConfigurator from './components/PersonaConfigurator';
import PromptInput from './components/PromptInput';
import ResultsViewer from './components/ResultsViewer';
import { simulate } from './api/simulate';

export default function App() {
  const [audienceConfig, setAudienceConfig] = useState({});
  const [prompt, setPrompt] = useState('');
  const [results, setResults] = useState([]);
  // PDF export temporarily disabled
  // const [isExporting, setIsExporting] = useState(false);

  const handleGenerate = async () => {
    try {
      const data = await simulate(prompt, audienceConfig);
      setResults(data);
    } catch (err) {
      console.error('Simulation failed', err);
    }
  };

  /* 
  // PDF export functionality temporarily removed
  const handleExport = async () => {
    if (results.length === 0) return;
    
    setIsExporting(true);
    try {
      // Dynamic import of html2pdf
      const html2pdf = (await import('html2pdf.js')).default;
      
      const content = document.getElementById('results-container');
      await html2pdf()
        .set({ margin: 1, filename: 'synthetic-research.pdf' })
        .from(content)
        .save();
    } catch (err) {
      console.error('PDF export failed', err);
    } finally {
      setIsExporting(false);
    }
  };
  */

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
        
        {/* PDF export button temporarily removed
        {results.length > 0 && (
          <button
            className="bg-green-600 text-white px-4 py-2 rounded flex items-center"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export to PDF'}
          </button>
        )}
        */}
      </div>
      <div id="results-container">
        <ResultsViewer results={results} />
      </div>
    </div>
  );
} 
export default function ResultsViewer({ results }) {
  if (!results || results.length === 0) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50 mt-4">
        <p className="text-gray-500 italic">No results yet. Generate responses to see them here.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-gray-50 mt-4">
      <h2 className="text-lg font-medium mb-3">Research Results</h2>
      <div className="space-y-4">
        {results.map((result, index) => (
          <div key={index} className="bg-white p-3 rounded border">
            <div className="font-medium text-blue-600 mb-1">
              {result.persona.jobRole} ({result.persona.age}, {result.persona.gender})
            </div>
            <p className="text-gray-700">{result.response}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 
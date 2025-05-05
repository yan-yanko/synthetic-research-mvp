export default function PromptInput({ prompt, setPrompt }) {
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h2 className="text-lg font-medium mb-3">Research Prompt</h2>
      <textarea
        className="w-full border border-gray-300 rounded-md p-2 h-24"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your research question here..."
      />
    </div>
  );
} 
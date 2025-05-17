import { useState, useRef, useCallback } from 'react';
import { readPDFAsBase64 } from '../utils/pdfReader';
import { PeachLoader } from '@/components/ui/PeachLoader';
import { toast } from 'sonner';
// @ts-ignore
// const html2pdf: any = require('html2pdf.js'); // REMOVE THIS LINE

interface FileUploadPanelProps {
  onUploadComplete: (deckBase64: string | null, originalFileName: string | null) => void;
}

export function FileUploadPanel({ onUploadComplete }: FileUploadPanelProps) {
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = useCallback(async (file: File | null) => {
    if (!file) {
      setError('No file selected');
      toast.error('No file selected');
      setUploadedFile(null);
      onUploadComplete(null, null);
      return;
    }
    setUploadedFile(file);
    setError('');
    setLoading(true);
    const toastId = toast.loading(`Processing ${file.name} for Base64 encoding...`);
    try {
      const base64String = await readPDFAsBase64(file);
      onUploadComplete(base64String, file.name);
      toast.success(`${file.name} processed successfully.`, { id: toastId });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process the uploaded file into Base64';
      setError(errorMessage);
      toast.error(errorMessage, { id: toastId });
      setUploadedFile(null);
      onUploadComplete(null, null);
    } finally {
      setLoading(false);
    }
  }, [onUploadComplete]);

  return (
    <div className="mb-8 p-6 border border-gray-200 rounded-xl bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-gray-900">1. Upload Your Pitch Deck (PDF only)</h2>
      <div className="flex flex-col gap-6">
        <div>
          <label className="block mb-2 text-base font-medium text-gray-700">Select a PDF file:</label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded shadow-sm"
              disabled={loading}
            >
              Choose PDF File
            </button>
            <span className="text-sm text-gray-600">
              {uploadedFile ? uploadedFile.name : 'No file selected'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Accepted format: <span className="font-semibold">.pdf</span> only</p>
          {uploadedFile && (
            <div className="mt-3 p-2 bg-blue-50 border border-blue-100 rounded text-sm">
              <p><span className="font-medium">File:</span> {uploadedFile.name}</p>
              <p><span className="font-medium">Size:</span> {Math.round(uploadedFile.size / 1024)} KB</p>
            </div>
          )}
        </div>
      </div>
      {loading && (
        <div className="mt-6 flex justify-center">
          <PeachLoader message="Processing PDF..." />
        </div>
      )}
      {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">{error}</div>}
    </div>
  );
} 
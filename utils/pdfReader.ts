/**
 * PDF File Reader Utility
 * Simple utility for extracting text content from PDF files in the browser
 */

import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Extracts text content from a PDF file
 * In a real implementation, you would use a proper PDF library like pdf.js
 * This is a simplified version for MVP purposes
 */
export async function extractPDFContent(file: File): Promise<{ slides: string[] }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;
  const slides: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ').trim();
    slides.push(pageText);
  }
  return { slides };
}

/**
 * Extracts text content from PowerPoint (PPT/PPTX) files
 * Note: This is a placeholder function. In a real implementation,
 * you would need a more sophisticated approach like using an external API
 * since processing PPT/PPTX files in the browser is more complex.
 */
export async function extractPPTContent(file: File): Promise<{ slides: string[], pitch: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      // This is a simplified mockup - in reality, PPT parsing requires specialized libraries
      // For a real implementation, consider using server-side processing or a service
      
      // Return a simple mock result for now
      resolve({
        slides: ['[PPT content not directly accessible in browser - this is a placeholder]'],
        pitch: 'Please enter your elevator pitch manually for PPT files in this version.'
      });
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading PPT file'));
    };
    
    // For demonstration purposes only - this won't actually extract PPT content
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Determines the appropriate parser based on file extension and processes the file
 */
export async function processFileContent(file: File): Promise<{ slides: string[] }> {
  const fileType = file.name.split('.').pop()?.toLowerCase();
  if (fileType === 'pdf') {
    return extractPDFContent(file);
  }
  throw new Error('Only PDF files are supported at this time.');
} 
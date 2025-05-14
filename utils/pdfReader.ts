/**
 * PDF File Reader Utility
 * Simple utility for extracting text content from PDF files in the browser
 */

// @ts-ignore
import * as pdfjsNamespace from 'pdfjs-dist/legacy/build/pdf.js';
// @ts-ignore
import { GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.js';

// Set worker path using the version from the imported pdfjsNamespace
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsNamespace.version}/pdf.worker.min.js`;

/**
 * Extracts text content from a PDF file
 * In a real implementation, you would use a proper PDF library like pdf.js
 * This is a simplified version for MVP purposes
 */
export async function extractPDFContent(file: File): Promise<{ slides: string[] }> {
  const arrayBuffer = await file.arrayBuffer();
  // @ts-ignore
  const pdf = await pdfjsNamespace.getDocument({ data: arrayBuffer }).promise;
  const slides: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    // @ts-ignore
    const pageText = textContent.items.map((item: any) => ('str' in item ? item.str : '')).join(' ').trim();
    slides.push(pageText);
  }
  return { slides };
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
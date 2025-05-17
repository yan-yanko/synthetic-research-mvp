/**
 * PDF File Reader Utility
 * Simple utility for extracting text content from PDF files in the browser
 */

// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extracts text content from a PDF file
 * In a real implementation, you would use a proper PDF library like pdf.js
 * This is a simplified version for MVP purposes
 */
export async function extractPDFContent(file: File): Promise<{ slides: string[] }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const slides: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
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

/**
 * Reads a File object and converts it to a Base64 encoded string.
 * @param file The File object to read.
 * @returns A Promise that resolves with the Base64 string (including the data URI prefix).
 */
export function readPDFAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as Base64 string.'));
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file); // Reads the file as a data URL (Base64 encoded)
  });
}
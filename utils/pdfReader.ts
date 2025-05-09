/**
 * PDF File Reader Utility
 * Simple utility for extracting text content from PDF files in the browser
 */

/**
 * Extracts text content from a PDF file
 * In a real implementation, you would use a proper PDF library like pdf.js
 * This is a simplified version for MVP purposes
 */
export async function extractPDFContent(file: File): Promise<{ slides: string[], pitch: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (!event.target?.result) {
        reject(new Error('Failed to read file'));
        return;
      }
      
      try {
        // Get the file content as a string
        const textContent = event.target.result.toString();
        
        // Split into slides based on common page separators or paragraphs
        // This is a very simplified approach - in a real app you'd use pdf.js
        const slideTexts = textContent
          .split(/\n\s*\n|\f|---|\[slide\s*\d+\]/gi)
          .map(slide => slide.trim())
          .filter(slide => slide.length > 0);
        
        // Extract possible elevator pitch from the first slide
        // Typically this would be the title slide or executive summary
        const firstSlideContent = slideTexts[0] || '';
        const detectedPitch = firstSlideContent.substring(0, 500);
        
        resolve({
          slides: slideTexts,
          pitch: detectedPitch
        });
      } catch (err) {
        console.error('Error parsing PDF content:', err);
        reject(new Error('Failed to parse PDF content'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
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
export async function processFileContent(fileOrUrl: File | string): Promise<{ slides: string[], pitch: string }> {
  if (typeof fileOrUrl === 'string') {
    // Google Slides URL: call backend
    const formData = new FormData();
    formData.append('googleSlidesUrl', fileOrUrl);
    const response = await fetch('/api/upload/deck', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to process Google Slides');
    return { slides: data.slides, pitch: data.pitch };
  }
  const file = fileOrUrl;
  const fileType = file.name.split('.').pop()?.toLowerCase();
  switch (fileType) {
    case 'pdf':
      return extractPDFContent(file);
    case 'ppt':
    case 'pptx':
      return extractPPTContent(file);
    default:
      throw new Error('Unsupported file type. Please use PDF, PPT, PPTX, or Google Slides.');
  }
} 
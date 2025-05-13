import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import { promisify } from 'util';
import path from 'path';
import { reportError } from '../../../utils/errorReporter';
import { setCorsHeaders } from '../../../utils/cors';

// Disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Received pitch deck upload request");

  // Set CORS headers
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Dynamic import for formidable
    const formidable = await import('formidable');
    const form = new formidable.IncomingForm({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      filter: (part: any) => {
        return part.mimetype === 'application/pdf' || part.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || part.mimetype === 'application/vnd.ms-powerpoint' || part.mimetype === 'application/vnd.ms-office'; // Only accept PDF, PPT, PPTX, and Google Slides
      }
    });
    
    console.log('Parsing form data');
    
    // Parse the form using a Promise wrapper
    const { fields, files } = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
      form.parse(req, (err: any, fields: any, files: any) => {
        if (err) {
          console.error('Error parsing form:', err);
          return reject(err);
        }
        resolve({ fields, files });
      });
    });
    
    // Get the uploaded file
    const file = files.file;
    const pitchText = fields.pitchText;
    
    // Check for Google Slides URL
    if (fields.googleSlidesUrl) {
      const googleSlidesUrl = fields.googleSlidesUrl;
      try {
        // Use googleapis to fetch slides text
        const { google } = await import('googleapis');
        // You need to set up Google API credentials for this to work in production
        // For MVP, we can try to fetch the public text export if available
        // Extract the presentation ID from the URL
        const match = googleSlidesUrl.match(/presentation\/d\/([a-zA-Z0-9-_]+)/);
        const presentationId = match ? match[1] : null;
        if (!presentationId) {
          return res.status(400).json({ error: 'Invalid Google Slides URL' });
        }
        // For MVP, try to fetch the public text export
        const exportUrl = `https://docs.google.com/presentation/d/${presentationId}/export/txt`;
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(exportUrl);
        if (!response.ok) {
          return res.status(400).json({ error: 'Failed to fetch Google Slides content. Make sure the presentation is public.' });
        }
        const text = await response.text();
        // Split into slides by double newlines
        const slides = text.split(/\n\n+/).map(s => s.trim()).filter(Boolean);
        const pitch = slides[0] || '';
        return res.status(200).json({ slides, pitch, source: 'googleSlides' });
      } catch (err) {
        return res.status(500).json({ error: 'Failed to process Google Slides', details: err instanceof Error ? err.message : String(err) });
      }
    }

    // Handle file uploads (PDF, PPT, PPTX)
    if (!file) {
      console.warn('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Get file info
    const fileObj = Array.isArray(file) ? file[0] : file;
    const originalFilename = fileObj.originalFilename || 'unnamed.pdf';
    
    console.log('File received:', originalFilename);
    
    if (!originalFilename.toLowerCase().endsWith('.pdf') && !originalFilename.toLowerCase().endsWith('.ppt') && !originalFilename.toLowerCase().endsWith('.pptx')) {
      console.warn('Invalid file type, expected PDF, PPT, or PPTX');
      return res.status(400).json({ error: 'Only PDF, PPT, or PPTX files are allowed' });
    }
    
    try {
      // Read the file
      const fileBuffer = await promisify(fs.readFile)(fileObj.filepath);
      console.log('File read successfully, size:', fileBuffer.length);
      
      // Parse file type
      if (originalFilename.toLowerCase().endsWith('.pdf')) {
        // PDF: use pdf-parse
        try {
          const pdfParse = (await import('pdf-parse')).default;
          const data = await pdfParse(fileBuffer);
          // Split text into slides by double newlines or form feed
          const slides = data.text.split(/\n\n+|\f/).map(s => s.trim()).filter(Boolean);
          const pitch = slides[0] || '';
          await promisify(fs.unlink)(fileObj.filepath);
          return res.status(200).json({ slides, pitch, source: 'pdf' });
        } catch (err) {
          return res.status(500).json({ error: 'Failed to process PDF', details: err instanceof Error ? err.message : String(err) });
        }
      } else if (originalFilename.toLowerCase().endsWith('.pptx') || originalFilename.toLowerCase().endsWith('.ppt')) {
        // PPTX: use pptx-parser
        try {
          const pptxParser = (await import('pptx-parser')).default;
          const slidesRaw = await pptxParser(fileBuffer);
          // slidesRaw is an array of slide objects with text
          const slides = slidesRaw.map((slide: any) => slide.text || '').filter(Boolean);
          const pitch = slides[0] || '';
          await promisify(fs.unlink)(fileObj.filepath);
          return res.status(200).json({ slides, pitch, source: 'pptx' });
        } catch (err) {
          return res.status(500).json({ error: 'Failed to process PPTX', details: err instanceof Error ? err.message : String(err) });
        }
      }
      
      // Process the file as needed - here we're just logging the size
      // In a real app, you might save it to cloud storage, process it with a library, etc.
      
      // Generate a response with file info
      const response = {
        success: true,
        fileInfo: {
          name: originalFilename,
          size: fileBuffer.length,
          type: fileObj.mimetype || 'application/pdf'
        },
        message: 'File uploaded and processed successfully',
        summary: {
          deckPages: Math.max(1, Math.floor(fileBuffer.length / 50000)), // Rough estimate
          status: 'processed'
        }
      };
      
      // Clean up the temporary file
      try {
        await promisify(fs.unlink)(fileObj.filepath);
        console.log('Temporary file cleaned up successfully');
      } catch (cleanupError) {
        console.error('Error cleaning up temporary file:', cleanupError);
        // Continue despite cleanup error
      }
      
      // Return success response
      return res.status(200).json(response);
      
    } catch (fileError: any) {
      console.error('Error processing file:', fileError);
      
      // Try to clean up file even if there was an error
      try {
        if (fileObj.filepath && fs.existsSync(fileObj.filepath)) {
          await promisify(fs.unlink)(fileObj.filepath);
          console.log('Cleaned up temporary file after error');
        }
      } catch (cleanupError) {
        console.error('Error in cleanup after file error:', cleanupError);
      }
      
      await reportError({
        error: fileError,
        action: 'api_upload_deck_file_processing',
        userInput: {
          fileName: originalFilename
        }
      });
      
      return res.status(500).json({ 
        error: 'Failed to process the file',
        details: fileError.message
      });
    }
  } catch (error: any) {
    console.error("Error in /api/upload/deck:", error);
    
    await reportError({
      error,
      action: 'api_upload_deck_global_error'
    });
    
    return res.status(500).json({ 
      error: 'Server error', 
      details: error.message 
    });
  }
} 
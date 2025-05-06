import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
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
    // Configure formidable
    const form = new formidable.IncomingForm({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      filter: (part) => {
        return part.mimetype === 'application/pdf'; // Only accept PDF files
      }
    });
    
    console.log('Parsing form data');
    
    // Parse the form using a Promise wrapper
    const { fields, files } = await new Promise<{ fields: formidable.Fields<string>; files: formidable.Files<string> }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
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
    
    if (!file) {
      console.warn('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Get file info
    const fileObj = Array.isArray(file) ? file[0] : file;
    const originalFilename = fileObj.originalFilename || 'unnamed.pdf';
    
    console.log('File received:', originalFilename);
    
    if (!originalFilename.toLowerCase().endsWith('.pdf')) {
      console.warn('Invalid file type, expected PDF');
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }
    
    try {
      // Read the file
      const fileBuffer = await promisify(fs.readFile)(fileObj.filepath);
      console.log('File read successfully, size:', fileBuffer.length);
      
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
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { promisify } from 'util';
import axios from 'axios';
import { reportError } from '../../../utils/errorReporter';

// חשוב: זה מבטל את הברירת המחדל של next.js לטפל ב-body כ-JSON
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Top-level try-catch for handling any unexpected errors
  try {
    console.log('Deck upload API called');
    
    if (req.method !== 'POST') {
      console.log('Method not allowed:', req.method);
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      // ניתוח הטופס ושמירת הקובץ באופן זמני
      const form = new formidable.IncomingForm();
      console.log('Parsing form data');
      
      form.parse(req, async (err: Error | null, fields: formidable.Fields<string>, files: formidable.Files<string>) => {
        if (err) {
          console.error('Error parsing form:', err);
          await reportError({
            error: err,
            action: 'api_upload_deck_parse_form',
          });
          return res.status(500).json({ error: 'Failed to process the form' });
        }

        try {
          const file = files.file;
          const pitchText = fields.pitchText;
          
          if (!file) {
            console.warn('No file uploaded');
            return res.status(400).json({ error: 'No file uploaded' });
          }
          
          console.log('File received:', 
            Array.isArray(file) ? 
              (file as formidable.File[])[0].originalFilename : 
              (file as formidable.File).originalFilename);

          // Create a FormData object to send to our backend
          const formData = new FormData();
          
          // Add the pitch text
          if (pitchText) {
            console.log('Pitch text length:', pitchText.toString().length);
            formData.append('pitchText', pitchText.toString());
          } else {
            console.warn('No pitch text provided');
          }
          
          try {
            // Add the file
            // For files, we need to read from the path and append the buffer with the right filename
            const fileObj = Array.isArray(file) ? file[0] : file;
            console.log('Reading file from path:', fileObj.filepath);
            
            const fileBuffer = await promisify(fs.readFile)(fileObj.filepath);
            console.log('File read successfully, size:', fileBuffer.length);
            
            const blob = new Blob([fileBuffer], { type: fileObj.mimetype || 'application/octet-stream' });
            formData.append('file', blob, fileObj.originalFilename || 'uploaded-file.pdf');

            // בסביבת פיתוח שלח לשרת המקומי, אחרת השתמש באפליקציית שרת מאוחסנת
            const apiUrl = process.env.NODE_ENV === 'development' 
              ? 'http://localhost:5001/api/upload/deck'
              : 'https://synthetic-research-api.onrender.com/api/upload/deck';
            
            console.log('Sending request to backend:', apiUrl);
            
            const response = await axios.post(apiUrl, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
            
            console.log('Backend response received, status:', response.status);

            // Clean up temporary file
            try {
              console.log('Cleaning up temporary file:', fileObj.filepath);
              await promisify(fs.unlink)(fileObj.filepath);
              console.log('Temporary file cleaned up successfully');
            } catch (cleanupError) {
              console.error('Error cleaning up temporary file:', cleanupError);
              // Continue despite cleanup error
            }

            return res.status(200).json(response.data);
          } catch (fileError: any) {
            console.error('Error processing file:', fileError);
            console.error('File error details:', fileError.message);
            
            // Try to clean up file even if there was an error
            try {
              const fileObj = Array.isArray(file) ? file[0] : file;
              if (fileObj && fileObj.filepath && fs.existsSync(fileObj.filepath)) {
                await promisify(fs.unlink)(fileObj.filepath);
                console.log('Cleaned up temporary file after error');
              }
            } catch (cleanupError) {
              console.error('Error in cleanup after file error:', cleanupError);
            }
            
            throw fileError; // Re-throw to be caught by the outer catch
          }
        } catch (error: any) {
          console.error('Error in form processing:', error);
          console.error('Error stack:', error.stack);
          
          await reportError({
            error: error,
            action: 'api_upload_deck_backend_request',
            userInput: {
              hasFile: !!files.file,
              hasPitchText: !!fields.pitchText
            }
          });
          
          return res.status(500).json({ 
            error: 'Failed to process the request',
            details: error.message 
          });
        }
      });
    } catch (parseError: any) {
      console.error('Error in form parsing setup:', parseError);
      console.error('Parse error stack:', parseError.stack);
      
      await reportError({
        error: parseError,
        action: 'api_upload_deck_handler',
      });
      
      return res.status(500).json({ 
        error: 'Failed to handle upload',
        details: parseError.message
      });
    }
  } catch (globalError: any) {
    // Final catch-all error handler
    console.error('Deck upload error (global):', globalError);
    console.error('Global error stack:', globalError.stack);
    
    try {
      await reportError({
        error: globalError,
        action: 'api_upload_deck_global_error',
      });
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
    
    // Ensure we always send a response even if something goes catastrophically wrong
    return res.status(500).json({ error: 'Internal server error' });
  }
} 
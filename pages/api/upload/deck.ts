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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // ניתוח הטופס ושמירת הקובץ באופן זמני
    const form = new formidable.IncomingForm();
    
    form.parse(req, async (err: Error | null, fields: formidable.Fields<string>, files: formidable.Files<string>) => {
      if (err) {
        await reportError({
          error: err,
          action: 'api_upload_deck_parse_form',
        });
        console.error('Error parsing form:', err);
        return res.status(500).json({ error: 'Failed to process the form' });
      }

      try {
        const file = files.file;
        const pitchText = fields.pitchText;
        
        if (!file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        // Create a FormData object to send to our backend
        const formData = new FormData();
        
        // Add the pitch text
        if (pitchText) {
          formData.append('pitchText', pitchText.toString());
        }
        
        // Add the file
        // For files, we need to read from the path and append the buffer with the right filename
        const fileObj = Array.isArray(file) ? file[0] : file;
        const fileBuffer = await promisify(fs.readFile)(fileObj.filepath);
        const blob = new Blob([fileBuffer], { type: fileObj.mimetype || 'application/octet-stream' });
        formData.append('file', blob, fileObj.originalFilename || 'uploaded-file.pdf');

        // בסביבת פיתוח שלח לשרת המקומי, אחרת השתמש ב-API הפנימי
        const apiUrl = process.env.NODE_ENV === 'development' 
          ? 'http://localhost:5001/api/upload/deck'
          : 'http://localhost:5001/api/upload/deck'; // בסביבת ייצור, צריך להשתמש בכתובת השרת האמיתית

        const response = await axios.post(apiUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Clean up temporary file
        await promisify(fs.unlink)(fileObj.filepath);

        return res.status(200).json(response.data);
      } catch (error: any) {
        await reportError({
          error: error,
          action: 'api_upload_deck_backend_request',
          userInput: {
            hasFile: !!files.file,
            hasPitchText: !!fields.pitchText
          }
        });
        
        console.error('Error processing request:', error);
        return res.status(500).json({ 
          error: 'Failed to process the request',
          details: error.message 
        });
      }
    });
  } catch (error: any) {
    await reportError({
      error: error,
      action: 'api_upload_deck_handler',
    });
    
    console.error('Error handling request:', error);
    return res.status(500).json({ 
      error: 'Failed to handle request',
      details: error.message 
    });
  }
} 
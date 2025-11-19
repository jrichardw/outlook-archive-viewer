import { parseMSGFile, isMSGFile } from '../utils/msg.parser.js';
import fs from 'fs/promises';

/**
 * Upload and parse MSG file
 */
export async function uploadMSG(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;

    // Read file buffer
    const fileBuffer = await fs.readFile(filePath);

    // Validate MSG file
    if (!isMSGFile(fileBuffer)) {
      // Clean up uploaded file
      await fs.unlink(filePath);
      return res.status(400).json({ error: 'Invalid MSG file format' });
    }

    // Parse MSG file
    const email = parseMSGFile(fileBuffer);

    // Clean up uploaded file after parsing
    await fs.unlink(filePath);

    res.json({
      success: true,
      email
    });
  } catch (error) {
    console.error('Error uploading MSG file:', error);

    // Clean up file if it exists
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    res.status(500).json({
      error: error.message || 'Failed to process MSG file'
    });
  }
}

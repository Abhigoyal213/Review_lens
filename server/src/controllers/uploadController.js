/**
 * uploadController.js - Handles CSV File Upload Requests
 * 
 * Receives the uploaded CSV file from Multer, invokes the parser,
 * verifies the columns, and returns the parsed record count and sample data.
 */

import { parseCSV } from '../utils/csvParser.js';

/**
 * POST /api/reviews/upload
 * Accepts a CSV file via multipart/form-data under the field name 'file'
 */
export const handleCSVUpload = async (req, res, next) => {
  try {
    // 1. Verify that a file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Please upload a CSV file with field name "file".',
      });
    }

    // 2. Parse the CSV file buffer
    const records = parseCSV(req.file.buffer);

    // 3. Return upload summary and initial preview
    return res.status(200).json({
      success: true,
      message: `Successfully parsed ${records.length} review rows from ${req.file.originalname}.`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      totalRows: records.length,
      preview: records.slice(0, 3), // Show first 3 rows as preview
      records,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

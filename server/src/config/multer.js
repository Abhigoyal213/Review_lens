/**
 * multer.js - File Upload Configuration
 * 
 * Configures Multer to accept CSV file uploads into memory as a Buffer.
 * Memory storage is ideal for review CSVs since we parse the text immediately
 * without leaving temporary files cluttering the server disk.
 */

import multer from 'multer';
import path from 'path';

// Store files in memory buffer
const storage = multer.memoryStorage();

// Validate that the uploaded file is indeed a CSV
const fileFilter = (req, file, cb) => {
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const allowedMimeTypes = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];

  if (fileExtension === '.csv' || allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only .csv files are supported.'), false);
  }
};

// Configure Multer with 5MB file size limit
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Megabytes
  },
});

export default upload;

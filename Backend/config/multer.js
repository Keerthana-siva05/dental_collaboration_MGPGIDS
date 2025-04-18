import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert the URL to a directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage settings
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `students-${uniqueSuffix}${ext}`);
  }
});

// File filter to allow only Excel files
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel' // .xls
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only Excel files are allowed.'), false);
  }
};

// Configure multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only one file per request
  }
});

// Middleware to handle upload errors
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    return res.status(400).json({
      message: err.code === 'LIMIT_FILE_SIZE' 
        ? 'File too large (max 5MB)' 
        : 'File upload error'
    });
  } else if (err) {
    // Other errors (like our fileFilter error)
    return res.status(400).json({ message: err.message });
  }
  next();
};

export { upload, handleUploadErrors };
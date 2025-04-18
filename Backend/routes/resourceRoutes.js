import express from 'express';
import multer from 'multer';
import Resource from '../models/resourceModel.js';
import path from 'path';
import fs from 'fs';
import { protectFaculty } from '../middleware/authMiddleware.js';



const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'resources');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'video/mp4',
    'video/webm',
    'video/ogg'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only documents and videos are allowed.'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});

// Upload resource
router.post('/', protectFaculty, upload.single('file'), async (req, res) => {
  try {
    // Validate required fields
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { title, description, fileType, courseType, academicYear } = req.body;
    
    if (!title || !fileType || !courseType || !academicYear) {
      // Clean up uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate academic year
    const year = parseInt(academicYear);
    if (isNaN(year) || year < 1 || year > 4) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Invalid academic year (must be 1-4)'
      });
    }

    // Create new resource
    const resource = new Resource({
      title,
      description: description || '',
      fileType,
      courseType,
      academicYear: year,
      filePath: req.file.path.replace(/\\/g, '/'), // Ensure forward slashes
      originalFileName: req.file.originalname,
      fileSize: req.file.size,
      uploadedBy: req.faculty._id
    });

    await resource.save();

    res.status(201).json({
      success: true,
      message: 'Resource uploaded successfully',
      data: resource
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up file if error occurred
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading resource',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
router.get('/', async (req, res) => {
    try {
      const resources = await Resource.find().sort({ createdAt: -1 });
      res.json({
        success: true,
        count: resources.length,
        data: resources
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching resources'
      });
    }
  });
export { router as default };
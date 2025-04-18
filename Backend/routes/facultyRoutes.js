import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { 
  registerFaculty, 
  loginFaculty, 
  getLoggedInFaculty, 
  getProfile,
  updateProfile,
  getAllFaculty,
  uploadProfileImage 
} from '../controllers/facultyController.js';
import { protectFaculty } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'faculty-' + req.faculty._id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Initialize multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});
// Auth routes
router.post('/register', registerFaculty);
router.post('/login', loginFaculty);

// Protected routes
router.get('/me', protectFaculty, getLoggedInFaculty);
router.route('/profile')
  .get(protectFaculty, getProfile)
  .put(protectFaculty, updateProfile);

router.get('/', getAllFaculty);
router.post(
    '/upload-image',
    protectFaculty,
    upload.single('profileImage'),
    (err, req, res, next) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({ success: false, message: err.message });
        }
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    },
    uploadProfileImage
  );


export default router;
import express from 'express';
import Student from '../models/Student.js';
import { uploadStudents, registerStudent, loginStudent, resetStudentPassword, getLoggedInStudent  } from '../controllers/studentController.js';
import { protectStudent } from '../middleware/authMiddleware.js';
import { upload, handleUploadErrors } from '../config/multer.js';

const router = express.Router();



router.post('/login', loginStudent);
router.post('/reset-password', resetStudentPassword);
router.get('/me', protectStudent, getLoggedInStudent);

router.get('/', async (req, res) => {
  const { course, startYear, endYear } = req.query;

  try {
    const students = await Student.find({
      course,
      'batch.startYear': Number(startYear),
      'batch.endYear': Number(endYear)
    }).select('registerNo name email validity status');

    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch students' });
  }
});


//Register single student
router.post('/register', 
    registerStudent);


// Upload students from Excel
router.post('/upload', 
  upload.single('file'),
  handleUploadErrors,
  uploadStudents
);


export default router;
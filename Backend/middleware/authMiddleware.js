import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';

const JWT_SECRET = '2e3f4b8c9f1e4f8c9a3e0b5a8d2c7e1f9a6b4d3f8a7e6c9b0d1f2e3c4a5b6c7d'; // Use process.env.JWT_SECRET in real apps

export const protectStudent = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      // Fetch student without password
      req.student = await Student.findById(decoded.id).select('-password');
      if (!req.student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      next();

    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }
};

export const protectFaculty = async (req, res, next) => {
    let token;
  
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      try {
        token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
  
        // Fetch student without password
        req.faculty = await Faculty.findById(decoded.id).select('-password');
        if (!req.faculty) {
          return res.status(404).json({ message: 'Faculty not found' });
        }
  
        next();
  
      } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
    } else {
      return res.status(401).json({ message: 'Not authorized, token missing' });
    }
  };

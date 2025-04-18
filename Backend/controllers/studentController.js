import { processStudentExcel } from '../services/excelService.js';
import Student from '../models/Student.js';
import fs from 'fs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const registerStudent = async (req, res) => {
    try {
        // Validate request body
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Invalid request format'
            });
        }

        const { registerNo, name, email, course, batch, endYear } = req.body;

        // Validate required fields
        const requiredFields = ['registerNo', 'name', 'email', 'course', 'batch'];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                missingFields
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format',
                field: 'email'
            });
        }

        // Check for existing student
        const existingStudent = await Student.findOne({
            $or: [{ registerNo }, { email }]
        });

        if (existingStudent) {
            return res.status(409).json({
                success: false,
                message: existingStudent.registerNo === registerNo
                    ? 'Register number already exists'
                    : 'Email already exists',
                field: existingStudent.registerNo === registerNo ? 'registerNo' : 'email'
            });
        }

        // Hash password (using registerNo as default password)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(registerNo, saltRounds);

        // Create new student
        const student = new Student({
            registerNo,
            name,
            email,
            password: hashedPassword,
            course,
            batch,
            validity: new Date(endYear, 6, 1)
            // validity and status will be set automatically by schema
        });

        await student.save();

        // Prepare response data
        const responseData = {
            _id: student._id,
            registerNo: student.registerNo,
            name: student.name,
            email: student.email,
            course: student.course,
            batch: student.batch,
            status: student.status,
            validity: student.validity
        };

        return res.status(201).json({
            success: true,
            message: 'Student registered successfully',
            data: responseData
        });

    } catch (error) {
        console.error('Registration Error:', error);

        // Handle specific error types
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));

            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Duplicate key error',
                field: Object.keys(error.keyPattern)[0]
            });
        }

        // Generic error response
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


export const uploadStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { course, startYear, endYear } = req.body;
    
    if (!course || !startYear || !endYear) {
      return res.status(400).json({ message: 'Missing batch information' });
    }

    const results = await processStudentExcel(
      req.file.path,
      course,
      parseInt(startYear),
      parseInt(endYear)
    );

    if (results.errors.length > 0) {
        return res.status(207).json({
          message: results.duplicates > 0
            ? `Found ${results.duplicates} duplicate register numbers`
            : 'Validation errors found',
          successCount: results.success,
          errorCount: results.errors.length,
          duplicates: results.duplicates,
          errors: results.errors.slice(0, 10) // Limit to first 10 errors
        });
      }

    res.status(201).json({
      message: `Successfully uploaded ${results.success} students`,
      batch: `${course}-${startYear}-${endYear}`,
    });


  } catch (error) {if (error.code === 11000) {
      return res.status(400).json({
        message: 'Duplicate register number detected',
        field: error.keyValue
      });
    }
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error during upload' });
  } finally {
    // Clean up the uploaded file
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error cleaning up file:', err);
      });
    }
  }
};

const JWT_SECRET = '2e3f4b8c9f1e4f8c9a3e0b5a8d2c7e1f9a6b4d3f8a7e6c9b0d1f2e3c4a5b6c7d'; // Move to .env in production
const JWT_EXPIRES_IN = '7d';

export const loginStudent = async (req, res) => {
  const { registerNo, password } = req.body;

  try {
    const student = await Student.findOne({ registerNo }).select('+password');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }


    const isPasswordCorrect = await bcrypt.compare(password, student.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const needsPasswordReset = await student.isDefaultPassword();

    const token = jwt.sign(
      { id: student._id, registerNo: student.registerNo },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      needsPasswordReset
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const resetStudentPassword = async (req, res) => {
  const { registerNo, newPassword } = req.body;

  try {
    const student = await Student.findOne({ registerNo });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    student.password = hashedPassword; // Triggers pre-save hashing
    await student.save();

    res.status(200).json({ message: 'Password updated successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getLoggedInStudent = async (req, res) => {
  res.status(200).json(req.student);
};



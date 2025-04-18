import Faculty from '../models/Faculty.js';
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const registerFaculty = async (req, res) => {
  try {
    const { name, email, designation, password, role = 'faculty' } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!email) missingFields.push('email');
    if (!designation) missingFields.push('designation');
    if (!password) missingFields.push('password');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields
      });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
        field: 'email'
      });
    }

    // Validate password strength
    if (!validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    })) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      });
    }

    // Check if faculty exists
    const existingFaculty = await Faculty.findOne({ email });
    if (existingFaculty) {
      return res.status(409).json({
        success: false,
        message: 'Faculty with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create faculty
    const faculty = await Faculty.create({
      name,
      email,
      designation,
      password: hashedPassword,
      role
    });

    // // Generate JWT token
    // const token = jwt.sign(
    //   { id: faculty._id, role: faculty.role },
    //   process.env.JWT_SECRET,
    //   { expiresIn: process.env.JWT_EXPIRE || '8h' }
    // );

    // Prepare response data
    const facultyData = {
      _id: faculty._id,
      name: faculty.name,
      email: faculty.email,
      designation: faculty.designation,
      role: faculty.role,
      createdAt: faculty.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'Faculty registered successfully',
      faculty: facultyData
    });

  } catch (error) {
    console.error('Registration error:', error);
    
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
        message: 'Email already exists',
        field: 'email'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const JWT_SECRET = '2e3f4b8c9f1e4f8c9a3e0b5a8d2c7e1f9a6b4d3f8a7e6c9b0d1f2e3c4a5b6c7d'; // Move to .env in production
const JWT_EXPIRES_IN = '7d';

export const loginFaculty = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if user exists
    const faculty = await Faculty.findOne({ email }).select('+password');
    if (!faculty) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 2. Check password
    const isMatch = await bcrypt.compare(password, faculty.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
          { id: faculty._id},
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );
    
    // 3. Generate token
    // const token = generateToken(faculty._id);

    // 4. Return response (omit password)
    res.status(200).json({
      message: 'Login successful',
      token,
      faculty: {
        _id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        designation: faculty.designation,
        role: faculty.role
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const getLoggedInFaculty = async (req, res) => {
  res.status(200).json(req.faculty);
};


export const getProfile = async (req, res) => {
  try {
    // Since protectFaculty middleware already fetches the faculty
    const faculty = req.faculty.toObject(); // Convert Mongoose document to plain object
    delete faculty.password; // Remove password if it exists
    
    res.status(200).json({
      success: true,
      data: {
        _id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        designation: faculty.designation,
        department: faculty.department,
        contactNumber: faculty.contactNo, // Note the schema uses contactNo
        profileImage: faculty.profileImage
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, department, designation, contactNumber } = req.body;
    
    const updatedFaculty = await Faculty.findByIdAndUpdate(
      req.faculty._id,
      { 
        name, 
        department, 
        designation, 
        contactNo: contactNumber, // Map to contactNo in schema
        updatedAt: Date.now() 
      },
      { 
        new: true,
        runValidators: true 
      }
    ).select('-password');

    if (!updatedFaculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: updatedFaculty._id,
        name: updatedFaculty.name,
        email: updatedFaculty.email,
        designation: updatedFaculty.designation,
        department: updatedFaculty.department,
        contactNumber: updatedFaculty.contactNo,
        profileImage: updatedFaculty.profileImage
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// Upload Profile Image
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const imagePath = '/uploads/' + req.file.filename;
    
    const updatedFaculty = await Faculty.findByIdAndUpdate(
      req.faculty._id,
      { profileImage: imagePath },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      profileImage: updatedFaculty.profileImage
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Image upload failed',
      error: error.message
    });
  }
};


export const getAllFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.find({}).select('-password -activities -role -email -createdAt -updatedAt');
    
    res.status(200).json({
      success: true,
      data: faculty.map(f => ({
        _id: f._id,
        name: f.name,
        designation: f.designation,
        contactNumber: f.contactNo || '',
        profileImage: f.profileImage || '',
        department: f.department || ''
      }))
    });
  } catch (error) {
    console.error('Error fetching faculty:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch faculty data'
    });
  }
};
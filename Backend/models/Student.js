import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const studentSchema = new mongoose.Schema({
  registerNo: {
    type: String,
    required: [true, 'Register number is required'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  dob: {
    type: Date,
    default: '2000-01-01'
  },
  course: {
    type: String,
    enum: ['BDS', 'MDS'],
    required: true
  },
  batch: {
    startYear: {
      type: Number,
      required: true
    },
    endYear: {
      type: Number,
      required: true
    }
  },
  validity: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date
}, { timestamps: true });

// Hash password before saving
// studentSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
  
//   this.password = await bcrypt.hash(this.password, 12);
//   this.passwordChangedAt = Date.now() - 1000; // Ensure token is created after password change
//   next();
// });

// Check if password is still default (registerNo)
studentSchema.methods.isDefaultPassword = async function() {
  return await bcrypt.compare(this.registerNo, this.password);
};


const Student = mongoose.model('Student', studentSchema);
export default Student;
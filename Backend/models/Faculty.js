import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const facultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  designation: {
    type: String,
    required: [true, 'Designation is required'],
    trim: true,
    enum: {
      values: ['Head of the Department', 'Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Researcher'],
      message: 'Invalid designation'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Never return password in queries
  },
  role: {
    type: String,
    default: 'faculty',
    enum: ['faculty', 'admin', 'hod'], // Example roles
    immutable: true // Role shouldn't be changed after creation
  },
  activities: [{
    type: String,
    trim: true
  }],
  contactNo: {
    type: String,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number'],
    default: ''
  },
  profileImage: {
    type: String,
    default: '', // optional
  },
  department: { type: String },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
// facultySchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
  
//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// Update timestamp on save
facultySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to compare passwords
facultySchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for formatted faculty info
facultySchema.virtual('displayInfo').get(function() {
  return `${this.name} (${this.designation})`;
});

const Faculty = mongoose.model('Faculty', facultySchema);

export default Faculty;
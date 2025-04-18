import mongoose from 'mongoose';
import Student from './models/Student.js'; // Adjust path as needed

// Connect to MongoDB
await mongoose.connect('mongodb://127.0.0.1:27017/dental-clinic');

// OPTION A: Delete invalid records
await Student.deleteMany({ 
  $or: [
    { registerNo: null }, 
    { registerNo: { $exists: false } }
  ] 
});

// OPTION B: Fix invalid records (recommended)
await Student.updateMany(
  { $or: [{ registerNo: null }, { registerNo: { $exists: false } }]},
  { $set: { registerNo: `TEMP-${Date.now()}-${Math.random().toString(36).substring(2, 8)}` } }
);

console.log("Cleanup complete!");
process.exit(0);
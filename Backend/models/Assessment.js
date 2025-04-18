import mongoose from "mongoose";

const AssessmentSchema = new mongoose.Schema({
  registerNo: { 
    type: String, 
    required: true,
    ref: 'Student'
  },
  name: { type: String, required: true },
  currentYear: { type: String, required: true },
  course: { 
    type: String, 
    required: true,
    enum: ['BDS', 'MDS'] 
  },
  batch: { type: String, required: true }, // Stored as string "YYYY-YYYY"
  assessmentType: { 
    type: String, 
    required: true,
    enum: ['Assessment I', 'Assessment II'] 
  },
  theory70: { type: Number, min: 0, max: 70, default: 0 },
  theory20: { type: Number, min: 0, max: 20, default: 0 },
  theory10: { type: Number, min: 0, max: 10, default: 0 },
  totalTheory: { type: Number, min: 0, max: 100, default: 0 },
  practical90: { type: Number, min: 0, max: 90, default: 0 },
  practical10: { type: Number, min: 0, max: 10, default: 0 },
  totalPractical: { type: Number, min: 0, max: 100, default: 0 }
}, { timestamps: true });

// Add compound index for uniqueness
AssessmentSchema.index({ registerNo: 1, assessmentType: 1 }, { unique: true });

export default mongoose.model("Assessment", AssessmentSchema);
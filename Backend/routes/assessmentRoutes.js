import express from "express";
import Student from "../models/Student.js";
import Assessment from "../models/Assessment.js";


const router = express.Router();


const getCurrentYear = (batch) => {
  if (!batch) return "";
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const batchStartYear = parseInt(batch.split("-")[0]);
  const academicYear = currentMonth < 7 ? currentYear - 1 : currentYear;
  const year = academicYear - batchStartYear + 1;

  if (year < 1) return "Not Started";
  if (year > 5) return "Graduated";

  const suffixes = ["th", "st", "nd", "rd"];
  const suffix = year % 100 > 10 && year % 100 < 14 ? "th" : suffixes[year % 10] || "th";
  return `${year}${suffix}`;
};

// Get students with their assessment data
router.get("/students", async (req, res) => {
  try {
    const { course, batch } = req.query;
    
    if (!course || !batch) {
      return res.status(400).json({ 
        success: false,
        message: "Course and batch are required" 
      });
    }

    if (!/^\d{4}-\d{4}$/.test(batch)) {
      return res.status(400).json({ 
        success: false,
        message: "Batch must be in YYYY-YYYY format" 
      });
    }

    const [startYear, endYear] = batch.split('-').map(Number);
    const students = await Student.find({ 
      course: course.toUpperCase(),
      'batch.startYear': startYear,
      'batch.endYear': endYear
    }).select('registerNo name course batch -_id');

    if (!students || students.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "No students found" 
      });
    }

    res.status(200).json({
      success: true,
      data: students.map(student => ({
        registerNo: student.registerNo,
        name: student.name,
        course: student.course,
        batch: `${student.batch.startYear}-${student.batch.endYear}`
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error fetching students",
      error: error.message 
    });
  }
});

// Get assessment data
router.get("/", async (req, res) => {
  try {
    const { course, batch, assessmentType } = req.query;
    
    if (!course || !batch || !assessmentType) {
      return res.status(400).json({ 
        success: false,
        message: "Course, batch and assessmentType are required" 
      });
    }

    // First get all students for this course and batch
    const [startYear, endYear] = batch.split('-').map(Number);
    const students = await Student.find({ 
      course: course.toUpperCase(),
      'batch.startYear': startYear,
      'batch.endYear': endYear
    }).select('registerNo name course batch -_id');

    if (!students || students.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "No students found" 
      });
    }

    // Get assessment data for these students
    const assessments = await Assessment.find({
      registerNo: { $in: students.map(s => s.registerNo) },
      assessmentType
    });

    // Combine student and assessment data
    const studentData = students.map(student => {
      const assessment = assessments.find(a => a.registerNo === student.registerNo);
      return {
        registerNo: student.registerNo,
        name: student.name,
        currentYear: getCurrentYear(`${student.batch.startYear}-${student.batch.endYear}`),
        assessmentType: assessment?.assessmentType || assessmentType,
        theory70: assessment?.theory70 || "",
        theory20: assessment?.theory20 || "",
        theory10: assessment?.theory10 || "",
        totalTheory: assessment?.totalTheory || "",
        practical90: assessment?.practical90 || "",
        practical10: assessment?.practical10 || "",
        totalPractical: assessment?.totalPractical || ""
      };
    });

    res.status(200).json({
      success: true,
      data: studentData
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error fetching assessments",
      error: error.message 
    });
  }
});

// Save assessment data
router.post("/save-all", async (req, res) => {
  try {
    const { course, batch, assessmentType, students } = req.body;
    
    if (!course || !batch || !assessmentType || !students || !students.length) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters"
      });
    }

    const savedAssessments = await Promise.all(students.map(async (student) => {
      const totalTheory = (student.theory70 || 0) + (student.theory20 || 0) + (student.theory10 || 0);
      const totalPractical = (student.practical90 || 0) + (student.practical10 || 0);

      return Assessment.findOneAndUpdate(
        { registerNo: student.registerNo, assessmentType },
        {
          registerNo: student.registerNo,
          name: student.name,
          currentYear: getCurrentYear(batch),
          course,
          batch,
          assessmentType,
          theory70: student.theory70 || 0,
          theory20: student.theory20 || 0,
          theory10: student.theory10 || 0,
          totalTheory,
          practical90: student.practical90 || 0,
          practical10: student.practical10 || 0,
          totalPractical
        },
        { new: true, upsert: true }
      );
    }));

    res.status(200).json({
      success: true,
      message: "Assessments saved successfully",
      count: savedAssessments.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error saving assessments",
      error: error.message
    });
  }
});

export default router;
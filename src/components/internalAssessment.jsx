import React, { useState, useEffect } from "react";
import axios from "axios";
import FacultySidebar from "../components/Sidebar/FacultySidebar";
import Header from './Home/Header';

const InternalAssessment = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [assessmentType, setAssessmentType] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const isValidBatch = (batch) => /^\d{4}-\d{4}$/.test(batch);

  const getCurrentYear = (batch) => {
    if (!isValidBatch(batch)) return "";
    const [startYear] = batch.split('-').map(Number);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const academicYear = currentMonth < 7 ? currentYear - 1 : currentYear;
    const year = academicYear - startYear + 1;

    if (year < 1) return "Not Started";
    if (year > 5) return "Graduated";

    const suffixes = ["th", "st", "nd", "rd"];
    const suffix = year % 100 > 10 && year % 100 < 14 ? "th" : suffixes[year % 10] || "th";
    return `${year}${suffix}`;
  };

  useEffect(() => {
    if (selectedCourse && isValidBatch(selectedBatch) && assessmentType) {
      fetchAssessmentData();
    }
  }, [selectedCourse, selectedBatch, assessmentType]);

  const fetchAssessmentData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("http://localhost:5000/api/assessment", {
        params: { 
          course: selectedCourse, 
          batch: selectedBatch, 
          assessmentType 
        }
      });

      if (response.data.success) {
        setStudents(response.data.data);
      } else {
        // If no assessment data, fetch student list
        await fetchStudentList();
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error fetching data");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentList = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/assessment/students", {
        params: { 
          course: selectedCourse, 
          batch: selectedBatch 
        }
      });

      if (response.data.success) {
        setStudents(response.data.data.map(student => ({
          registerNo: student.registerNo,
          name: student.name,
          currentYear: getCurrentYear(student.batch),
          assessmentType,
          theory70: "",
          theory20: "",
          theory10: "",
          totalTheory: "",
          practical90: "",
          practical10: "",
          totalPractical: ""
        })));
      } else {
        setError(response.data.message || "No students found");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error fetching students");
      console.error("Student fetch error:", error);
    }
  };

  const handleInputChange = (index, field, value) => {
    const updatedStudents = [...students];
    const numValue = value === "" ? "" : Number(value);
    
    // Validate max values
    const maxValues = {
      theory70: 70, theory20: 20, theory10: 10,
      practical90: 90, practical10: 10
    };
    
    if (numValue !== "" && maxValues[field] && numValue > maxValues[field]) {
      return;
    }
    
    updatedStudents[index][field] = numValue;
    
    // Recalculate totals
    updatedStudents[index].totalTheory = 
      (updatedStudents[index].theory70 || 0) + 
      (updatedStudents[index].theory20 || 0) + 
      (updatedStudents[index].theory10 || 0);
    
    updatedStudents[index].totalPractical = 
      (updatedStudents[index].practical90 || 0) + 
      (updatedStudents[index].practical10 || 0);
    
    setStudents(updatedStudents);
  };

  const saveAssessment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post("http://localhost:5000/api/assessment/save-all", {
        course: selectedCourse,
        batch: selectedBatch,
        assessmentType,
        students: students.map(student => ({
          registerNo: student.registerNo,
          name: student.name,
          theory70: student.theory70 || 0,
          theory20: student.theory20 || 0,
          theory10: student.theory10 || 0,
          practical90: student.practical90 || 0,
          practical10: student.practical10 || 0
        }))
      });

      setSuccess(response.data.message || "Assessments saved successfully");
    } catch (error) {
      setError(error.response?.data?.message || "Error saving assessments");
      console.error("Save error:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    const csvContent = [
      ["Course", "Batch", "Reg. No", "Name", "Year", "Assessment Type", 
       "Theory (70)", "Theory (20)", "Theory (10)", "Total Theory", 
       "Practical (90)", "Practical (10)", "Total Practical"],
      ...students.map(student => [
        selectedCourse,
        selectedBatch,
        student.registerNo,
        student.name,
        getCurrentYear(selectedBatch),
        assessmentType,
        student.theory70 || "",
        student.theory20 || "",
        student.theory10 || "",
        student.totalTheory || "",
        student.practical90 || "",
        student.practical10 || "",
        student.totalPractical || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assessment_${selectedCourse}_${selectedBatch}_${assessmentType}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-[1100px] mx-auto mt-28 bg-gray-100 p-8 rounded-lg shadow-lg border border-gray-300">
      <Header toggleSidebar={toggleSidebar} />
      <FacultySidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <h2 className="text-3xl font-bold text-center uppercase mb-6 mt-5">
              
        Internal Assessment Marks
      </h2>

      {/* Selection Controls */}
      <div className="flex justify-between items-center space-x-6 mb-6">
        <div className="flex-1">
          <label className="block font-semibold mb-1">Course:</label>
          <select 
            value={selectedCourse} 
            onChange={(e) => setSelectedCourse(e.target.value)} 
            className="w-full p-2 border rounded"
          >
            <option value="">Select Course</option>
            <option value="BDS">BDS</option>
            <option value="MDS">MDS</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block font-semibold mb-1">Batch:</label>
          <input
            list="batch-options"
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className={`w-full p-2 border rounded ${
              selectedBatch && !isValidBatch(selectedBatch) ? 'border-red-500' : ''
            }`}
            placeholder="Enter batch (e.g., 2021-2025)"
          />
          <datalist id="batch-options">
            <option value="2022-2026" />
            <option value="2021-2025" />
            <option value="2020-2024" />
          </datalist>
          {selectedBatch && !isValidBatch(selectedBatch) && (
            <p className="text-red-500 text-sm mt-1">
              Please use YYYY-YYYY format (e.g., 2021-2025)
            </p>
          )}
        </div>

        <div className="flex-1">
          <label className="block font-semibold mb-1">Assessment:</label>
          <select 
            value={assessmentType} 
            onChange={(e) => setAssessmentType(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Assessment</option>
            <option value="Assessment I">Internal Assessment I</option>
            <option value="Assessment II">Internal Assessment II</option>
          </select>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-center">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-center">
          {success}
        </div>
      )}

      {/* Students Table */}
      {students.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-blue-900 text-white text-xs">
                <tr>
                  <th className="py-3 px-4">Reg No</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Year</th>
                  <th className="py-3 px-4">Theory (70)</th>
                  <th className="py-3 px-4">Theory (20)</th>
                  <th className="py-3 px-4">Theory (10)</th>
                  <th className="py-3 px-4 bg-blue-700">Total Theory</th>
                  <th className="py-3 px-4">Practical (90)</th>
                  <th className="py-3 px-4">Practical (10)</th>
                  <th className="py-3 px-4 bg-blue-700">Total Practical</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={index} className="odd:bg-gray-100 even:bg-white hover:bg-blue-50 transition-all">
                    <td className="p-2">{student.registerNo}</td>
                    <td className="p-2">{student.name}</td>
                    <td className="p-2">{getCurrentYear(selectedBatch)}</td>
                    <td className="p-2">
                      <input 
                        type="number" 
                        min="0" 
                        max="70"
                        value={student.theory70 || ""} 
                        onChange={(e) => handleInputChange(index, "theory70", e.target.value)} 
                        className="w-full p-1 border rounded text-center" 
                      />
                    </td>
                    <td className="p-2">
                      <input 
                        type="number" 
                        min="0" 
                        max="20"
                        value={student.theory20 || ""} 
                        onChange={(e) => handleInputChange(index, "theory20", e.target.value)} 
                        className="w-full p-1 border rounded text-center" 
                      />
                    </td>
                    <td className="p-2">
                      <input 
                        type="number" 
                        min="0" 
                        max="10"
                        value={student.theory10 || ""} 
                        onChange={(e) => handleInputChange(index, "theory10", e.target.value)} 
                        className="w-full p-1 border rounded text-center" 
                      />
                    </td>
                    <td className="p-2 font-bold bg-blue-200 text-center">{student.totalTheory}</td>
                    <td className="p-2">
                      <input 
                        type="number" 
                        min="0" 
                        max="90"
                        value={student.practical90 || ""} 
                        onChange={(e) => handleInputChange(index, "practical90", e.target.value)} 
                        className="w-full p-1 border rounded text-center" 
                      />
                    </td>
                    <td className="p-2">
                      <input 
                        type="number" 
                        min="0" 
                        max="10"
                        value={student.practical10 || ""} 
                        onChange={(e) => handleInputChange(index, "practical10", e.target.value)} 
                        className="w-full p-1 border rounded text-center" 
                      />
                    </td>
                    <td className="p-2 font-bold bg-blue-200 text-center">{student.totalPractical}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center space-x-4 mt-6">
            <button 
              onClick={saveAssessment} 
              disabled={loading}
              className={`px-6 py-2 rounded text-white ${
                loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button 
              onClick={downloadCSV} 
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Download 
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default InternalAssessment;
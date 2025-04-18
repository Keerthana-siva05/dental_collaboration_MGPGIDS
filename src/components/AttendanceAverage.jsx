import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import FacultySidebar from "../components/Sidebar/FacultySidebar";
import Header from './Home/Header';

const AverageAttendance = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [course, setCourse] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [startMonth, setStartMonth] = useState(new Date().getMonth() + 1);
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [endMonth, setEndMonth] = useState(new Date().getMonth() + 1);
  const [endYear, setEndYear] = useState(new Date().getFullYear());
  const [averageData, setAverageData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Validate batch format (YYYY-YYYY)
  const isValidBatch = (batch) => {
    return /^\d{4}-\d{4}$/.test(batch);
  };

  // Check if all required fields are filled
  const isFormComplete = course && isValidBatch(selectedBatch);

  // Reset messages when inputs change
  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [course, selectedBatch, startMonth, startYear, endMonth, endYear]);

  const calculateAverage = async () => {
    if (!isFormComplete) {
      setError("Please select course and valid batch");
      return;
    }

    if (startYear > endYear || (startYear === endYear && startMonth > endMonth)) {
      setError("End date must be after start date");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get("http://localhost:5000/api/attendance/average", {
        params: { 
          course, 
          batch: selectedBatch, 
          startMonth, 
          endMonth, 
          startYear,
          endYear
        }
      });
      
      setAverageData(response.data);
      setSuccess("Averages calculated successfully");
    } catch (error) {
      setError(error.response?.data?.message || "Error calculating averages");
      console.error("Calculation error:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveAveragesToDB = async () => {
    if (!averageData.length) {
      setError("No data to save. Please calculate averages first.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post("http://localhost:5000/api/attendance/save-averages", {
        course,
        batch: selectedBatch,
        startMonth,
        endMonth,
        startYear,
        endYear,
        averages: averageData
      });
      
      setSuccess(response.data.message || "Averages saved successfully");
    } catch (error) {
      setError(error.response?.data?.message || "Error saving averages");
      console.error("Save error:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      averageData.map(student => ({
        "Register Number": student.regNumber,
        "Name": student.name,
        "Theory %": student.theoryPercentage,
        "Practical %": student.practicalPercentage,
        "Clinical %": student.clinicalPercentage,
        "Overall Average %": student.averageAttendance
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Average Attendance");
    XLSX.writeFile(
      workbook, 
      `Average_Attendance_${course}_${selectedBatch}_${startMonth}-${startYear}_to_${endMonth}-${endYear}.xlsx`
    );
  };

  // Generate year options (current year ± 2 years)
  const yearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  };

  return (
    <div className="w-[1100px] mx-auto mt-28 bg-gray-100 p-8 rounded-lg shadow-lg border border-gray-300">
      <Header toggleSidebar={toggleSidebar} />
      <FacultySidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <h2 className="text-center mb-6 mt-5 text-2xl font-bold uppercase text-gray-800">
        Average Attendance 
      </h2>

      <button 
        onClick={() => navigate("/attendance")}
        className="mb-6 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
      >
        Back to Attendance
      </button>

      <div className="flex justify-between items-center space-x-6 mb-6">
        <div className="flex-1">
          <label className="block font-semibold mb-1">Course:</label>
          <select 
            className="w-full p-2 border rounded" 
            value={course} 
            onChange={(e) => setCourse(e.target.value)}
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-3 text-center">Start Period</h3>
          <div className="mb-3">
            <label className="block font-medium mb-1">Month:</label>
            <select 
              className="w-full p-2 border rounded" 
              value={startMonth}
              onChange={(e) => setStartMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("en", { month: "long" })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Year:</label>
            <select
              className="w-full p-2 border rounded"
              value={startYear}
              onChange={(e) => setStartYear(Number(e.target.value))}
            >
              {yearOptions().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-3 text-center">End Period</h3>
          <div className="mb-3">
            <label className="block font-medium mb-1">Month:</label>
            <select 
              className="w-full p-2 border rounded" 
              value={endMonth}
              onChange={(e) => setEndMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("en", { month: "long" })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Year:</label>
            <select
              className="w-full p-2 border rounded"
              value={endYear}
              onChange={(e) => setEndYear(Number(e.target.value))}
            >
              {yearOptions().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Status messages */}
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

      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={calculateAverage}
          disabled={!isFormComplete || loading}
          className={`px-6 py-2 rounded text-white ${
            !isFormComplete || loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? "Calculating..." : "Calculate Average"}
        </button>

        {averageData.length > 0 && (
          <button
            onClick={saveAveragesToDB}
            disabled={loading}
            className={`px-6 py-2 rounded text-white ${
              loading ? 'bg-purple-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        )}
      </div>

      {averageData.length > 0 && (
        <>
          <div className="overflow-x-auto mb-6">
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-blue-900 text-white text-xs">
                <tr>
                  <th className="py-3 px-4">Reg No</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Theory %</th>
                  <th className="py-3 px-4">Practical %</th>
                  <th className="py-3 px-4">Clinical %</th>
                  <th className="py-3 px-4">Overall %</th>
                </tr>
              </thead>
              <tbody>
                {averageData.map((student) => (
                  <tr key={student.regNumber} className="odd:bg-gray-100 even:bg-white hover:bg-blue-50 transition-all">
                    <td className="p-2">{student.regNumber}</td>
                    <td className="p-2">{student.name}</td>
                    <td className="p-2 text-center">{student.theoryPercentage}%</td>
                    <td className="p-2 text-center">{student.practicalPercentage}%</td>
                    <td className="p-2 text-center">{student.clinicalPercentage}%</td>
                    <td className="p-2 text-center font-semibold">{student.averageAttendance}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center space-x-4">
            <button 
              onClick={downloadExcel}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Download Excel
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AverageAttendance;
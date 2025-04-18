import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import FacultySidebar from "../components/Sidebar/FacultySidebar";
import Header from './Home/Header';


const AttendanceForm = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [course, setCourse] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isSelectionComplete = course && selectedBatch && month;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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
 
  const isValidBatch = (batch) => {
    return /^\d{4}-\d{4}$/.test(batch);
  };

  useEffect(() => {
    if (!isSelectionComplete) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const attendanceRes = await axios.get("http://localhost:5000/api/attendance", {
          params: { course, batch: selectedBatch, month, year }
        });

        if (attendanceRes.data) {
          setAttendanceData(
            attendanceRes.data.students.map(student => ({
              regNumber: student.regNumber,
              name: student.name,
              currentYear: student.currentYear || getCurrentYear(selectedBatch),
              theoryTotal: student.theory?.total || "",
              theoryAttended: student.theory?.attended || "",
              practicalTotal: student.practical?.total || "",
              practicalAttended: student.practical?.attended || "",
              clinicalTotal: student.clinical?.total || "",
              clinicalAttended: student.clinical?.attended || ""
            }))
          );
        } else {
          await fetchStudentDetails();
        }
      } catch (error) {
        if (error.response?.status === 404) {
          await fetchStudentDetails();
        } else {
          setError("Error fetching attendance data");
          console.error("Fetch error:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [course, selectedBatch, month, year]);

  const fetchStudentDetails = async () => {
    if (!isValidBatch(selectedBatch)) {
      setError("Please enter batch in YYYY-YYYY format (e.g., 2021-2025)");
      setAttendanceData([]);
      return;
    }
  
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("http://localhost:5000/api/attendance/students", {
        params: { 
          course, 
          batch: selectedBatch 
        }
      });
  
      if (response.data.success) {
        setStudents(response.data.data);
        setAttendanceData(
          response.data.data.map(student => ({
            regNumber: student.regNumber,
            name: student.name,
            currentYear: getCurrentYear(selectedBatch),
            theoryTotal: "",
            theoryAttended: "",
            practicalTotal: "",
            practicalAttended: "",
            clinicalTotal: "",
            clinicalAttended: ""
          }))
        );
      } else {
        setError(response.data.message || "No students found for selected criteria");
        setAttendanceData([]);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch student details");
      console.error("Student fetch error:", error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (regNumber, field, value) => {
    setAttendanceData(prev =>
      prev.map(item =>
        item.regNumber === regNumber ? { ...item, [field]: value } : item
      )
    );
  };

  const autoFillTotalClasses = (field, value) => {
    setAttendanceData(prev =>
      prev.map(item => ({
        ...item,
        [field]: value !== "" ? Number(value) : ""
      }))
    );
  };

  const calculatePercentage = (attended, total) => {
    if (!attended || !total) return "0.00";
    return ((Number(attended) / Number(total)) * 100).toFixed(2);
  };

  const handleMonthChange = (e) => {
    setMonth(Number(e.target.value));
    setAttendanceData(prev =>
      prev.map(item => ({
        ...item,
        theoryTotal: "",
        theoryAttended: "",
        practicalTotal: "",
        practicalAttended: "",
        clinicalTotal: "",
        clinicalAttended: ""
      }))
    );
  };

  const saveToDatabase = async () => {
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/api/attendance/save", {
        course,
        batch: selectedBatch,
        month,
        year,
        currentYear: getCurrentYear(selectedBatch),
        students: attendanceData.map(student => ({
          regNumber: student.regNumber,
          name: student.name,
          currentYear: student.currentYear,
          theoryTotal: Number(student.theoryTotal) || 0,
          theoryAttended: Number(student.theoryAttended) || 0,
          practicalTotal: Number(student.practicalTotal) || 0,
          practicalAttended: Number(student.practicalAttended) || 0,
          clinicalTotal: Number(student.clinicalTotal) || 0,
          clinicalAttended: Number(student.clinicalAttended) || 0
        }))
      });
  
      // ✅ Modified success condition
      if (response.data.message) {
        alert(response.data.message); // Shows "Attendance saved successfully!" or "Attendance updated successfully"
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save attendance");
      console.error("Save error:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      attendanceData.map(student => ({
        "Register Number": student.regNumber,
        Name: student.name,
        Year: student.currentYear,
        "Theory Total": student.theoryTotal,
        "Theory Attended": student.theoryAttended,
        "Theory %": calculatePercentage(student.theoryAttended, student.theoryTotal),
        "Clinical Total": student.clinicalTotal,
        "Clinical Attended": student.clinicalAttended,
        "Clinical %": calculatePercentage(student.clinicalAttended, student.clinicalTotal),
        "Practical Total": student.practicalTotal,
        "Practical Attended": student.practicalAttended,
        "Practical %": calculatePercentage(student.practicalAttended, student.practicalTotal)
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, `Attendance_${course}_${selectedBatch}_${month}_${year}.xlsx`);
  };

  return (
    <div className="w-[1100px] mx-auto mt-28 bg-gray-100 p-8 rounded-lg shadow-lg border border-gray-300">
        <Header toggleSidebar={toggleSidebar} />
        <FacultySidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <h2 className="text-center mb-6 mt-5 text-2xl font-bold uppercase text-gray-800">
        Students Attendance Entry
      </h2>

      <div className="flex justify-between items-center space-x-6 mb-6">
        <div className="flex-1">
          <label className="block font-semibold mb-1">Course:</label>
          <select className="w-full p-2 border rounded" onChange={(e) => setCourse(e.target.value)} value={course}>
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
    className={`p-2 border rounded w-full ${
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
          <label className="block font-semibold mb-1">Month:</label>
          <select className="w-full p-2 border rounded" onChange={handleMonthChange} value={month}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("en", { month: "long" })}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isSelectionComplete && (
        <>
          <div className="overflow-x-auto">
          <table className="table-fixed w-full border border-gray-300 text-sm">
  <thead className="bg-blue-900 text-white text-xs">
    <tr>
                  <th className="py-3 px-4">Reg No</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Year</th>
                  <th className="py-3 px-4">Theory (Total)</th>
                  <th className="py-3 px-4">Theory (Attended)</th>
                  <th className="py-3 px-4">Theory %</th>
                  <th className="py-3 px-4">Clinical (Total)</th>
                  <th className="py-3 px-4">Clinical (Attended)</th>
                  <th className="py-3 px-4">Clinical %</th>
                  <th className="py-3 px-4">Practical (Total)</th>
                  <th className="py-3 px-4">Practical (Attended)</th>
                  <th className="py-3 px-4">Practical %</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((student) => (
                  <tr key={student.regNumber} className="odd:bg-gray-100 even:bg-white hover:bg-blue-50 transition-all">
                    <td className="p-2">{student.regNumber}</td>
                    <td className="p-2">{student.name}</td>
                    <td className="p-2">{student.currentYear}</td>
                    <td className="p-2"><input type="number" className="w-full p-1 border rounded" value={student.theoryTotal} onChange={(e) => autoFillTotalClasses("theoryTotal", e.target.value)} /></td>
                    <td className="p-2"><input type="number" className="w-full p-1 border rounded" value={student.theoryAttended} onChange={(e) => handleTableChange(student.regNumber, "theoryAttended", e.target.value)} /></td>
                    <td className="p-2 text-center">{calculatePercentage(student.theoryAttended, student.theoryTotal)}%</td>
                    <td className="p-2"><input type="number" className="w-full p-1 border rounded" value={student.clinicalTotal} onChange={(e) => autoFillTotalClasses("clinicalTotal", e.target.value)} /></td>
                    <td className="p-2"><input type="number" className="w-full p-1 border rounded" value={student.clinicalAttended} onChange={(e) => handleTableChange(student.regNumber, "clinicalAttended", e.target.value)} /></td>
                    <td className="p-2 text-center">{calculatePercentage(student.clinicalAttended, student.clinicalTotal)}%</td>
                    <td className="p-2"><input type="number" className="w-full p-1 border rounded" value={student.practicalTotal} onChange={(e) => autoFillTotalClasses("practicalTotal", e.target.value)} /></td>
                    <td className="p-2"><input type="number" className="w-full p-1 border rounded" value={student.practicalAttended} onChange={(e) => handleTableChange(student.regNumber, "practicalAttended", e.target.value)} /></td>
                    <td className="p-2 text-center">{calculatePercentage(student.practicalAttended, student.practicalTotal)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center mt-6 space-x-4">
            <button onClick={saveToDatabase} className="bg-[#1E3A8A] text-white px-6 py-2 rounded hover:bg-[#360061]">Save</button>
            <button onClick={downloadExcel} className="bg-[#145A32] text-white px-4 py-2 rounded hover:bg-[#1C6E1C]">Download</button>
            <Link to="/average" className="bg-[#0F4C75] text-white px-4 py-2 rounded hover:bg-[#3156C1]">Calculate Average</Link>
          </div>
        </>
      )}
    </div>
  );
};

export default AttendanceForm;

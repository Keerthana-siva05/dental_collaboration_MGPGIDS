"use client"
import Header from "./Home/Header";
import AdminSidebar from "../components/Sidebar/AdminSidebar";
import { useState, useEffect } from "react";
import axios from "axios";
import { AlertCircle, CheckCircle, Upload, FileSpreadsheet, ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";

export default function UploadUsers() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [course, setCourse] = useState("BDS");
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [endYear, setEndYear] = useState(new Date().getFullYear() + 4);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus("idle");
      setMessage("");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const isExcel = droppedFile.name.match(/\.(xlsx|xls)$/);

      if (isExcel) {
        setFile(droppedFile);
        setStatus("idle");
        setMessage("");
      } else {
        setMessage("Please upload an Excel file (.xlsx or .xls)");
        setStatus("error");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("course", course);
    formData.append("startYear", startYear);
    formData.append("endYear", endYear);
    
    setStatus("loading");
    setMessage("Uploading users...");

    try {
      const response = await axios.post("http://localhost:5000/api/students/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(response.data.message);
      setStatus("success");
      setFile(null);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error uploading file. Please try again.");
      setStatus("error");
      console.error(error);
    }
  };

  // Generate year options (current year ± 10 years)
  const yearOptions = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 7; i <= currentYear + 12; i++) {
    yearOptions.push(i); 
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header toggleSidebar={toggleSidebar} />
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className={` flex justify-center items-center ${isMobile ? 'p-4 mt-[150px]' : 'p-8 md:p-20 mt-[85px]'}`}>
        <div className={`w-full ${isMobile ? 'max-w-xs' : 'max-w-md'} bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl container-upload-user`}>
          {/* Decorative header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
            <h2 className="text-2xl font-bold text-center text-white">Upload Student Batch</h2>
            <p className="text-center text-blue-100">Import student data from Excel</p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Course and Year Selection */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Course Dropdown */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                    <div className="relative">
                      <select
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        className="appearance-none w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer"
                      >
                        <option value="BDS">BDS</option>
                        <option value="MDS">MDS</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <br />
                  {/* Start Year Dropdown */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Year</label>
                    <div className="relative">
                      <select
                        value={startYear}
                        onChange={(e) => setStartYear(parseInt(e.target.value))}
                        className="appearance-none w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer"
                      >
                        {yearOptions.map((year) => (
                          <option key={`start-${year}`} value={year}>{year}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* End Year Dropdown */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Year</label>
                    <div className="relative">
                      <select
                        value={endYear}
                        onChange={(e) => setEndYear(parseInt(e.target.value))}
                        className="appearance-none w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer"
                      >
                        {yearOptions.map((year) => (
                          <option key={`end-${year}`} value={year}>{year}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Batch Status (calculated) */}
                  <div className="col-span-1 md:col-span-2">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Batch Status: </span>
                        {new Date().getFullYear() > endYear || 
                        (new Date().getFullYear() === endYear && new Date().getMonth() >= 6) ? (
                          <span className="text-red-600">Inactive (after July {endYear})</span>
                        ) : (
                          <span className="text-green-600">Active (until July {endYear})</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* File Upload Section */}
              <div
                className={cn(
                  "border-2 border-dashed rounded-xl p-6 transition-all duration-300 ease-in-out",
                  "flex flex-col items-center justify-center text-center",
                  isDragging ? "border-blue-500 bg-blue-50 scale-[1.02]" : "border-gray-300",
                  status === "loading" ? "opacity-70" : "",
                  "hover:border-blue-400 hover:bg-blue-50",
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="mb-4">
                  <div
                    className={cn(
                      "size-16 mx-auto rounded-full flex items-center justify-center mb-3",
                      "bg-gradient-to-br from-blue-100 to-purple-100",
                      "transition-transform duration-500",
                      status === "loading" ? "animate-pulse" : "",
                    )}
                  >
                    {status === "success" ? (
                      <CheckCircle className="size-8 text-green-500 animate-in fade-in-50 zoom-in-95 duration-300" />
                    ) : status === "error" ? (
                      <AlertCircle className="size-8 text-red-500 animate-in fade-in-50 zoom-in-95 duration-300" />
                    ) : file ? (
                      <FileSpreadsheet className="size-8 text-blue-500 animate-in fade-in-50 zoom-in-95 duration-300" />
                    ) : (
                      <Upload
                        className={cn("size-8 text-gray-400", isDragging ? "text-blue-500 animate-bounce" : "")}
                      />
                    )}
                  </div>

                  <h3 className="text-lg font-medium text-gray-800">
                    {file ? file.name : "Drag & drop your Excel file here"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {file ? `${(file.size / 1024).toFixed(2)} KB` : "or click to browse (.xlsx, .xls)"}
                  </p>
                </div>

                <input
                  type="file"
                  id="file-upload"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={status === "loading"}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById("file-upload").click()}
                  disabled={status === "loading"}
                  className="mt-2 px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                >
                  Select File
                </button>
              </div>

              {/* Status Message */}
              {message && (
                <div
                  className={cn(
                    "rounded-lg p-3 text-sm animate-in fade-in-50 slide-in-from-bottom-5 duration-300",
                    status === "success"
                      ? "bg-green-100 text-green-800"
                      : status === "error"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800",
                  )}
                >
                  {message}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className={cn(
                  "w-full px-6 py-3 text-base font-medium text-white rounded-lg shadow-md transition-all duration-300",
                  "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                  "transform hover:scale-[1.02] focus:scale-[0.98]",
                  (!file || status === "loading") && "opacity-70 cursor-not-allowed"
                )}
                disabled={!file || status === "loading"}
              >
                {status === "loading" ? (
                  <span className="flex items-center justify-center">
                    <span className="mr-2 inline-block size-5 rounded-full border-2 border-white border-r-transparent animate-spin" />
                    Uploading...
                  </span>
                ) : (
                  "Upload Student Batch"
                )}
              </button>
            </form>
          </div>

          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Supported formats: .xlsx, .xls | Max file size: 5MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
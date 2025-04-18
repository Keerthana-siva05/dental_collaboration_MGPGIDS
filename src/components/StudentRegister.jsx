import React, { useState } from "react";
import axios from "axios";
import Header from "./Home/Header";
import AdminSidebar from "../components/Sidebar/AdminSidebar";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const [registerNo, setRegisterNo] = useState("");
  const [name, setName] = useState("");
  const [course, setCourse] = useState("BDS"); // Default to BDS
  const [batchStart, setBatchStart] = useState(new Date().getFullYear());
  const [batchEnd, setBatchEnd] = useState(new Date().getFullYear() + 4);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Generate year options for dropdown
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = currentYear - 10; i <= currentYear + 10; i++) {
    yearOptions.push(i);
  }

  // Handle form submission
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate register number (must be alphanumeric)
    const registerNoPattern = /^[A-Za-z0-9]+$/;
    if (!registerNoPattern.test(registerNo)) {
      setError("Register number must be alphanumeric.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/students/register", {
        registerNo,
        name,
        email,
        password: registerNo, // Using registerNo as password
        course,
        batch: {
          startYear: batchStart,
          endYear: batchEnd
        },
        endYear: batchEnd,
        // Default values that don't need UI input:
        dob: "2000-01-01", // Default DOB
        status: "active" // Default status
      });

      console.log("User registered:", response.data);
      alert("User registered successfully!");

      // Clear form
      setRegisterNo("");
      setName("");
      setEmail("");
    } catch (error) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.code === "ERR_NETWORK") {
        setError("Network error. Please try again.");
      } else {
        setError("Error registering user. Please try again.");
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      <Header toggleSidebar={toggleSidebar} />
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="min-h-screen flex items-center justify-center bg-gray-100 pt-40 pb-10">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Student Register</h2>
          
          <form onSubmit={handleRegister} className="space-y-6">
            {/* Register Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Register No.*</label>
              <input
                type="text"
                placeholder="Enter register number"
                value={registerNo}
                onChange={(e) => setRegisterNo(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">This will be used as the default password</p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Name*</label>
              <input
                type="text"
                placeholder="Enter student name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email*</label>
              <input
                type="email"
                placeholder="Enter student email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Course Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Course*</label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="BDS">BDS</option>
                <option value="MDS">MDS</option>
              </select>
            </div>

            {/* Batch Year Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Year*</label>
                <select
                  value={batchStart}
                  onChange={(e) => setBatchStart(parseInt(e.target.value))}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {yearOptions.map((year) => (
                    <option key={`start-${year}`} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Year*</label>
                <select
                  value={batchEnd}
                  onChange={(e) => setBatchEnd(parseInt(e.target.value))}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {yearOptions.map((year) => (
                    <option key={`end-${year}`} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
                {error}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2 px-4 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400"
              >
                {isLoading ? (
                  <>
                    <span className="mr-2 inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Registering...
                  </>
                ) : (
                  "Register "
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/users")}
                className="flex-1 py-2 px-4 rounded-md bg-green-600 text-white hover:bg-gray-700"
              >
                Bulk Upload
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
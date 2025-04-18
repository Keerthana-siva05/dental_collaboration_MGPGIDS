import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { FaUserGraduate, FaTasks, FaCalendarAlt, FaUserMd } from "react-icons/fa";
import { LogOut } from "lucide-react";
import FacultySidebar from "../components/Sidebar/FacultySidebar";
import Header from "../components/Home/Header";

const FacultyDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [facultyData, setFacultyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        const token = localStorage.getItem("facultyToken");
        if (!token) {
          navigate("/facultylogin");
          return;
        }

        const response = await axios.get("http://localhost:5000/api/faculty/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFacultyData(response.data);
      } catch (error) {
        localStorage.removeItem("facultyToken");
        navigate("/facultylogin");
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("facultyToken");
    navigate("/facultylogin");
  };

  const statsData = [
    { name: "Students", value: 250 },
    { name: "Cases", value: 35 },
    { name: "Tasks", value: 5 },
    { name: "Appointments", value: 8 },
  ];

  const pieData = [
    { name: "Completed", value: 70 },
    { name: "Pending", value: 30 },
  ];

  const COLORS = ["#0088FE", "#FFBB28"];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen bg-gray-100 p-4 mt-8">
      <Header toggleSidebar={toggleSidebar} />
      <FacultySidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex flex-col flex-1 space-y-6 p-6 mt-11">
        {/* Top Bar */}
        

        {/* Welcome Section */}
        <section className="bg-blue-900 text-white text-center p-6 rounded-lg shadow-lg mt-12">
          <h2 className="text-2xl font-semibold">Welcome, {facultyData?.name}</h2>
          <p>Manage students, exams, and patient cases efficiently.</p>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-lg text-center space-y-2"
            >
              {index === 0 && <FaUserGraduate className="text-blue-900 text-4xl mx-auto" />}
              {index === 1 && <FaUserMd className="text-blue-900 text-4xl mx-auto" />}
              {index === 2 && <FaTasks className="text-blue-900 text-4xl mx-auto" />}
              {index === 3 && <FaCalendarAlt className="text-blue-900 text-4xl mx-auto" />}
              <h3 className="text-lg font-semibold">{stat.name}</h3>
              <p className="text-gray-700 text-xl">{stat.value}</p>
            </div>
          ))}
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-center">Overview</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statsData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2C3E50" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-center">Task Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="value"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FacultyDashboard;

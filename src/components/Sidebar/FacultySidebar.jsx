import { X, Home, LayoutDashboard, User, Calendar, BarChart2, HeartPulse, GraduationCap, BookOpenCheck, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React from "react";

const FacultySidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();

  return (
    <div
      className={`fixed top-0 left-0 z-50 h-full w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white transform transition-transform duration-300 ease-in-out sidebar_1 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } shadow-xl`}
    >
      {/* Close button */}
      <button
        onClick={toggleSidebar}
        className="absolute top-4 right-4 text-white transition-colors duration-200"
      >
        <X size={24} />
      </button>

      {/* Faculty Links */}
      <nav className="mt-16 space-y-2 px-4">
        <button
          onClick={() => {
            navigate("/");
            toggleSidebar();
          }}
          className="flex items-center gap-3 w-full text-left px-4 py-2 rounded-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-md hover:pl-5"
        >
          <Home size={18} /> Home
        </button>
        <button
          onClick={() => {
            navigate("/facultydashboard");
            toggleSidebar();
          }}
          className="flex items-center gap-3 w-full text-left px-4 py-2 rounded-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-md hover:pl-5"
        >
          <LayoutDashboard size={18} /> Dashboard
        </button>
        <button
          onClick={() => {
            navigate("/profile");
            toggleSidebar();
          }}
          className="flex items-center gap-3 w-full text-left px-4 py-2 rounded-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-md hover:pl-5"
        >
          <User size={18} /> Profile
        </button>
        <button
          onClick={() => {
            navigate("/attendance");
            toggleSidebar();
          }}
          className="flex items-center gap-3 w-full text-left px-4 py-2 rounded-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-md hover:pl-5"
        >
          <Calendar size={18} /> Attendance
        </button>
        <button
          onClick={() => {
            navigate("/assessment");
            toggleSidebar();
          }}
          className="flex items-center gap-3 w-full text-left px-4 py-2 rounded-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-md hover:pl-5"
        >
          <BarChart2 size={18} /> Internal Assessment
        </button>
        <button
          onClick={() => {
            navigate("/patient-cases");
            toggleSidebar();
          }}
          className="flex items-center gap-3 w-full text-left px-4 py-2 rounded-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-md hover:pl-5"
        >
          <HeartPulse size={18} /> Patient Cases
        </button>
        <button
          onClick={() => {
            navigate("/activities");
            toggleSidebar();
          }}
          className="flex items-center gap-3 w-full text-left px-4 py-2 rounded-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-md hover:pl-5"
        >
          <GraduationCap size={18} /> Faculty Activities
        </button>
        <button
          onClick={() => {
            navigate("/resource");
            toggleSidebar();
          }}
          className="flex items-center gap-3 w-full text-left px-4 py-2 rounded-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-md hover:pl-5"
        >
          <BookOpenCheck size={18} /> Resources
        </button>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
            toggleSidebar();
          }}
          className="flex items-center gap-3 w-full text-left py-2 px-4 bg-gradient-to-r from-red-600 to-red-500 hover:bg-red-700 rounded-md transition duration-300 mt-6 font-semibold"
        >
          <LogOut size={18} /> Logout
        </button>
      </nav>
    </div>
  );
};

export default FacultySidebar;

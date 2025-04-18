import { X } from "lucide-react"
import React, { useState } from "react";
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom";
// import "./header.css";
const HomeSidebar = ({ isOpen, toggleSidebar }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navigate = useNavigate();

  const toggleDropdown = (section) => {
    setActiveDropdown(activeDropdown === section ? null : section);
  };
  const pdfUrl = 'C:/Users/ADMIN/Desktop/dental_1/guidance.pdf';

  return (
    <div
      className={` fixed top-0 left-0 z-50 h-full w-64 text-white transform transition-transform duration-300 ease-in-out sidebar_1 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <button
        onClick={toggleSidebar}
        className="absolute top-4 right-4 text-white hover:text-blue-200 transition-colors duration-200"
      >
        <X size={24} />
      </button>
      <nav className="mt-16 space-y-4 px-4">
        <a href="/" className="block py-2 hover:bg-blue-700 rounded transition-colors duration-200">
          Home
        </a>
        <div>
          <button
            className="block py-2 w-full text-left rounded transition-colors duration-200 hover:bg-blue-700"
            onClick={() => toggleDropdown("faculty")}
          >
            Faculty &#9662;
          </button>
          {activeDropdown === "faculty" && (
            <div className="pl-4 mt-2 space-y-2">
              <button
                onClick={() => navigate("/facultyprofile")}
                className="block w-full text-left py-1 rounded hover:bg-blue-700"
              >
                Faculty Profile
              </button>
              <button
                onClick={() => navigate("/Publicactivities")}
                className="block w-full text-left py-1 rounded hover:bg-blue-700"
              >
                Faculty Activities
              </button>
            </div>
          )}
        </div>

        <Link to="/appointmentsearch" className="block py-2 hover:bg-blue-700 rounded transition-colors duration-200">
          Appointment Search 
        </Link>

            <a
          href={pdfUrl}
          download="General-Guidance.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="block py-2 hover:bg-blue-700 rounded transition-colors duration-200"
        >
          General Guidance
        </a>
        
        <Link to="/Login" className="block py-2 hover:bg-blue-700 rounded transition-colors duration-200">
           Login 
        </Link>

        <a href="#contact" className="block py-2 hover:bg-blue-700 rounded transition-colors duration-200">
          Contact Us
        </a>
      </nav>
    </div>
  )
}

export default HomeSidebar


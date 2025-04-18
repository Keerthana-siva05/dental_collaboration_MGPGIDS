import React, { useEffect, useState } from "react";
import axios from "axios";
import HomeSidebar from "../components/Sidebar/HomeSidebar";
import Header from './Home/Header';

const PublicFacultyActivities = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [facultyData, setFacultyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        
        const response = await axios.get(
          "http://localhost:5000/api/faculty-activities/public",
          {
            timeout: 5000,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            }
          }
        );

        if (!response.data) {
          throw new Error("No data received from server");
        }

        const formattedData = response.data.map(faculty => ({
          ...faculty,
          activities: Array.isArray(faculty.activities) ? faculty.activities : []
        }));

        setFacultyData(formattedData);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.response?.data?.message || 
                err.message || 
                "Failed to load faculty data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-36 p-8 bg-white rounded-lg shadow-lg border-l-8 border-r-8 border-blue-500 font-sans">
      <Header toggleSidebar={toggleSidebar} />
      <HomeSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <h1 className="text-center text-3xl font-semibold text-gray-800 uppercase mb-6 border-b-4 border-blue-500 pb-3 tracking-wide">
        Faculty Activities
      </h1>
      
      <div className="flex flex-col gap-5">
        {facultyData.length > 0 ? (
          facultyData.map((faculty) => (
            <div
              key={faculty._id}
              className="flex flex-col items-start bg-gray-100 p-5 border-l-4 border-blue-500 rounded-lg shadow-md transition-transform transform hover:scale-105 hover:bg-blue-50"
            >
              <h2 className="flex items-center text-xl font-bold text-gray-800">
                <span className="uppercase font-extrabold">{faculty.name}</span>
                {faculty.designation && (
                  <span className="italic text-gray-600 ml-2">{faculty.designation}</span>
                )}
              </h2>
              <ul className="list-disc pl-5 mt-3 text-gray-700 space-y-1">
                {faculty.activities.length > 0 ? (
                  faculty.activities.map((activity, i) => (
                    <li key={i} className="text-base">
                      {activity.startsWith('•') ? activity : ` ${activity}`}
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No activities available</li>
                )}
              </ul>
            </div>
          ))
        ) : (
          <p className="text-center text-lg text-gray-500 mt-5">
            No faculty activities available at the moment.
          </p>
        )}
      </div>
    </div>
  );
};

export default PublicFacultyActivities;
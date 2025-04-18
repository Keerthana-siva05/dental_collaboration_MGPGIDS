import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FacultySidebar from "../components/Sidebar/FacultySidebar";
import Header from './Home/Header';

const FacultyActivities = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [facultyName, setFacultyName] = useState("");
  const [activityInput, setActivityInput] = useState("");
  const [activities, setActivities] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("facultyToken");
        if (!token) {
          navigate("/facultylogin");
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/faculty-activities/activities",
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );

        setFacultyName(response.data.name);
        // Ensure activities is always an array of strings
        setActivities(response.data.activities?.filter(a => a.trim()) || []);
      } catch (error) {
        console.error("Error:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("facultyToken");
          navigate("/facultylogin");
        } else {
          setError("Failed to load activities");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyData();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!activityInput.trim()) {
      setError("Please enter activities");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      // Split by new lines and filter out empty lines
      const newActivities = activityInput
        .split('\n')
        .map(a => a.trim())
        .filter(a => a.length > 0);

      if (newActivities.length === 0) {
        setError("Please enter valid activities");
        return;
      }

      let updatedActivities;
      if (editIndex !== null) {
        // Replace the edited activity
        updatedActivities = [...activities];
        updatedActivities[editIndex] = newActivities[0]; // Take first line if editing
      } else {
        // Add all new activities
        updatedActivities = [...activities, ...newActivities];
      }

      const token = localStorage.getItem("facultyToken");
      const response = await axios.put(
        "http://localhost:5000/api/faculty-activities/update-activities",
        { activities: updatedActivities },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      setActivities(updatedActivities);
      setActivityInput("");
      setEditIndex(null);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to save activities");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (index) => {
    setActivityInput(activities[index]);
    setEditIndex(index);
  };

  const handleDelete = async (index) => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      try {
        setLoading(true);
        const updatedActivities = activities.filter((_, i) => i !== index);
        
        const token = localStorage.getItem("facultyToken");
        await axios.put(
          "http://localhost:5000/api/faculty-activities/update-activities",
          { activities: updatedActivities },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );

        setActivities(updatedActivities);
      } catch (error) {
        console.error("Error:", error);
        setError("Failed to delete activity");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen bg-gray-50 mt-12">
      <Header toggleSidebar={toggleSidebar} />
      <FacultySidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <main className="flex-1 p-6 lg:p-8 mt-16">
        <div className="max-w-6xl mx-auto">
          {/* Centered Header Section */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Faculty Activities</h1>
            {facultyName && (
              <div className="inline-block px-6 py-2 bg-blue-50 rounded-full">
                <p className="text-lg font-medium text-blue-800">{facultyName}</p>
              </div>
            )}
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {/* Row-wise Layout */}
          <div className="space-y-8">
            {/* Add New Activity Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {editIndex !== null ? "Edit Activity" : "Add New Activity"}
              </h2>
             
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <textarea
                    placeholder="Enter your activity (e.g., • Nodal Officer, Anti Ragging Cell)"
                    value={activityInput}
                    onChange={(e) => setActivityInput(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-5 py-2.5 rounded-lg font-medium text-white ${editIndex !== null ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} transition-colors disabled:opacity-50 flex items-center`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : editIndex !== null ? "Update Activity" : "Add Activity"}
                  </button>
                  {editIndex !== null && (
                    <button
                      type="button"
                      onClick={() => {
                        setActivityInput("");
                        setEditIndex(null);
                      }}
                      className="px-5 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Your Activities Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Your Activities
                </h2>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
                </span>
              </div>

              {activities.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No activities added</h3>
                  <p className="mt-1 text-sm text-gray-500">Add your first activity above</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {activities.map((activity, index) => (
                    <li key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center">
                        <p className="text-gray-700">
                          <span className="text-blue-500 mr-2">•</span>
                          {activity.startsWith('•') ? activity.substring(1).trim() : activity}
                        </p>
                        <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEdit(index)}
                              disabled={loading}
                              className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50 transition-colors"
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(index)}
                              disabled={loading}
                              className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FacultyActivities;
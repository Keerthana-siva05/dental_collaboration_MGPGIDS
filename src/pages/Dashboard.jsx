import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, Calendar, Clock, LogOut } from 'lucide-react';

const Dashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem('studentToken');
        console.log(token);
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/students/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setStudentData(response.data);
      } catch (err) {
        localStorage.removeItem('studentToken');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('studentToken');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 hover:text-red-800"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {studentData && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Student Info */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Welcome, {studentData.name}
                  </h2>
                  <p className="text-gray-600">{studentData.registerNo}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    studentData.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {studentData.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gray-50 px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Course</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {studentData.course}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Batch</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {studentData.batch.startYear} - {studentData.batch.endYear}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Validity</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(studentData.validity).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Content */}
            <div className="px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h3>
              {/* Activity list would go here */}
              <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                No recent activities
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
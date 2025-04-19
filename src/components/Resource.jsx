import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import FacultySidebar from '../components/Sidebar/FacultySidebar';
import Header from './Home/Header';

const ResourcesPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [resources, setResources] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null,
    fileType: 'pdf',
    courseType: '',
    academicYear: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Get authentication token
  const getAuthToken = () => {
    return localStorage.getItem('facultyToken') || sessionStorage.getItem('facultyToken');
  };

  // Fetch all resources
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const token = getAuthToken();
        
        const response = await axios.get('http://localhost:5000/api/resources', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (response.data.success) {
          setResources(response.data.data || []);
        } else {
          throw new Error(response.data.message || 'Failed to fetch resources');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        if (err.response?.status === 401) {
          setError('Session expired. Please login again.');
          navigate('/login');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch resources');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    try {
      const selectedFile = e.target.files[0];
      if (selectedFile) {
        const type = selectedFile.type.includes('video') ? 'video' : 'pdf';
        setFormData(prev => ({
          ...prev,
          file: selectedFile,
          fileType: type
        }));
      }
    } catch (err) {
      console.error('File selection error:', err);
      setError('Error selecting file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.file) {
      setError('Title and file are required');
      return;
    }

    if (!formData.courseType || !formData.academicYear) {
      setError('Course type and academic year are required');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setError('You must be logged in to upload resources');
      navigate('/login');
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('file', formData.file);
    data.append('fileType', formData.fileType);
    data.append('courseType', formData.courseType);
    data.append('academicYear', formData.academicYear);

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await axios.post('http://localhost:5000/api/resources', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
        timeout: 30000 // 30 second timeout
      });

      if (response.data.success) {
        setSuccess('Resource uploaded successfully!');
        setResources(prev => [...prev, response.data.data]);
        setFormData({
          title: '',
          description: '',
          file: null,
          fileType: 'pdf',
          courseType: '',
          academicYear: ''
        });
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        navigate('/login');
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to upload resource');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    
    const token = getAuthToken();
    if (!token) {
      setError('You must be logged in to delete resources');
      navigate('/login');
      return;
    }
  
    try {
      setLoading(true);
      const response = await axios.delete(`http://localhost:5000/api/resources/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setResources(prev => prev.filter(resource => resource._id !== id));
        setSuccess('Resource deleted successfully');
      } else {
        throw new Error(response.data.message || 'Failed to delete resource');
      }
    } catch (err) {
      console.error('Delete error:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to delete resource');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatYear = (year) => {
    if (!year) return '';
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const suffix = year % 100 > 10 && year % 100 < 14 ? 'th' : suffixes[year % 10] || 'th';
    return `${year}${suffix} Year`;
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (error || success) {
        setError('');
        setSuccess('');
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [error, success]);


  return (
    <div className="min-h-screen bg-gray-50 mt-12">
      <Header toggleSidebar={toggleSidebar} />
      <FacultySidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="py-8 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-4xl mx-auto ">
          {/* Header */}
          
          
          {/* Upload Form */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-12 mt-12">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-700 px-6 py-4 mt-10">
              <h2 className="text-xl font-semibold text-white">Upload New Resource</h2>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="courseType" className="block text-sm font-medium text-gray-700 mb-1">
                      Course Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="courseType"
                      name="courseType"
                      className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      value={formData.courseType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Course</option>
                      <option value="BDS">BDS</option>
                      <option value="MDS">MDS</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700 mb-1">
                      Academic Year <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="academicYear"
                      name="academicYear"
                      className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      value={formData.academicYear}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="fileType" className="block text-sm font-medium text-gray-700 mb-1">
                      Resource Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="fileType"
                      name="fileType"
                      className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      value={formData.fileType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="pdf">PDF/Document</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="3"
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
                    File <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <input
                      id="file"
                      type="file"
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
                      onChange={handleFileChange}
                      accept={formData.fileType === 'pdf' ? '.pdf,.doc,.docx,.ppt,.pptx' : 'video/*'}
                      required
                    />
                  </div>
                  {formData.file && (
                    <p className="mt-1 text-sm text-gray-500">
                      Selected file: {formData.file.name} ({(formData.file.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      'Upload Resource'
                    )}
                  </button>
                </div>
              </form>
              
              {/* Error and success messages */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {success && (
                <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-r">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">{success}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Resources List */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Available Resources</h2>
            </div>
            
            <div className="p-6">
              {loading && resources.length === 0 ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : resources.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No resources available</h3>
                  <p className="mt-1 text-gray-500">Upload the first resource using the form above.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {resources.map((resource) => (
                    <div key={resource._id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-gray-900">{resource.title}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              resource.courseType === 'BDS' ? 'bg-purple-100 text-purple-800' : 'bg-pink-100 text-pink-800'
                            }`}>
                              {resource.courseType}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {formatYear(resource.academicYear)}
                            </span>
                          </div>
                          <p className="mt-1 text-gray-600">{resource.description}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              resource.fileType === 'pdf' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {resource.fileType.toUpperCase()}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {new Date(resource.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 sm:mt-0 sm:ml-4 flex space-x-2">
                        <a
  href={`http://localhost:5000/uploads/${resource.filePath.split('uploads/').pop()}`}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
>
  <svg className="-ml-0.5 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
  View
</a>
                          <button
                            onClick={() => handleDelete(resource._id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition disabled:opacity-50"
                            disabled={loading}
                          >
                            <svg className="-ml-0.5 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;
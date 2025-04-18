import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from './Home/Header';
import FacultySidebar from "../components/Sidebar/FacultySidebar";

const Profile = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [profile, setProfile] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
      name: "",
      email: "",
      department: "",
      designation: "",
      contactNumber: "",
      profileImage: "",
    });

    const token = localStorage.getItem("facultyToken");
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");
        
        const response = await axios.get('http://localhost:5000/api/faculty/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        if (response.data.success) {
          setProfile(response.data.data);
          setFormData({
            name: response.data.data.name || "",
            email: response.data.data.email || "",
            department: response.data.data.department || "",
            designation: response.data.data.designation || "",
            contactNumber: response.data.data.contactNumber || response.data.data.contactNo || "",
            profileImage: response.data.data.profileImage || ""
          });
        } else {
          throw new Error(response.data.message || "Failed to fetch profile");
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
        setError(error.response?.data?.message || error.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchProfile();
    } else {
      setError("Not authenticated. Please login.");
      setLoading(false);
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    let validationErrors = {};

    if (!formData.department.trim()) {
      validationErrors.department = "Department is required.";
    } else if (/\d/.test(formData.department)) {
      validationErrors.department = "Department cannot contain numbers.";
    }

    if (!formData.designation.trim()) {
      validationErrors.designation = "Designation is required.";
    } else if (/\d/.test(formData.designation)) {
      validationErrors.designation = "Designation cannot contain numbers.";
    }

    if (!/^\d{10}$/.test(formData.contactNumber)) {
      validationErrors.contactNumber = "Enter a valid 10-digit mobile number.";
    }

    if (!formData.profileImage) {
      validationErrors.profileImage = "Profile image is required.";
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      
      const response = await axios.put(
        'http://localhost:5000/api/faculty/profile',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      if (response.data.success) {
        setProfile(response.data.data);
        alert("Profile updated successfully!");
      } else {
        throw new Error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error.response?.data?.message || error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    // Client-side validation
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }
  
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
  
    const formData = new FormData();
    formData.append('profileImage', file);
  
    try {
      const response = await axios.post(
        'http://localhost:5000/api/faculty/upload-image',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
            // Let browser set Content-Type automatically
          }
        }
      );
  
      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          profileImage: response.data.profileImage
        }));
        setError('');
        alert('Profile image updated successfully!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.message || 'Failed to upload image. Please try again.');
    }
  };
  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md" role="alert">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8 ">
        <Header toggleSidebar={toggleSidebar} />
        <FacultySidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        
        <div className="max-w-4xl mx-auto mt-12">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mt-15">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-900 to-blue-800 px-8 py-10 text-center mt-12">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Faculty Profile</h1>
                    <p className="mt-1 text-blue-100 font-medium">Update your professional information</p>
                </div>

                {/* Main Content */}
                <div className="px-6 py-8 sm:px-10 bg-gradient-to-b from-white to-gray-50">
                    {/* Profile Picture Section */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="relative group">
                            {formData.profileImage ? (
                                <img 
                                    src={`http://localhost:5000${formData.profileImage}`} 
                                    alt="Profile" 
                                    className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-blue-200 transition-all duration-300 group-hover:ring-blue-400"
                                />
                            ) : (
                                <div className="w-36 h-36 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-4 border-white shadow-lg ring-2 ring-blue-200">
                                    <svg className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-3 rounded-full cursor-pointer hover:bg-blue-700 transition-all duration-300 shadow-md transform hover:scale-110">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleImageUpload} 
                                    className="hidden" 
                                />
                            </label>
                        </div>
                        {errors.profileImage && (
                            <p className="mt-3 text-sm text-red-500 font-medium">{errors.profileImage}</p>
                        )}
                    </div>

                    {/* Profile Form */}
                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* Name Field */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white"
                                />
                            </div>

                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
                                />
                            </div>

                            {/* Department Field */}
                            <div>
                                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                                    Department
                                </label>
                                <input
                                    type="text"
                                    id="department"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white"
                                />
                                {errors.department && (
                                    <p className="mt-1 text-sm text-red-500">{errors.department}</p>
                                )}
                            </div>

                            {/* Designation Field */}
                            <div>
                                <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-1">
                                    Designation
                                </label>
                                <input
                                    type="text"
                                    id="designation"
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white"
                                />
                                {errors.designation && (
                                    <p className="mt-1 text-sm text-red-500">{errors.designation}</p>
                                )}
                            </div>

                            {/* Contact Number Field */}
                            <div className="sm:col-span-2">
                                <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                    Contact Number
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                        +91
                                    </div>
                                    <input
                                        type="text"
                                        id="contactNumber"
                                        name="contactNumber"
                                        value={formData.contactNumber}
                                        onChange={handleChange}
                                        maxLength="10"
                                        placeholder="9876543210"
                                        className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white"
                                    />
                                </div>
                                {errors.contactNumber && (
                                    <p className="mt-1 text-sm text-red-500">{errors.contactNumber}</p>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md transition duration-300 transform hover:scale-[1.01]"
                            >
                                Update Profile
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
);
};

export default Profile;
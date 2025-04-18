"use client"

import { BrowserRouter as Router, Route, Routes } from "react-router-dom"

import Home from "./pages/Home"

import StudentRegister from './components/StudentRegister';
import Upload_Users from './components/upload-users';
import FacultyRegister from './components/FacultyRegister';

import FacultyLogin from "./components/FacultyLogin";
import AppointmentSearch from "./components/AppointmentSearch";

import Login from './components/StudentLogin';
import ResetPassword from './components/ResetPassword';

//Student Dashboard
import Dashboard from './pages/Dashboard';
//Faculty Dashboard
import FacultyDashboard from './pages/FacultyDashboard';

// import ProtectedRoute from './components/ProtectedRoute';

import StudentManagement from "./components/StudentList";


import FacultyActivities from './components/FacultyActivities';
import PublicFacultyActivities from './components/PublicFacultyActivities';
import Profile from './components/Profile';
import FacultyProfile from './components/FacultyProfile';
import AttendanceForm from './components/AttendanceForm';
import AttendanceAverage from './components/AttendanceAverage';
import InternalAssessment from './components/internalAssessment';
import Resource from './components/Resource';

function App() {


  return (
      <Routes>

          <Route path="/" element={<Home />} />

          <Route path="/facultyregister" element={<FacultyRegister />} />
          <Route path="/studentregister" element={<StudentRegister />} />
          <Route path="/users" element={<Upload_Users />} />

          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/facultylogin" element={<FacultyLogin />} />

          <Route path="/appointmentsearch" element={<AppointmentSearch />} />
          {/* <Route path="/students" element={<StudentList />} /> */}
          {/* <Route path="/edit-student" element={<EditStudents />} /> */}

        <Route path="/dashboard"  element={ <Dashboard />} />
        <Route path="/facultydashboard"  element={ <FacultyDashboard />} />
        <Route path="/studentmanagement"  element={ <StudentManagement />} />
        {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}

        <Route path="/activities"  element={ < FacultyActivities/>} />
        <Route path="/Publicactivities"  element={ < PublicFacultyActivities/>} />
        <Route path="/profile"  element={ < Profile/>} />
        <Route path="/facultyprofile"  element={ < FacultyProfile/>} />
        <Route path="/attendance"  element={ < AttendanceForm/>} />
        <Route path="/average"  element={ < AttendanceAverage/>} />
        <Route path="/assessment"  element={ < InternalAssessment/>} />
        <Route path="/resource"  element={ < Resource/>} />
        </Routes>
  )
}

export default App


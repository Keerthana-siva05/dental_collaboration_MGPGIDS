import { useState, useEffect } from 'react';
import axios from 'axios';

const StudentManagement = () => {
  const [course, setCourse] = useState('BDS');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [students, setStudents] = useState([]);

  const fetchStudents = async () => {
    if (!startYear || !endYear) return;

    try {
      const response = await axios.get('http://localhost:5000/api/students', {
        params: { course, startYear, endYear }
      });
      setStudents(response.data);
    } catch (err) {
      console.error('Failed to fetch students', err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [course, startYear, endYear]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Student Management</h2>

      <div className="flex gap-4 mb-6">
        <select
          className="border rounded px-4 py-2"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
        >
          <option value="BDS">BDS</option>
          <option value="MDS">MDS</option>
        </select>

        <input
          type="number"
          placeholder="Start Year"
          className="border rounded px-4 py-2"
          value={startYear}
          onChange={(e) => setStartYear(e.target.value)}
        />

        <input
          type="number"
          placeholder="End Year"
          className="border rounded px-4 py-2"
          value={endYear}
          onChange={(e) => setEndYear(e.target.value)}
        />
      </div>

      <table className="w-full table-auto border border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Register No</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Validity</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student._id}>
              <td className="border px-4 py-2">{student.registerNo}</td>
              <td className="border px-4 py-2">{student.name}</td>
              <td className="border px-4 py-2">{student.email}</td>
              <td className="border px-4 py-2">{new Date(student.validity).toLocaleDateString()}</td>
              <td className="border px-4 py-2 capitalize">{student.status}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleUpdate(student._id)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Update
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const handleUpdate = (studentId) => {
  // You can navigate to a student edit page or open a modal
  alert(`Update action for student ID: ${studentId}`);
};

export default StudentManagement;

import React, { useState } from 'react';
import { Input, Card, Avatar, List, Tag, Empty } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import Header from "./Home/Header"
import HomeSidebar from "../components/Sidebar/HomeSidebar"

const { Search } = Input;

const AppointmentSearch = () => {
     const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    
      const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
      }
    
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Dummy data with 10 patients
  const dummyAppointments = [
    {
      id: 1,
      patientName: 'Rajesh',
      orthoNo: 'ORTHO001',
      opdNo: 'OPD2023001',
      pastAppointment: '2023-05-15',
      nextAppointment: '2023-06-20',
      status: 'confirmed'
    },
    {
      id: 2,
      patientName: 'Adhilaskmi',
      orthoNo: 'ORTHO002',
      opdNo: 'OPD2023002',
      pastAppointment: '2023-05-10',
      nextAppointment: '2023-06-15',
      status: 'confirmed'
    },
    {
      id: 3,
      patientName: 'Keerthana',
      orthoNo: 'ORTHO003',
      opdNo: 'OPD2023003',
      pastAppointment: '2023-05-18',
      nextAppointment: '2023-06-25',
      status: 'pending'
    },
    {
      id: 4,
      patientName: 'David',
      orthoNo: 'ORTHO004',
      opdNo: 'OPD2023004',
      pastAppointment: '2023-05-20',
      nextAppointment: '2023-06-22',
      status: 'confirmed'
    },
    {
      id: 5,
      patientName: 'Vicky',
      orthoNo: 'ORTHO005',
      opdNo: 'OPD2023005',
      pastAppointment: '2023-05-12',
      nextAppointment: '2023-06-18',
      status: 'cancelled'
    },
    {
      id: 6,
      patientName: 'Saran',
      orthoNo: 'ORTHO006',
      opdNo: 'OPD2023006',
      pastAppointment: '2023-05-22',
      nextAppointment: '2023-06-28',
      status: 'confirmed'
    },
    {
      id: 7,
      patientName: 'David M',
      orthoNo: 'ORTHO007',
      opdNo: 'OPD2023007',
      pastAppointment: '2023-05-08',
      nextAppointment: '2023-06-12',
      status: 'pending'
    },
    {
      id: 8,
      patientName: 'Akash',
      orthoNo: 'ORTHO008',
      opdNo: 'OPD2023008',
      pastAppointment: '2023-05-25',
      nextAppointment: '2023-06-30',
      status: 'confirmed'
    },
    {
      id: 9,
      patientName: 'Punith',
      orthoNo: 'ORTHO009',
      opdNo: 'OPD2023009',
      pastAppointment: '2023-05-17',
      nextAppointment: '2023-06-24',
      status: 'confirmed'
    },
    {
      id: 10,
      patientName: 'Monisha',
      orthoNo: 'ORTHO010',
      opdNo: 'OPD2023010',
      pastAppointment: '2023-05-19',
      nextAppointment: '2023-06-26',
      status: 'pending'
    }
  ];

  const handleSearch = (value) => {
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }
    
    const results = dummyAppointments.filter(appointment =>
      appointment.orthoNo.toLowerCase().includes(value.toLowerCase()) ||
      appointment.patientName.toLowerCase().includes(value.toLowerCase()) ||
      appointment.opdNo.toLowerCase().includes(value.toLowerCase())
    );
    setSearchResults(results);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'green';
      case 'pending':
        return 'orange';
      case 'cancelled':
        return 'red';
      default:
        return 'blue';
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
    {/* <Header toggleSidebar={toggleSidebar} /> */}
    {/* <HomeSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} /> */}

    <div style={{ padding: '20px', marginTop:'200px'}}>
      <h1 style={{ marginBottom: '20px' }}>Appointment Search</h1>
      
      <Search
        placeholder="Search by Ortho No, Patient Name, or OPD No"
        allowClear
        enterButton={<SearchOutlined />}
        size="large"
        onChange={(e) => setSearchTerm(e.target.value)}
        onSearch={handleSearch}
        style={{ marginBottom: '20px' }}
      />
      
      {searchResults.length > 0 ? (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
          dataSource={searchResults}
          renderItem={(appointment) => (
              <Card
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar icon={<UserOutlined />} style={{ marginRight: '10px' }} />
                    {appointment.patientName}
                  </div>
                }
                // extra={<Tag color={getStatusColor(appointment.status)}>{appointment.status}</Tag>}
                style={{ width: '100%' }}
              >
                <p><strong>Ortho No:</strong> {appointment.orthoNo}</p>
                <p><strong>OPD No:</strong> {appointment.opdNo}</p>
                <p><strong>Last Visit:</strong> {appointment.pastAppointment}</p>
                <p><strong>Next Appointment:</strong> {appointment.nextAppointment}</p>
              </Card>
          )}
        />
      ) : searchTerm ? (
        <Empty description="No appointments found matching your search" />
      ) : (
        <Empty description="Enter search terms to find appointments" />
      )}
    </div>
    </div>
  );
};

export default AppointmentSearch;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './doctorlist.css';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/doctors', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setDoctors(response.data);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };

    fetchDoctors();
  }, []);

  const handleConsultationClick = (doctorId) => {
    navigate(`/consultation/${doctorId}`);
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">Medical Appointment</div>
        <div className="navbar-right">
          <button className="navbar-button" onClick={() => navigate('/replies')}>
            Replies
          </button>
        </div>
      </nav>

      {/* Doctor List */}
      <div className="doctor-list-container">
        <h1>Doctors</h1>
        <div className="doctor-cards-container">
          {doctors.map((doctor) => (
            <div className="doctor-card" key={doctor._id}>
              <img
                src={doctor.profilePicture || 'default-avatar.png'}
                alt={doctor.name}
              />
              <h2>{doctor.name}</h2>
              <p>{doctor.specialty}</p>
              <button onClick={() => handleConsultationClick(doctor._id)}>
                Get Consultation
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorList;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './doctorlist.css';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [showPatientDetails, setShowPatientDetails] = useState(false); // State to control modal visibility
  const [patientDetails, setPatientDetails] = useState(null); // Store patient details
  const [loadingDoctors, setLoadingDoctors] = useState(true); // Loading state for doctors
  const [loadingPatient, setLoadingPatient] = useState(false); // Loading state for patient details
  const [error, setError] = useState(null); // To store any errors
  const navigate = useNavigate();

  // Fetch doctors on page load
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/doctors', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setDoctors(response.data);
        setLoadingDoctors(false);
      } catch (error) {
        setError('Error fetching doctors');
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  // Fetch patient details from localStorage
  const fetchPatientDetails = async () => {
    const patientId = localStorage.getItem('patientId');
    if (patientId) {
      setLoadingPatient(true); // Set loading state to true
      try {
        const response = await axios.get(`http://localhost:5000/api/patients/${patientId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setPatientDetails(response.data);
        setShowPatientDetails(true); // Show the modal
        setLoadingPatient(false); // Set loading state to false
      } catch (error) {
        setError('Error fetching patient details');
        setLoadingPatient(false); // Set loading state to false
      }
    }
  };

  const handleConsultationClick = (doctorId) => {
    navigate(`/consultation/${doctorId}`);
  };

  const closeModal = () => {
    setShowPatientDetails(false); // Hide the modal
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">Medical Appointment</div>
        <div className="navbar-right">
          <button className="navbar-button" onClick={fetchPatientDetails}>
            View My Details
          </button>
          <button className="navbar-button" onClick={() => navigate('/replies')}>
            Replies
          </button>
        </div>
      </nav>

      {/* Error message */}
      {error && <div className="error-message">{error}</div>}

      {/* Doctor List */}
      <div className="doctor-list-container">
        <h1>Doctors</h1>
        {loadingDoctors ? (
          <p>Loading doctors...</p>
        ) : (
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
        )}
      </div>

      {/* Patient Details Modal */}
      {showPatientDetails && patientDetails && (
        <div className="modal-overlay">
          <div className="modal">
            {/* Patient Profile Picture */}
            <div className="patient-image-container">
              <img
                src={`http://localhost:5000/${patientDetails.profilePicture}`}
                alt={patientDetails.name}
                className="patient-image"
              />
            </div>
            <h2>{patientDetails.name}</h2>
            <p><strong>Age:</strong> {patientDetails.age}</p>
            <p><strong>Email:</strong> {patientDetails.email}</p>
            <p><strong>Phone:</strong> {patientDetails.phone}</p>
            <p><strong>History of Surgery:</strong> {patientDetails.historyOfSurgery}</p>
            <p><strong>History of Illness:</strong> {patientDetails.historyOfIllness}</p>
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}

      {/* Patient Details Loading */}
      {loadingPatient && <p>Loading patient details...</p>}
    </div>
  );
};

export default DoctorList;

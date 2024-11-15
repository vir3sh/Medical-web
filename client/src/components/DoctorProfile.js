import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; 
import './DoctorProfile.css'

const DoctorProfile = () => {
  const [doctorData, setDoctorData] = useState(null);

  useEffect(() => {
    const fetchDoctorData = async () => {
      const token = localStorage.getItem('doctorToken');
      if (!token) {
        // If no token, redirect to login
        window.location.href = '/';
        return;
      }

      try {
        // Decode the JWT token to extract doctorId
        const decodedToken = jwtDecode(token); 
        const doctorId = decodedToken.id;

        // Make the API request to fetch doctor profile using doctorId
        const response = await axios.get(`http://localhost:5000/api/doctors/${doctorId}`, {
          headers: { Authorization: `Bearer ${token}` }, // Pass the token in headers
        });

        // Set doctor data to state
        setDoctorData(response.data);
      } catch (error) {
        console.error('Error fetching doctor profile', error);
      }
    };

    fetchDoctorData();
  }, []);

  if (!doctorData) {
    return <div>Loading...</div>;
  }

  return (
    <>
     <div className="profile-container">
  <div className="profile-card">
    {/* Left Section: Image and Name */}
    <div className="profile-left">
      <img
        src={doctorData.profilePicture || 'https://via.placeholder.com/150'}
        alt="Doctor"
        className="profile-image"
      />
      <h1>{doctorData.name}</h1>
    </div>

    {/* Right Section: Details */}
    <div className="profile-right">
      <p><strong>Email:</strong> {doctorData.email}</p>
      <p><strong>Specialty:</strong> {doctorData.specialty}</p>
      <p><strong>Experience:</strong> {doctorData.yearsOfExperience} years</p>
      <p><strong>Phone:</strong> {doctorData.phone}</p>
      <button onClick={() => (window.location.href = '/prescriptions')}>
        Go to Prescription Page
      </button>
    </div>
  </div>
</div>

    </>
   
  );
};

export default DoctorProfile;

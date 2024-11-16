import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import for navigation
import axios from 'axios';
import './DoctorForm.css';

const DoctorRegister = () => {
  const [doctorDetails, setDoctorDetails] = useState({
    profilePictureURL: '', // For URL upload
    name: '',
    email: '',
    phone: '',
    specialty: '',
    yearsOfExperience: '',
    password: '',
  });

  const navigate = useNavigate(); // Initialize navigation

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDoctorDetails({ ...doctorDetails, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare the form data
    const formData = new FormData();
    for (let key in doctorDetails) {
      formData.append(key, doctorDetails[key]);
    }

    try {
      // Make the API request to register the doctor
      const response = await axios.post('http://localhost:5000/api/doctors/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Notify the user of successful registration
      alert('Doctor registered successfully');

      if (response.data.doctor) {
        const { id, name, profilePicture } = response.data.doctor;
        // Store doctor details in localStorage
        localStorage.setItem('doctorId', id);
        localStorage.setItem('doctorName', name);
        localStorage.setItem('doctorProfilePicture', profilePicture || '');
      }

      // Redirect to the doctor login page after successful registration
      navigate('/doctor-login'); // Navigate to the login page after registration
    } catch (error) {
      console.error(error);
      alert('Error registering doctor');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="doctor-form">
      <h2>Doctor Register</h2>

      <input
        type="text"
        name="name"
        placeholder="Name"
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="phone"
        placeholder="Phone"
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="specialty"
        placeholder="Specialty"
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="yearsOfExperience"
        placeholder="Years of Experience"
        step="0.1"
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
        required
      />

      {/* Only URL for profile picture */}
      <input
        type="url"
        name="profilePictureURL"
        placeholder="Profile Picture URL"
        onChange={handleChange}
      />

      <button type="submit">Register as Doctor</button>
    </form>
  );
};

export default DoctorRegister;

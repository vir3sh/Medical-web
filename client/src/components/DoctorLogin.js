import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import { useDoctor } from '../contexts/DoctorContext';  // Import the context hook
import './DoctorForm.css';

const DoctorLogin = () => {
  const [loginDetails, setLoginDetails] = useState({
    email: '',
    password: '',
  });
  
  const navigate = useNavigate(); // Initialize the navigate function
  const { login } = useDoctor(); // Get the login function from context

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginDetails({ ...loginDetails, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Sending login request to backend
      const response = await axios.post('http://localhost:5000/api/doctors/login', loginDetails);

      // Log the response data for debugging
      console.log(response.data);

      if (response.data.token) {
        // If token is returned, store it in localStorage and context
        localStorage.setItem('doctorToken', response.data.token);
        alert('Doctor logged in successfully');
        
        if (response.data.doctor) {
          const { id, name, email, profilePicture } = response.data.doctor;
          // Store doctor details in localStorage
          localStorage.setItem('doctorId', id);  // Store doctorId in localStorage
          localStorage.setItem('doctorName', name);  // Store doctorName
          localStorage.setItem('doctorEmail', email);  // Store doctorEmail
          localStorage.setItem('doctorProfilePicture', profilePicture || '');  // Store profile picture (if available)
          
          // Update context with doctorId
          login(id);
        }

        // Redirect to the doctor profile page
        navigate('/doctor-profile'); // Navigate to the doctor's profile page
      }
    } catch (error) {
      // Log the error response for better debugging
      console.error(error.response ? error.response.data : error.message);
      alert(error.response?.data?.message || 'Error logging in doctor');
    }
  };

  return (

    <>
    
    <form onSubmit={handleSubmit}>
    {/* <h2>
      Doctor Login 
    </h2>  */}
      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={handleChange}
        value={loginDetails.email}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
        value={loginDetails.password}
        required
      />
      <button type="submit">Login as Doctor</button>
    </form>
    </>
    
  );
};

export default DoctorLogin;

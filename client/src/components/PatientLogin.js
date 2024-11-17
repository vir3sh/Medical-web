import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PatientLogin = () => {
  const [loginDetails, setLoginDetails] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate(); // To navigate after login

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginDetails({ ...loginDetails, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/login', loginDetails);
      alert('Patient logged in successfully');

      

      const { id } = response.data.patient;  // Adjust according to the response data structure
      localStorage.setItem('patientId', id);  // Store the patient ID
      localStorage.setItem('token', response.data.token); // Optionally store the token
      console.log('Patient ID:', id); // To verify the ID is being stored correctly



      // Store the token in localStorage (or cookies)
      localStorage.setItem('token', response.data.token);

      // Redirect the patient to the doctors page
      navigate('/doctors');
    } catch (error) {
      alert('Error logging in');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
       <h2>Patient Login</h2>
      <input
        type="email"
        name="email"
        placeholder="Email"
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
      <button type="submit">Login as Patient</button>
    </form>
  );
};

export default PatientLogin;
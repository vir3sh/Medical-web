import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

const PatientRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    phone: '',
    historyOfSurgery: '',
    historyOfIllness: '',
    password: '',
    profilePicture: null
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate(); // Initialize the navigate function

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      profilePicture: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }

    try {
      const response = await axios.post('http://localhost:5000/api/register', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage(response.data.message);
      setError('');

      // Redirect to /doctors after successful registration
      navigate('/doctors'); // Redirect to the doctors page

    } catch (error) {
      setError(error.response?.data.message || 'Server Error');
      setMessage('');
    }
  };

  return (
    <div>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        {/* <h2>Patient Registration</h2> */}
        <div>
          <label>Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <label>Age</label>
          <input type="number" name="age" value={formData.age} onChange={handleChange} required />
        </div>
        <div>
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div>
          <label>Phone</label>
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
        </div>
        <div>
          <label>History of Surgery</label>
          <input type="text" name="historyOfSurgery" value={formData.historyOfSurgery} onChange={handleChange} required />
        </div>
        <div>
          <label>History of Illness</label>
          <input type="text" name="historyOfIllness" value={formData.historyOfIllness} onChange={handleChange} required />
        </div>
        <div>
          <label>Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <div>
          <label>Profile Picture</label>
          <input type="file" name="profilePicture" onChange={handleFileChange} />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default PatientRegister;

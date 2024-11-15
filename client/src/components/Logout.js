import React from 'react';
import { useDoctor } from '../contexts/DoctorContext';  // Import the context hook
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const { logout } = useDoctor();  // Get the logout function from context
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();  // Clear doctorId from context and localStorage
    navigate('/');  // Redirect to the login page
  };

  return (
    <div>
      <h2>Are you sure you want to log out?</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Logout;

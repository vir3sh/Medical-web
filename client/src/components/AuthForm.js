import React, { useState } from 'react';
import DoctorRegister from './DoctorRegister';
import DoctorLogin from './DoctorLogin';
import PatientRegister from './PatientRegister';
import PatientLogin from './PatientLogin';

function AuthPage() {
  const [isDoctor, setIsDoctor] = useState(true); // Toggle between Doctor and Patient
  const [isRegister, setIsRegister] = useState(true); // Toggle between Register and Login

  const toggleUserType = () => {
    setIsDoctor(!isDoctor); // Switch between Doctor and Patient
  };

  const toggleFormType = () => {
    setIsRegister(!isRegister); // Switch between Register and Login
  };

  return (
    <div className="auth-container">
      <h2>{isDoctor ? 'Doctor' : 'Patient'} {isRegister ? 'Register' : 'Login'}</h2>

      {/* Toggle buttons to switch between Doctor and Patient */}
      <div>
        <button onClick={toggleUserType}>
          {isDoctor ? 'Switch to Patient' : 'Switch to Doctor'}
        </button>
      </div>

      {/* Toggle buttons to switch between Register and Login */}
      <div>
        <button onClick={toggleFormType}>
          {isRegister ? 'Switch to Login' : 'Switch to Register'}
        </button>
      </div>

      {/* Conditional rendering for Doctor or Patient and Register or Login */}
      {isDoctor ? (
        isRegister ? (
          <DoctorRegister />
        ) : (
          <DoctorLogin />
        )
      ) : (
        isRegister ? (
          <PatientRegister />
        ) : (
          <PatientLogin />
        )
      )}
    </div>
  );
}

export default AuthPage;

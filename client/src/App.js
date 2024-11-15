import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AuthForm from './components/AuthForm';
import DoctorList from './components/DoctorList';
import { DoctorProvider } from './contexts/DoctorContext';  
import ConsultationForm from './components/ConsultationForm';
import DoctorProfile from './components/DoctorProfile';
import PrescriptionPage from './components/PrescriptionPage';
import RepliesPage from './components/RepliesPage'; // New Component for Replies
import ChatPage from './components/ChatPage'; // New Component for Chat

function App() {
  // Check if the doctor is logged in based on the JWT token
  const isDoctorLoggedIn = Boolean(localStorage.getItem('doctorToken'));

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('doctorToken'); // Clear the token
    window.location.href = '/'; // Redirect to login
  };

  return (
    <DoctorProvider>  {/* Wrap the app inside the DoctorProvider */}
      <Router>
        <Routes>
          {/* Route for the doctor login form */}
          <Route path="/" element={<AuthForm />} />

          {/* Protected route for the doctor's profile */}
          <Route
            path="/doctor-profile"
            element={
              isDoctorLoggedIn ? (
                <DoctorProfile />
              ) : (
                <Navigate to="/" /> // Redirect to login if not logged in
              )
            }
          />

          {/* Route for viewing doctors */}
          <Route
            path="/doctors"
            element={
              isDoctorLoggedIn ? (
                <DoctorList />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* Route for the consultation form for a specific doctor */}
          <Route
            path="/consultation/:doctorId"
            element={
              isDoctorLoggedIn ? (
                <ConsultationForm />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* Protected route for prescriptions */}
          <Route
            path="/prescriptions"
            element={
              isDoctorLoggedIn ? (
                <PrescriptionPage />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* Route for viewing replies from patients */}
          <Route
            path="/replies"
            element={
              isDoctorLoggedIn ? (
                <RepliesPage />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* Route for chatting with a patient */}
          <Route
            path="/chat/:doctorId"
            element={
              isDoctorLoggedIn ? (
                <ChatPage />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* Logout route as a simple page with a logout button */}
          <Route
            path="/logout"
            element={
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
                <h2>Are you sure you want to log out?</h2>
                <button onClick={handleLogout} style={{ padding: '10px 20px', fontSize: '16px' }}>
                  Logout
                </button>
              </div>
            }
          />
        </Routes>
      </Router>
    </DoctorProvider>
  );
}

export default App;

import React, { createContext, useState, useContext } from 'react';

const DoctorContext = createContext();

export const useDoctor = () => useContext(DoctorContext);

export const DoctorProvider = ({ children }) => {
  const [doctorId, setDoctorId] = useState(localStorage.getItem('doctorId') || null);

  const login = (id) => {
    setDoctorId(id);  // Set doctorId in context
    localStorage.setItem('doctorId', id);  // Store doctorId in localStorage
  };

  const logout = () => {
    setDoctorId(null);  // Remove doctorId from context
    localStorage.removeItem('doctorId');  // Remove doctorId from localStorage
  };

  return (
    <DoctorContext.Provider value={{ doctorId, login, logout }}>
      {children}
    </DoctorContext.Provider>
  );
};

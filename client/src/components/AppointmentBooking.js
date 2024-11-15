// src/components/AppointmentBooking.js

import React, { useState } from 'react';
import axios from 'axios';

const AppointmentBooking = () => {
  const [doctorId, setDoctorId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [patientNotes, setPatientNotes] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/appointments', {
        doctorId,
        appointmentDate,
        patientNotes,
      });
      alert(response.data.message);
    } catch (error) {
      console.error('Error booking appointment:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Book an Appointment</h2>
      <label>
        Doctor ID:
        <input type="text" value={doctorId} onChange={(e) => setDoctorId(e.target.value)} required />
      </label>
      <label>
        Appointment Date:
        <input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} required />
      </label>
      <label>
        Notes:
        <textarea value={patientNotes} onChange={(e) => setPatientNotes(e.target.value)} />
      </label>
      <button type="submit">Book Appointment</button>
    </form>
  );
};

export default AppointmentBooking;

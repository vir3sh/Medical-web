// src/components/DoctorDashboard.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [prescription, setPrescription] = useState({ care: '', medicine: '' });
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get('/api/doctor/appointments');
        setAppointments(response.data.appointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };
    fetchAppointments();
  }, []);

  const handleSendPrescription = async (appointmentId) => {
    try {
      const response = await axios.post(`/api/doctor/sendPrescription/${appointmentId}`, {
        ...prescription,
      });
      alert(response.data.message);
    } catch (error) {
      console.error('Error sending prescription:', error);
    }
  };

  return (
    <div>
      <h2>Doctor's Dashboard</h2>
      <h3>Appointments</h3>
      <ul>
        {appointments.map((appointment) => (
          <li key={appointment._id}>
            {appointment.patientName} - {appointment.date}
            <button onClick={() => setSelectedAppointment(appointment)}>View / Send Prescription</button>
          </li>
        ))}
      </ul>

      {selectedAppointment && (
        <div>
          <h3>Send Prescription</h3>
          <label>
            Care to be taken:
            <textarea value={prescription.care} onChange={(e) => setPrescription({ ...prescription, care: e.target.value })} />
          </label>
          <label>
            Medicine:
            <textarea value={prescription.medicine} onChange={(e) => setPrescription({ ...prescription, medicine: e.target.value })} />
          </label>
          <button onClick={() => handleSendPrescription(selectedAppointment._id)}>Send Prescription</button>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;

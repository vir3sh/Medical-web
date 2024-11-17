import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import for navigation
import axios from 'axios';
import './admin.css'

const AdminPanel = () => {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialty: '',
    phone: '',
    yearsOfExperience: '',
    age: '',
  });

  const navigate = useNavigate(); // For navigation

  // Fetch doctors and patients data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorRes, patientRes] = await Promise.all([
          axios.get('http://localhost:5000/api/doctors'),
          axios.get('http://localhost:5000/api/patients'),
        ]);
        setDoctors(doctorRes.data);
        setPatients(patientRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Edit Handlers
  const handleEditDoctor = (id) => {
    const doctor = doctors.find((doc) => doc._id === id);
    setCurrentEdit({ id, type: 'doctor' });
    setFormData({
      name: doctor.name,
      email: doctor.email,
      specialty: doctor.specialty,
      phone: doctor.phone,
      yearsOfExperience: doctor.yearsOfExperience,
    });
    setEditMode(true);
  };

  const handleEditPatient = (id) => {
    const patient = patients.find((pat) => pat._id === id);
    setCurrentEdit({ id, type: 'patient' });
    setFormData({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      age: patient.age,
    });
    setEditMode(true);
  };

  // Save Edited Data
  const handleSaveEdit = async () => {
    try {
      if (currentEdit.type === 'doctor') {
        await axios.put(`http://localhost:5000/api/doctors/${currentEdit.id}`, formData);
      } else if (currentEdit.type === 'patient') {
        await axios.put(`http://localhost:5000/api/patients/${currentEdit.id}`, formData);
      }
      setEditMode(false);
      setCurrentEdit(null);
      // Refresh the data
      const [doctorRes, patientRes] = await Promise.all([
        axios.get('http://localhost:5000/api/doctors'),
        axios.get('http://localhost:5000/api/patients'),
      ]);
      setDoctors(doctorRes.data);
      setPatients(patientRes.data);
    } catch (error) {
      console.error('Error saving edit:', error);
    }
  };

  // Delete Handlers
  const handleDeleteDoctor = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/doctors/${id}`);
      setDoctors(doctors.filter((doc) => doc._id !== id));
    } catch (error) {
      console.error('Error deleting doctor:', error);
    }
  };

  const handleDeletePatient = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/patients/${id}`);
      setPatients(patients.filter((pat) => pat._id !== id));
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
  };

  // Add Handlers
  const handleAddDoctor = () => {
    navigate('/register-doctor');
  };

  const handleAddPatient = () => {
    navigate('/register-patient');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Admin Panel</h1>

      {editMode ? (
        <div>
          <h2>Edit {currentEdit.type}</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveEdit();
            }}
          >
            <div>
              <label>Name:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Email:</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Phone:</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            {currentEdit.type === 'doctor' && (
              <>
                <div>
                  <label>Specialty:</label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label>Years of Experience:</label>
                  <input
                    type="number"
                    value={formData.yearsOfExperience}
                    onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                    required
                  />
                </div>
              </>
            )}
            {currentEdit.type === 'patient' && (
              <div>
                <label>Age:</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                />
              </div>
            )}
            <button type="submit">Save</button>
            <button type="button" onClick={() => setEditMode(false)}>Cancel</button>
          </form>
        </div>
      ) : (
        <div>
          <h2>Doctors</h2>
          <button onClick={handleAddDoctor}>Add Doctor</button>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Specialty</th>
                <th>Years of Experience</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor._id}>
                  <td>{doctor.name}</td>
                  <td>{doctor.email}</td>
                  <td>{doctor.phone}</td>
                  <td>{doctor.specialty}</td>
                  <td>{doctor.yearsOfExperience}</td>
                  <td>
                    <button onClick={() => handleEditDoctor(doctor._id)}>Edit</button>
                    <button onClick={() => handleDeleteDoctor(doctor._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2>Patients</h2>
          <button onClick={handleAddPatient}>Add Patient</button>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Age</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient._id}>
                  <td>{patient.name}</td>
                  <td>{patient.email}</td>
                  <td>{patient.phone}</td>
                  <td>{patient.age}</td>
                  <td>
                    <button onClick={() => handleEditPatient(patient._id)}>Edit</button>
                    <button onClick={() => handleDeletePatient(patient._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

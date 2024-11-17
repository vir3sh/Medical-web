import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './consultationform.css';

const ConsultationForm = () => {
  const { doctorId } = useParams(); // Get doctorId from URL
  const navigate = useNavigate(); // Initialize the navigate function
  const patientId = localStorage.getItem('patientId'); // Get patient ID from localStorage (assuming it's stored after login)
  const [step, setStep] = useState(1); // Manage form steps
  const [formData, setFormData] = useState({
    illnessHistory: '',
    recentSurgery: '',
    isDiabetic: '',
    allergies: '',
    others: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleKeyPress = (e) => {
    // Prevent form submission when pressing Enter
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Ensure all steps are completed
    if (!formData.illnessHistory || !formData.recentSurgery || !formData.isDiabetic || !formData.allergies || !formData.others) {
      alert('Please complete all form fields before submitting.');
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/messages/${doctorId}`, // Send to backend with doctor ID
        { ...formData, patientId }, // Include patientId in request body
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Include token for authentication
          },
        }
      );
      alert('Message sent successfully!');
      navigate('/doctors'); // Navigate to the DoctorList after submission
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send the message.');
    }
  };

  return (
    <div className="consultation-form-container">
      <h1>Consultation Form</h1>
      <form onSubmit={handleSubmit} onKeyDown={handleKeyPress}>
        {step === 1 && (
          <div className="form-step">
            <h2>Step 1: Current Illness History</h2>
            <textarea
              name="illnessHistory"
              placeholder="Describe your current illness history..."
              value={formData.illnessHistory}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="recentSurgery"
              placeholder="Recent surgery (include time span)..."
              value={formData.recentSurgery}
              onChange={handleChange}
              required
            />
            <button type="button" onClick={() => setStep(2)}>
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="form-step">
            <h2>Step 2: Family Medical History</h2>
            <div>
              <label>
                <input
                  type="radio"
                  name="isDiabetic"
                  value="Diabetic"
                  checked={formData.isDiabetic === 'Diabetic'}
                  onChange={handleChange}
                  required
                />
                Diabetic
              </label>
              <label>
                <input
                  type="radio"
                  name="isDiabetic"
                  value="Non-Diabetic"
                  checked={formData.isDiabetic === 'Non-Diabetic'}
                  onChange={handleChange}
                  required
                />
                Non-Diabetic
              </label>
            </div>
            <textarea
              name="allergies"
              placeholder="List any allergies..."
              value={formData.allergies}
              onChange={handleChange}
              required
            />
            <textarea
              name="others"
              placeholder="Other relevant details..."
              value={formData.others}
              onChange={handleChange}
              required
            />
            <button type="button" onClick={() => setStep(1)}>
              Back
            </button>
            <button type="submit">Submit</button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ConsultationForm;

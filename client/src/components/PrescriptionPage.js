import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useDoctor } from '../contexts/DoctorContext'; // Context to fetch doctorId
import './PrescriptionPage.css';
import jsPDF from "jspdf";

const PrescriptionPage = () => {
  const { doctorId } = useDoctor(); // Extract doctorId from context
  const [messages, setMessages] = useState([]);
  const [doctorName, setDoctorName] = useState(''); // State for doctor's name
  const [replyMessage, setReplyMessage] = useState(null);
  const [prescriptionData, setPrescriptionData] = useState({
    careToBeTaken: '',
    medicines: '',
  });

  // Fetch doctor's name when component loads
  useEffect(() => {
    const fetchDoctorName = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/doctors/${doctorId}`);
        setDoctorName(response.data.name); // Assuming response contains { name: 'Doctor Name' }
      } catch (error) {
        console.error('Error fetching doctor name:', error);
        setDoctorName(`Dr. ${doctorId}`); // Fallback to doctorId
      }
    };

    if (doctorId) {
      fetchDoctorName();
    }
  }, [doctorId]);

  // Fetch consultation messages for the doctor
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/messages/${doctorId}`);
        setMessages(response.data); // Load fetched messages into state
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    if (doctorId) {
      fetchMessages();
    }
  }, [doctorId]);

  // Handle input changes for the prescription form
  const handleReplyChange = (e) => {
    const { name, value } = e.target;
    setPrescriptionData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle submission of a reply (prescription)
  const handleReplySubmit = async (e, messageId, patientId) => {
    e.preventDefault();

    // Input validation
    if (!prescriptionData.careToBeTaken || !prescriptionData.medicines) {
      alert('Please fill in all the fields.');
      return;
    }

    const currentDate = new Date().toISOString(); // Capture current date and time
    const replyData = {
      careToBeTaken: prescriptionData.careToBeTaken,
      medicines: prescriptionData.medicines,
      replyDate: currentDate,
      doctorId,
      patientId,
      doctorName, // Use doctor's name
    };

    try {
      // Send reply data to the backend
      await axios.post(
        `http://localhost:5000/api/messages/reply/${messageId}`,
        replyData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      alert('Reply sent successfully!');
      setReplyMessage(null); // Close reply form

      // Automatically generate PDF after sending the reply
      generatePDF({ patientId, illnessHistory: messageId.illnessHistory, ...replyData }, prescriptionData);
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send the reply.');
    }
  };

  // Generate a PDF of the prescription
  const generatePDF = (message, prescription) => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text(`Dr. ${doctorName}`, 10, 10);
    doc.text("Date:", 150, 10); // Date
    doc.text(new Date().toLocaleDateString(), 150, 16);
    
    // Add Blue Line
    doc.setDrawColor(0, 0, 128); // Dark Blue color
    doc.setLineWidth(1);
    doc.line(10, 28, 200, 28); // Horizontal line
    
    // Add "Care to be Taken" Section
    doc.setFontSize(12);
    doc.text("Care to be taken", 10, 35);
    doc.setDrawColor(0);
    doc.rect(10, 38, 180, 30); 
    doc.text(prescription.careToBeTaken, 12, 50); 
    
    // Add "Medicine" Section
    doc.text("Medicine", 10, 80);
    doc.rect(10, 83, 180, 30); 
    doc.text(prescription.medicines, 12, 95); 
    
    // Add Footer Section
    doc.setDrawColor(0, 0, 128);
    doc.line(10, 120, 200, 120); 
    doc.text(doctorName, 150, 130); 
    
    // Save the PDF
    doc.save("doctor-prescription.pdf");
  };

  const noConsultations = messages.length === 0 || !messages.some((message) => message.patientId);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Consultation</h1>

      {/* Display message when no consultations exist */}
      {noConsultations ? (
        <h5>No consultations available.</h5>
      ) : (
        <div className="message-list">
          {messages.map((message) => (
            message.patientId && (
              <div key={message._id} className="message-card" style={cardStyles}>
                <h3>Name: {message.patientId.name}</h3>
                <p><strong>Illness History:</strong> {message.illnessHistory}</p>
                <p><strong>Recent Surgery:</strong> {message.recentSurgery}</p>
                <p><strong>Diabetic Status:</strong> {message.isDiabetic ? 'Yes' : 'No'}</p>
                <p><strong>Allergies:</strong> {message.allergies}</p>
                <p><strong>Other Info:</strong> {message.others}</p>
                <p><strong>Sent At:</strong> {new Date(message.sentAt).toLocaleString()}</p>

                <button
                  onClick={() => setReplyMessage(message._id)}
                  className="reply-button"
                >
                  Reply
                </button>

                {replyMessage === message._id && (
                  <form onSubmit={(e) => handleReplySubmit(e, message._id, message.patientId._id)}>
                    <div className="reply-form">
                      <h4>Prescription Reply</h4>
                      <textarea
                        name="careToBeTaken"
                        placeholder="Care to be taken..."
                        value={prescriptionData.careToBeTaken}
                        onChange={handleReplyChange}
                        required
                      />
                      <textarea
                        name="medicines"
                        placeholder="Medicines..."
                        value={prescriptionData.medicines}
                        onChange={handleReplyChange}
                        required
                      />
                      <div className="form-buttons">
                        <button type="submit">Send Reply</button>
                        <button
                          type="button"
                          onClick={() => setReplyMessage(null)}
                          className="cancel-button"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => generatePDF(message, prescriptionData)}
                          className="pdf-button"
                        >
                          Generate PDF
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
};

// Styles for the message card
const cardStyles = {
  backgroundColor: '#f9f9f9',
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: '15px',
  marginBottom: '15px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  maxWidth: '600px',
  width: '100%',
};

export default PrescriptionPage;

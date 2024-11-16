import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useDoctor } from '../contexts/DoctorContext';  // Import the context hook
import './PrescriptionPage.css';

const PrescriptionPage = () => {
  const { doctorId } = useDoctor();  // Access doctorId from context
  const [messages, setMessages] = useState([]);
  const [replyMessage, setReplyMessage] = useState(null);  // To manage the reply form visibility
  const [prescriptionData, setPrescriptionData] = useState({
    careToBeTaken: '',
    medicines: '',
  });

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/messages/${doctorId}`);
        setMessages(response.data);  // Set the messages from the response
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    if (doctorId) {
      fetchMessages();  // Fetch messages when doctorId is available
    }
  }, [doctorId]);

  const handleReplyChange = (e) => {
    const { name, value } = e.target;
    setPrescriptionData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleReplySubmit = async (e, messageId, patientId) => {
    e.preventDefault();
  
    // Validate input
    if (!prescriptionData.careToBeTaken || !prescriptionData.medicines) {
      alert('Please fill in all the fields');
      return;
    }
  
    const currentDate = new Date().toISOString();
    const replyData = {
      careToBeTaken: prescriptionData.careToBeTaken,
      medicines: prescriptionData.medicines,
      replyDate: currentDate,
      doctorId,
      patientId,
      doctorName: 'Dr. ' + doctorId,
    };
  
    try {
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
      setReplyMessage(null);
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send the reply.');
    }
  };

  // Check if there are no valid messages or no patientIds
  const noConsultations = messages.length === 0 || !messages.some(message => message.patientId);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Consultation</h1>
      
      {/* Display message when there are no consultations */}
      {noConsultations ? (
        <h5>No consultations available.</h5> 
      ) : (
        <div className="message-list">
          {messages.map((message) => (
            message.patientId && (  // Ensure there's a valid patientId
              <div key={message._id} className="message-card" style={cardStyles}>
                <h3>Name:{message.patientId.name}</h3>
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
                      <button type="submit">Send Reply</button>
                      <button
                        type="button"
                        onClick={() => setReplyMessage(null)}
                        className="cancel-button"
                      >
                        Cancel
                      </button>
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

// Styling for the message card
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

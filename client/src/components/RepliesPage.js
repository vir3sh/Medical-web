import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RepliesPage.css';

const RepliesPage = () => {
  const patientId = localStorage.getItem('patientId');  // Get the patient ID from localStorage
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(''); // Error state

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/messages/replies/patient/${patientId}`);
        const sortedReplies = response.data.sort((a, b) => new Date(b.replyDate) - new Date(a.replyDate)); // Sort replies in descending order
        setReplies(sortedReplies);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        if (error.response && error.response.status === 404) {
          setErrorMessage('No replies found for this patient.');
        } else {
          setErrorMessage('Error fetching replies.');
        }
        console.error('Error fetching replies:', error);
      }
    };
    
    

    if (patientId) {
      fetchReplies(); // Fetch replies when patientId is available
    }
  }, [patientId]);

  return (
    <div className="replies-page">
      <h1>Replies From Doctor</h1>
      {loading && <p>Loading replies...</p>}
      {errorMessage && <p>{errorMessage}</p>} {/* Display error message */}
      <div className="replies-list">
        {replies.length > 0 ? (
          replies.map((reply, index) => (
            <div key={index} className="reply-card">
              <h3>Doctor: {reply.doctorName}</h3> {/* Display the doctor's name */}
              <p><strong>Care to be taken:</strong> {reply.careToBeTaken}</p>
              <p><strong>Medicines:</strong> {reply.medicines}</p>
              <p><strong>Reply Date:</strong> {new Date(reply.replyDate).toLocaleString()}</p>
            </div>
          ))
        ) : (
          <p>No replies found for this patient.</p>
        )}
      </div>
    </div>
  );
};

export default RepliesPage;

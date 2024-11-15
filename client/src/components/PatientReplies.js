import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PatientReplies = () => {
  const [messages, setMessages] = useState([]);
  const userId = '12345'; // Example user ID (could come from localStorage, context, or props)

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // Send the userId as a query parameter in the API request
        const response = await axios.get(`http://localhost:5000/api/messages/replies?userId=${userId}`);
        setMessages(response.data);  // Set the messages returned from the backend
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();  // Fetch messages when the component mounts
  }, [userId]);

  return (
    <div>
      <h1>Your Messages and Replies</h1>
      {messages.length === 0 ? (
        <p>No replies yet.</p>
      ) : (
        messages.map((message) => (
          <div key={message._id} style={messageCardStyles}>
            <h3>Message from Dr. {message.doctorName}</h3>
            <p><strong>Illness History:</strong> {message.illnessHistory}</p>
            <p><strong>Recent Surgery:</strong> {message.recentSurgery}</p>
            <p><strong>Allergies:</strong> {message.allergies}</p>
            <p><strong>Reply:</strong> {message.replies ? message.replies.map(reply => (
              <p key={reply._id}><strong>{reply.replyDate}:</strong> {reply.medicines}</p>
            )) : "No replies yet"}</p>
          </div>
        ))
      )}
    </div>
  );
};

// Styling for message cards
const messageCardStyles = {
  backgroundColor: '#f9f9f9',
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: '15px',
  marginBottom: '15px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
};

export default PatientReplies;

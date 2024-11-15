import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
// import './ChatPage.css';

const ChatPage = () => {
  const { patientId } = useParams(); // Get patientId from the URL params
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // Fetch all messages for the specific patient
        const response = await axios.get(`http://localhost:5000/api/messages/${patientId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('patientToken')}`, // Assuming patientToken is used for auth
          },
        });
        setMessages(response.data); // Store all the messages
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [patientId]); // Re-fetch when patientId changes

  return (
    <div className="chat-page">
      <h1>Messages for Patient {patientId}</h1>
      <div className="messages-list">
        {messages.length > 0 ? (
          messages.map((message) => (
            <div key={message._id} className="message-card">
              <p><strong>From Doctor {message.doctorId.name} ({message.doctorId.specialty}):</strong></p>
              <p>{message.message}</p>
              <p><strong>Sent at:</strong> {new Date(message.sentAt).toLocaleString()}</p>
            </div>
          ))
        ) : (
          <p>No messages found.</p>
        )}
      </div>
    </div>
  );
};

export default ChatPage;

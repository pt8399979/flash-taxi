import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authService';
import { FiArrowLeft, FiSend } from 'react-icons/fi';
import '../styles/main.css';

const SupportChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! How can we help you today?",
      sender: 'support',
      time: new Date().toLocaleTimeString()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: newMessage,
      sender: 'user',
      time: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setLoading(true);

    // Simulate support response
    setTimeout(() => {
      const supportMessage = {
        id: Date.now() + 1,
        text: getAutoResponse(newMessage),
        sender: 'support',
        time: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, supportMessage]);
      setLoading(false);
    }, 2000);
  };

  const getAutoResponse = (message) => {
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('ride') || lowerMsg.includes('book')) {
      return "To book a ride, go to the home page and click on 'Book a Ride'. You'll need to enter your pickup and dropoff locations.";
    } else if (lowerMsg.includes('price') || lowerMsg.includes('fare')) {
      return "Our fares are calculated based on distance and time. Base fare starts at ₹50, with ₹15 per km and ₹2 per minute.";
    } else if (lowerMsg.includes('cancel')) {
      return "You can cancel your ride from the tracking screen. Please note that cancellation fees may apply after driver assignment.";
    } else if (lowerMsg.includes('payment')) {
      return "We accept cash, credit/debit cards, and digital wallets. You can set your preferred payment method in Profile settings.";
    } else {
      return "Thank you for contacting support. A representative will assist you shortly. For urgent issues, please call our 24/7 helpline.";
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft />
        </button>
        <div className="header-info">
          <h1>Support Chat</h1>
          <p className="online-status">● Online</p>
        </div>
      </div>

      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender === 'user' ? 'user-message' : 'support-message'}`}
          >
            <div className="message-content">
              <p>{message.text}</p>
              <span className="message-time">{message.time}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="message support-message">
            <div className="message-content typing">
              <span>.</span><span>.</span><span>.</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-input-container">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button type="submit" disabled={!newMessage.trim() || loading}>
          <FiSend />
        </button>
      </form>
    </div>
  );
};

export default SupportChat;
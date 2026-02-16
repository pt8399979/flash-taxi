import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authService';
import { FiMail, FiPhone, FiCalendar, FiArrowLeft } from 'react-icons/fi';
import '../styles/main.css';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft />
        </button>
        <div className="profile-avatar">
          {user?.email?.charAt(0).toUpperCase()}
        </div>
        <h1>{user?.email?.split('@')[0]}</h1>
        <p className="member-since">Member since {new Date().toLocaleDateString()}</p>
      </div>

      <div className="profile-details">
        <h2>Profile Details</h2>
        
        <div className="detail-item">
          <FiMail className="detail-icon" />
          <div className="detail-content">
            <label>Email</label>
            <p>{user?.email}</p>
          </div>
        </div>

        <div className="detail-item">
          <FiPhone className="detail-icon" />
          <div className="detail-content">
            <label>Phone</label>
            <p>Not added yet</p>
          </div>
        </div>

        <div className="detail-item">
          <FiCalendar className="detail-icon" />
          <div className="detail-content">
            <label>Joined</label>
            <p>{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <span className="stat-value">0</span>
          <span className="stat-label">Rides</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">0</span>
          <span className="stat-label">Km</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">0</span>
          <span className="stat-label">Hours</span>
        </div>
      </div>
    </div>
  );
};

export default Profile;
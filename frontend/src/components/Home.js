import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authService';
import { FiLogOut, FiUser, FiClock, FiMapPin } from 'react-icons/fi';
import Map from './Map';
import '../styles/main.css';

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Default to Delhi if location access denied
          setUserLocation({ lat: 28.6139, lng: 77.2090 });
        }
      );
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <span className="brand-icon">🚖</span>
          <span className="brand-name">TaxiGo</span>
        </div>
        
        <div className="nav-menu">
          <button className="profile-btn" onClick={() => navigate('/profile')}>
            <FiUser />
            <span>{user?.email?.split('@')[0]}</span>
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut />
          </button>
        </div>
      </nav>

      {/* Main Content - Split Layout like professional apps */}
      <div className="home-layout">
        {/* Left Side - Map (70% width) */}
        <div className="map-section">
          <Map 
            driverLocation={userLocation}
            height="100%"
            interactive={true}
          />
          
          {/* Floating action button */}
          <button 
            className="floating-book-btn"
            onClick={() => navigate('/book-ride')}
          >
            Book Now
          </button>
        </div>

        {/* Right Side - Info Panel (30% width) */}
        <div className="info-panel">
          <div className="welcome-card">
            <h2>Welcome back, {user?.email?.split('@')[0]}!</h2>
            <p>Where would you like to go today?</p>
          </div>

          <div className="quick-actions">
            <button className="book-ride-btn" onClick={() => navigate('/book-ride')}>
              <span className="btn-icon">🚗</span>
              <span className="btn-text">Book a Ride</span>
            </button>
            
            <button className="support-btn" onClick={() => navigate('/support')}>
              <span className="btn-icon">💬</span>
              <span className="btn-text">Support</span>
            </button>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚗</div>
              <h3>Fast & Reliable</h3>
              <p>Get picked up within minutes</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Best Prices</h3>
              <p>Transparent fare estimation</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Safe Rides</h3>
              <p>Verified drivers</p>
            </div>
          </div>

          <div className="recent-section">
            <h3>Recent Rides</h3>
            <div className="empty-state">
              <FiClock size={30} />
              <p>No rides yet. Book your first ride!</p>
            </div>
          </div>

          <div className="quick-locations">
            <h3>Quick Pick</h3>
            <div className="location-chips">
              <button className="location-chip">
                <FiMapPin /> Home
              </button>
              <button className="location-chip">
                <FiMapPin /> Work
              </button>
              <button className="location-chip">
                <FiMapPin /> Airport
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
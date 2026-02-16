import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/authService';
import socketService from '../services/socketService';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiPhone, FiMessageCircle } from 'react-icons/fi';
import Map from './Map';
import '../styles/main.css';

const RideTracking = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [rideStatus, setRideStatus] = useState('accepted');
  const [driver, setDriver] = useState({
    name: 'Rajesh Kumar',
    rating: 4.8,
    vehicle: 'Swift Dzire',
    number: 'DL 01 AB 1234',
    phone: '+91 98765 43210'
  });
  const [driverLocation, setDriverLocation] = useState(
    location.state?.driverLocation || { lat: 28.6139, lng: 77.2090 }
  );
  const [pickup] = useState(location.state?.pickup || { lat: 28.6129, lng: 77.2080 });
  const [dropoff] = useState(location.state?.dropoff || { lat: 28.6149, lng: 77.2100 });
  const [eta, setEta] = useState(5);

  useEffect(() => {
    // Connect to socket
    const socket = socketService.connect();
    socketService.joinRide(rideId);

    // Simulate driver movement
    const interval = setInterval(() => {
      setDriverLocation(prev => ({
        lat: prev.lat + 0.0001,
        lng: prev.lng + 0.0001
      }));
      setEta(prev => Math.max(1, prev - 1));
    }, 5000);

    return () => {
      clearInterval(interval);
      socketService.leaveRide(rideId);
    };
  }, [rideId]);

  const handleCallDriver = () => {
    if (driver?.phone) {
      window.location.href = `tel:${driver.phone}`;
    }
  };

  const handleCancelRide = () => {
    if (window.confirm('Are you sure you want to cancel this ride?')) {
      toast.success('Ride cancelled');
      navigate('/');
    }
  };

  return (
    <div className="tracking-page">
      <div className="tracking-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft />
        </button>
        <h1>Track Your Ride</h1>
      </div>

      <div className="tracking-layout">
        {/* Left Side - Map (70%) */}
        <div className="tracking-map-section">
          <Map 
            pickup={pickup}
            dropoff={dropoff}
            driverLocation={driverLocation}
            showRoute={true}
            height="100%"
          />
        </div>

        {/* Right Side - Driver Info (30%) */}
        <div className="tracking-info-section">
          <div className="status-section">
            <div className={`status-badge ${rideStatus}`}>
              Driver is on the way
            </div>
          </div>

          <div className="driver-info-card">
            <div className="driver-details">
              <div className="driver-avatar">
                {driver.name.charAt(0)}
              </div>
              <div className="driver-detail">
                <h3>{driver.name}</h3>
                <div className="rating">⭐ {driver.rating}</div>
                <p>{driver.vehicle}</p>
                <p className="vehicle-number">{driver.number}</p>
              </div>
            </div>

            <div className="eta-info">
              <span className="eta-label">Estimated arrival</span>
              <span className="eta-value">{eta} min</span>
            </div>

            <div className="driver-actions">
              <button className="call-btn" onClick={handleCallDriver}>
                <FiPhone />
                Call Driver
              </button>
              <button className="message-btn">
                <FiMessageCircle />
                Message
              </button>
            </div>
          </div>

          <div className="trip-details">
            <h3>Trip Details</h3>
            <div className="detail-row">
              <span>Pickup:</span>
              <span>Your Location</span>
            </div>
            <div className="detail-row">
              <span>Dropoff:</span>
              <span>Destination</span>
            </div>
          </div>

          {rideStatus !== 'completed' && (
            <button className="cancel-btn" onClick={handleCancelRide}>
              Cancel Ride
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RideTracking;
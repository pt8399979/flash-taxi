import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authService';
import { toast } from 'react-hot-toast';
import { FiMapPin, FiNavigation, FiArrowLeft } from 'react-icons/fi';
import Map from './Map';
import api from '../services/api';
import '../styles/main.css';

const TOMTOM_API_KEY = 'G66jjsZWdScxvz01UtgCDMwVSqj7cIEp';

const RideBooking = () => {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [rideType, setRideType] = useState('economy');
  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [estimatedFare, setEstimatedFare] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  const rideTypes = [
    { id: 'economy', name: 'Economy', baseFare: 50, icon: '🚗', multiplier: 1 },
    { id: 'comfort', name: 'Comfort', baseFare: 80, icon: '🚙', multiplier: 1.5 },
    { id: 'premium', name: 'Premium', baseFare: 120, icon: '🚘', multiplier: 2 }
  ];

  useEffect(() => {
    // Get user's current location for pickup default
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(coords);
          setPickupCoords(coords);
          
          // Reverse geocode to get address
          try {
            const response = await fetch(
              `https://api.tomtom.com/search/2/reverseGeocode/${coords.lat},${coords.lng}.json?key=${TOMTOM_API_KEY}`
            );
            const data = await response.json();
            if (data.addresses && data.addresses[0]) {
              setPickup(data.addresses[0].address.freeformAddress);
            }
          } catch (error) {
            console.error('Reverse geocode error:', error);
            setPickup('Connaught Place, New Delhi'); // Default fallback
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setPickup('Connaught Place, New Delhi'); // Default fallback
        }
      );
    }
  }, []);

  const geocodeAddress = async (address) => {
    try {
      console.log('📍 Geocoding:', address);
      const response = await fetch(
        `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(address)}.json?key=${TOMTOM_API_KEY}&countrySet=IN&limit=1`
      );
      const data = await response.json();
      console.log('📥 Geocode response:', data);
      
      if (data.results && data.results[0]) {
        const result = data.results[0];
        return {
          lat: result.position.lat,
          lng: result.position.lon,
          address: result.address.freeformAddress
        };
      }
      return null;
    } catch (error) {
      console.error('❌ Geocode error:', error);
      return null;
    }
  };

  const handlePickupChange = async (e) => {
    const value = e.target.value;
    setPickup(value);
    
    if (value.length > 3) {
      const coords = await geocodeAddress(value);
      if (coords) {
        setPickupCoords(coords);
        setPickup(coords.address);
      }
    }
  };

  const handleDropoffChange = async (e) => {
    const value = e.target.value;
    setDropoff(value);
    
    if (value.length > 3) {
      const coords = await geocodeAddress(value);
      if (coords) {
        setDropoffCoords(coords);
        setDropoff(coords.address);
      }
    }
  };

  const calculateEstimate = async () => {
    if (!pickup || !dropoff) {
      toast.error('Please enter both locations');
      return;
    }

    setEstimating(true);
    try {
      console.log('📝 Calculating estimate for:', { pickup, dropoff });
      
      const response = await api.post('/rides/estimate', {
        pickupAddress: pickup,
        dropoffAddress: dropoff
      });

      console.log('📥 Estimate response:', response.data);

      if (response.data.success) {
        setEstimatedFare(response.data.estimate);
        toast.success('Fare estimated successfully');
      }
    } catch (error) {
      console.error('❌ Estimate error:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Failed to calculate estimate');
    } finally {
      setEstimating(false);
    }
  };

  const handleBookRide = async () => {
    if (!pickupCoords || !dropoffCoords) {
      toast.error('Please enter valid locations');
      return;
    }

    setLoading(true);
    try {
      console.log('📝 Booking ride:', { pickup, dropoff });
      
      const response = await api.post('/rides/request', {
        pickupAddress: pickup,
        dropoffAddress: dropoff
      });

      console.log('📥 Booking response:', response.data);

      if (response.data.success) {
        toast.success('🎉 Ride booked successfully!');
        
        // Navigate to tracking page with ride details
        navigate(`/track-ride/${response.data.ride.id}`, { 
          state: { 
            rideId: response.data.ride.id,
            pickup: pickupCoords,
            dropoff: dropoffCoords,
            fare: response.data.ride.fare,
            eta: response.data.ride.eta
          }
        });
      }
    } catch (error) {
      console.error('❌ Booking error:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Failed to book ride');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-page">
      <div className="booking-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft />
        </button>
        <h1>Book a Ride</h1>
      </div>

      <div className="booking-layout">
        {/* Left Side - Map */}
        <div className="booking-map-section">
          <Map 
            pickup={pickupCoords}
            dropoff={dropoffCoords}
            driverLocation={userLocation}
            showRoute={!!(pickupCoords && dropoffCoords)}
            height="100%"
          />
        </div>

        {/* Right Side - Booking Form */}
        <div className="booking-form-section">
          <div className="location-inputs">
            <div className="input-group pickup">
              <FiMapPin className="input-icon" />
              <input
                type="text"
                placeholder="Enter pickup location"
                value={pickup}
                onChange={handlePickupChange}
                disabled={loading}
              />
            </div>

            <div className="input-group dropoff">
              <FiNavigation className="input-icon" />
              <input
                type="text"
                placeholder="Enter destination"
                value={dropoff}
                onChange={handleDropoffChange}
                disabled={loading}
              />
            </div>

            <button 
              className="estimate-btn"
              onClick={calculateEstimate}
              disabled={!pickup || !dropoff || estimating}
            >
              {estimating ? 'Calculating...' : 'Get Fare Estimate'}
            </button>
          </div>

          {/* Ride Type Selection */}
          <div className="ride-types">
            <h3>Select Ride Type</h3>
            <div className="ride-options">
              {rideTypes.map((type) => (
                <div
                  key={type.id}
                  className={`ride-option ${rideType === type.id ? 'selected' : ''}`}
                  onClick={() => setRideType(type.id)}
                >
                  <span className="ride-icon">{type.icon}</span>
                  <div className="ride-details">
                    <h4>{type.name}</h4>
                    <p>₹{type.baseFare} base</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fare Estimate */}
          {estimatedFare && (
            <div className="fare-estimate">
              <h3>Estimated Fare</h3>
              <div className="fare-details">
                <div className="fare-item">
                  <span>Distance</span>
                  <span>{estimatedFare.distance}</span>
                </div>
                <div className="fare-item">
                  <span>Duration</span>
                  <span>{estimatedFare.duration}</span>
                </div>
                <div className="fare-item">
                  <span>Base Fare</span>
                  <span>{estimatedFare.baseFare}</span>
                </div>
                <div className="fare-item">
                  <span>Per KM</span>
                  <span>{estimatedFare.perKmRate}</span>
                </div>
                <div className="fare-item">
                  <span>Per Minute</span>
                  <span>{estimatedFare.perMinRate}</span>
                </div>
                <div className="fare-item total">
                  <span>Total</span>
                  <span>{estimatedFare.fare}</span>
                </div>
              </div>
            </div>
          )}

          {/* Book Button */}
          <button
            className="book-ride-btn"
            onClick={handleBookRide}
            disabled={loading || !estimatedFare}
          >
            {loading ? 'Booking...' : 'Confirm & Book Ride'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RideBooking;
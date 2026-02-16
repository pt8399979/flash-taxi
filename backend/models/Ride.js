const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  pickup: {
    address: { type: String, required: true },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  dropoff: {
    address: { type: String, required: true },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  status: {
    type: String,
    enum: ['requesting', 'accepted', 'driver_arrived', 'started', 'completed', 'cancelled'],
    default: 'requesting'
  },
  fare: {
    amount: Number,
    currency: { type: String, default: 'INR' }
  },
  distance: Number,
  duration: Number,
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'wallet'],
    default: 'cash'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: Date,
  startedAt: Date,
  completedAt: Date,
  cancelledAt: Date
});

module.exports = mongoose.model('Ride', rideSchema);
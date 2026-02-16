const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  vehicle: {
    model: String,
    number: String,
    color: String
  },
  rating: { type: Number, default: 4.5 },
  totalRides: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true },
  currentLocation: {
    lat: Number,
    lng: Number
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Driver', driverSchema);
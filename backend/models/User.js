const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  name: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  photoUrl: {
    type: String,
    default: 'default-avatar.png'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    code: String,
    expiresAt: Date
  },
  rideHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride'
  }],
  preferences: {
    defaultPaymentMethod: {
      type: String,
      enum: ['cash', 'card', 'wallet'],
      default: 'cash'
    },
    favoriteLocations: [{
      name: String,
      address: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
}, {
  timestamps: true
});

// Generate OTP
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = {
    code: otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
  };
  return otp;
};

// Verify OTP
userSchema.methods.verifyOTP = function(enteredOTP) {
  if (!this.otp || !this.otp.code) return false;
  
  if (this.otp.expiresAt < new Date()) {
    this.otp = undefined;
    return false;
  }
  
  const isValid = this.otp.code === enteredOTP;
  if (isValid) {
    this.isVerified = true;
    this.otp = undefined;
  }
  return isValid;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
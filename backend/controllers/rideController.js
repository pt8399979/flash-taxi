const Ride = require('../models/Ride');
const User = require('../models/User');
const Driver = require('../models/Driver');
const tomtomService = require('../services/tomtomService');

// @desc    Request a new ride
// @route   POST /api/rides/request
// @access  Private
exports.requestRide = async (req, res) => {
  try {
    console.log('📝 Ride request received:', req.body);
    
    const { pickupAddress, dropoffAddress } = req.body;
    const userId = req.user._id;

    if (!pickupAddress || !dropoffAddress) {
      return res.status(400).json({
        success: false,
        message: 'Pickup and dropoff addresses are required'
      });
    }

    // Geocode addresses
    const pickup = await tomtomService.geocodeAddress(pickupAddress);
    const dropoff = await tomtomService.geocodeAddress(dropoffAddress);

    if (!pickup || !dropoff) {
      return res.status(400).json({
        success: false,
        message: 'Invalid addresses'
      });
    }

    // Calculate route and fare
    const route = await tomtomService.calculateRoute(
      { lat: pickup.lat, lon: pickup.lon || pickup.lng },
      { lat: dropoff.lat, lon: dropoff.lon || dropoff.lng }
    );

    const fare = tomtomService.calculateFare(route.distance, route.travelTime);

    // Create new ride
    const ride = new Ride({
      userId,
      pickup: {
        address: pickup.address,
        coordinates: {
          lat: pickup.lat,
          lng: pickup.lon || pickup.lng
        }
      },
      dropoff: {
        address: dropoff.address,
        coordinates: {
          lat: dropoff.lat,
          lng: dropoff.lon || dropoff.lng
        }
      },
      fare: {
        amount: Math.round(fare * 100) / 100
      },
      distance: route.distance,
      duration: route.travelTime,
      status: 'requesting'
    });

    await ride.save();
    console.log('✅ Ride saved with ID:', ride._id);

    // Emit new ride to available drivers
    if (req.io) {
      req.io.emit('new-ride-request', {
        rideId: ride._id,
        pickup: ride.pickup,
        dropoff: ride.dropoff,
        fare: ride.fare
      });
    }

    res.status(201).json({
      success: true,
      message: 'Ride requested successfully',
      ride: {
        id: ride._id,
        pickup: ride.pickup,
        dropoff: ride.dropoff,
        fare: ride.fare,
        distance: `${route.distance.toFixed(1)} km`,
        duration: `${Math.round(route.travelTime)} mins`,
        eta: Math.round(route.travelTime + 5),
        status: ride.status
      }
    });

  } catch (error) {
    console.error('❌ Ride request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request ride',
      error: error.message
    });
  }
};

// @desc    Get fare estimate
// @route   POST /api/rides/estimate
// @access  Private
exports.getEstimate = async (req, res) => {
  try {
    console.log('📝 Estimate request received:', req.body);
    
    const { pickupAddress, dropoffAddress } = req.body;

    if (!pickupAddress || !dropoffAddress) {
      return res.status(400).json({
        success: false,
        message: 'Pickup and dropoff addresses are required'
      });
    }

    const pickup = await tomtomService.geocodeAddress(pickupAddress);
    const dropoff = await tomtomService.geocodeAddress(dropoffAddress);

    if (!pickup || !dropoff) {
      return res.status(400).json({
        success: false,
        message: 'Invalid addresses'
      });
    }

    const route = await tomtomService.calculateRoute(
      { lat: pickup.lat, lon: pickup.lon || pickup.lng },
      { lat: dropoff.lat, lon: dropoff.lon || dropoff.lng }
    );

    const fare = tomtomService.calculateFare(route.distance, route.travelTime);

    res.json({
      success: true,
      estimate: {
        distance: `${route.distance.toFixed(1)} km`,
        duration: `${Math.round(route.travelTime)} mins`,
        fare: `₹${Math.round(fare)}`,
        baseFare: '₹50',
        perKmRate: '₹15/km',
        perMinRate: '₹2/min'
      }
    });

  } catch (error) {
    console.error('❌ Estimate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate estimate'
    });
  }
};

// @desc    Get ride details
// @route   GET /api/rides/:rideId
// @access  Private
exports.getRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    console.log('📝 Get ride request for ID:', rideId);

    if (!rideId || rideId === 'undefined' || rideId === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ride ID'
      });
    }

    const ride = await Ride.findById(rideId)
      .populate('userId', 'name email phone')
      .populate('driverId', 'name phone vehicle rating');

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Check if user owns this ride
    if (ride.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this ride'
      });
    }

    res.json({
      success: true,
      ride: {
        id: ride._id,
        status: ride.status,
        pickup: ride.pickup,
        dropoff: ride.dropoff,
        fare: ride.fare,
        distance: ride.distance,
        duration: ride.duration,
        driver: ride.driverId,
        requestedAt: ride.requestedAt,
        acceptedAt: ride.acceptedAt,
        completedAt: ride.completedAt
      }
    });

  } catch (error) {
    console.error('❌ Get ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get ride details'
    });
  }
};

// @desc    Cancel ride
// @route   POST /api/rides/:rideId/cancel
// @access  Private
exports.cancelRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    console.log('📝 Cancel ride request for ID:', rideId);

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Check if user owns this ride
    if (ride.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this ride'
      });
    }

    // Can only cancel if status is requesting or accepted
    if (ride.status !== 'requesting' && ride.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel ride with status: ${ride.status}`
      });
    }

    ride.status = 'cancelled';
    ride.cancelledAt = new Date();
    await ride.save();

    // Notify driver via socket if assigned
    if (ride.driverId && req.io) {
      req.io.to(`driver-${ride.driverId}`).emit('ride-cancelled', {
        rideId: ride._id
      });
    }

    res.json({
      success: true,
      message: 'Ride cancelled successfully'
    });

  } catch (error) {
    console.error('❌ Cancel ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel ride'
    });
  }
};

// @desc    Get user ride history
// @route   GET /api/rides/history
// @access  Private
exports.getRideHistory = async (req, res) => {
  try {
    console.log('📝 Get ride history for user:', req.user._id);

    const rides = await Ride.find({ userId: req.user._id })
      .sort({ requestedAt: -1 })
      .limit(20)
      .populate('driverId', 'name vehicle rating');

    res.json({
      success: true,
      rides: rides.map(ride => ({
        id: ride._id,
        status: ride.status,
        pickup: ride.pickup.address,
        dropoff: ride.dropoff.address,
        fare: ride.fare,
        date: ride.requestedAt,
        driver: ride.driverId
      }))
    });

  } catch (error) {
    console.error('❌ Ride history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get ride history'
    });
  }
};
const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');
const authMiddleware = require('../middleware/authMiddleware');

// Debug middleware to see all requests
router.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.originalUrl}`);
  next();
});

// All ride routes require authentication
router.use(authMiddleware);

// Ride requests
router.post('/request', (req, res, next) => {
  console.log('➡️ POST /api/rides/request');
  req.io = req.app.get('io');
  next();
}, rideController.requestRide);

router.post('/estimate', rideController.getEstimate);

// Ride history
router.get('/history', rideController.getRideHistory);

// Specific ride operations
router.get('/:rideId', (req, res, next) => {
  console.log(`➡️ GET /api/rides/${req.params.rideId}`);
  next();
}, rideController.getRide);

router.post('/:rideId/cancel', (req, res, next) => {
  req.io = req.app.get('io');
  next();
}, rideController.cancelRide);

module.exports = router;
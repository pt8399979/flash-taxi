const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');
const authMiddleware = require('../middleware/authMiddleware');

// Get driver details
router.get('/:driverId', authMiddleware, async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.driverId).select('-password');
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, driver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
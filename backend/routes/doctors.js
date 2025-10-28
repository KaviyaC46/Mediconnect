const express = require('express');
const Doctor = require('../models/Doctor');
const router = express.Router();

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, specialty, location, page = 1, limit = 12 } = req.query;

    let filter = { isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialty: { $regex: search, $options: 'i' } }
      ];
    }

    if (specialty) filter.specialty = specialty;
    if (location) filter.location = location;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const doctors = await Doctor.find(filter)
      .select('name specialty qualification experience location consultationFee availability rating totalRatings')
      .skip(skip)
      .limit(limitNum);

    const total = await Doctor.countDocuments(filter);

    res.json({
      success: true,
      data: doctors,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctors'
    });
  }
});

// @desc    Get single doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ 
      _id: req.params.id, 
      isActive: true 
    }).select('-__v');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      data: doctor
    });

  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor'
    });
  }
});

// @desc    Get doctor specialties
// @route   GET /api/doctors/data/specialties
// @access  Public
router.get('/data/specialties', async (req, res) => {
  try {
    const specialties = await Doctor.distinct('specialty', { isActive: true });
    res.json({
      success: true,
      data: specialties.sort()
    });
  } catch (error) {
    console.error('Get specialties error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching specialties'
    });
  }
});

// @desc    Get doctor locations
// @route   GET /api/doctors/data/locations
// @access  Public
router.get('/data/locations', async (req, res) => {
  try {
    const locations = await Doctor.distinct('location', { isActive: true });
    res.json({
      success: true,
      data: locations.sort()
    });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching locations'
    });
  }
});

module.exports = router;
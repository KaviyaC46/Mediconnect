const express = require('express');
const Doctor = require('../models/Doctor');
const router = express.Router();

// @desc    Get all doctors with filters
// @route   GET /api/doctors
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      specialization, 
      location, 
      experience, 
      page = 1, 
      limit = 12 
    } = req.query;

    // Build filter object
    let filter = { isActive: true };

    // Search filter
    if (search && search.trim() !== '') {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { qualification: { $regex: search, $options: 'i' } }
      ];
    }

    // Specialization filter
    if (specialization && specialization !== '' && specialization !== 'all') {
      filter.specialization = { $regex: specialization, $options: 'i' };
    }

    // Location filter
    if (location && location !== '' && location !== 'all') {
      filter.location = { $regex: location, $options: 'i' };
    }

    // Experience filter
    if (experience) {
      const expNum = parseInt(experience);
      filter.experience = { $gte: expNum };
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Get doctors
    const doctors = await Doctor.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum)
      .select('-password') // Exclude password
      .lean();

    // Get total count for pagination
    const total = await Doctor.countDocuments(filter);

    res.json({
      success: true,
      count: doctors.length,
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
      message: 'Error fetching doctors: ' + error.message
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
    }).select('-password'); // Exclude password

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
    console.error('Get doctor by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor: ' + error.message
    });
  }
});

// @desc    Get doctor specializations
// @route   GET /api/doctors/data/specializations
// @access  Public
router.get('/data/specializations', async (req, res) => {
  try {
    const specializations = await Doctor.distinct('specialization', { isActive: true });
    res.json({
      success: true,
      data: specializations.filter(spec => spec).sort()
    });
  } catch (error) {
    console.error('Get specializations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching specializations: ' + error.message
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
      data: locations.filter(loc => loc).sort()
    });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching locations: ' + error.message
    });
  }
});

// @desc    Create new doctor
// @route   POST /api/doctors
// @access  Private/Admin
router.post('/', async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();

    res.status(201).json({
      success: true,
      data: doctor,
      message: 'Doctor created successfully'
    });
  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating doctor: ' + error.message
    });
  }
});

// @desc    Update doctor
// @route   PUT /api/doctors/:id
// @access  Private/Admin
router.put('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      data: doctor,
      message: 'Doctor updated successfully'
    });
  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating doctor: ' + error.message
    });
  }
});

module.exports = router;
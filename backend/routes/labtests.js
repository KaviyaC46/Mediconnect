const express = require('express');
const LabTest = require('../models/LabTest');
const router = express.Router();

// @desc    Get all lab tests with filtering and search
// @route   GET /api/labtests
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      search, 
      department,
      popular,
      fastingRequired,
      minPrice,
      maxPrice,
      page = 1,
      limit = 12
    } = req.query;

    let filter = { isActive: true };

    // Build filter object
    if (category) filter.category = category;
    if (department) filter.department = department;
    if (popular === 'true') filter.popular = true;
    if (fastingRequired) filter.fastingRequired = fastingRequired === 'true';
    
    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Search across multiple fields
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get tests with filtering and pagination
    const tests = await LabTest.find(filter)
      .sort({ popular: -1, name: 1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await LabTest.countDocuments(filter);

    res.json({
      success: true,
      data: tests,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Get lab tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lab tests'
    });
  }
});

// @desc    Get popular lab tests
// @route   GET /api/labtests/popular
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const popularTests = await LabTest.find({ 
      popular: true,
      isActive: true 
    })
    .sort({ popularityScore: -1 })
    .limit(10);

    res.json({
      success: true,
      data: popularTests
    });

  } catch (error) {
    console.error('Get popular tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular tests'
    });
  }
});

// @desc    Get lab test by ID
// @route   GET /api/labtests/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const test = await LabTest.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }

    // Increment popularity score when viewed
    await test.incrementPopularity();

    res.json({
      success: true,
      data: test
    });

  } catch (error) {
    console.error('Get lab test error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching lab test details'
    });
  }
});

// @desc    Get lab test categories
// @route   GET /api/labtests/data/categories
// @access  Public
router.get('/data/categories', async (req, res) => {
  try {
    const categories = await LabTest.distinct('category');
    
    res.json({
      success: true,
      data: categories.sort()
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
});

// @desc    Search tests by health condition or symptom
// @route   GET /api/labtests/search/condition
// @access  Public
router.get('/search/condition', async (req, res) => {
  try {
    const { condition } = req.query;

    if (!condition) {
      return res.status(400).json({
        success: false,
        message: 'Condition parameter is required'
      });
    }

    // This is a simplified version - in real app, you'd have a condition-test mapping
    const tests = await LabTest.find({
      isActive: true,
      $or: [
        { name: { $regex: condition, $options: 'i' } },
        { tags: { $in: [new RegExp(condition, 'i')] } },
        { description: { $regex: condition, $options: 'i' } }
      ]
    })
    .limit(10);

    res.json({
      success: true,
      data: tests
    });

  } catch (error) {
    console.error('Search by condition error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching tests by condition'
    });
  }
});

// @desc    Get health packages (tests with multiple included tests)
// @route   GET /api/labtests/health-packages
// @access  Public
router.get('/data/health-packages', async (req, res) => {
  try {
    const healthPackages = await LabTest.find({
      category: 'Health Package',
      isActive: true
    })
    .sort({ price: 1 });

    res.json({
      success: true,
      data: healthPackages
    });

  } catch (error) {
    console.error('Get health packages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching health packages'
    });
  }
});

module.exports = router;
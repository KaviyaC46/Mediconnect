const express = require('express');
const LabTest = require('../models/LabTest');
const router = express.Router();

// @desc    Get all lab tests
// @route   GET /api/lab-tests
// @access  Public
router.get('/', async (req, res) => {
  try {
    console.log('🔬 Lab tests API called with query:', req.query);
    
    const { 
      search, 
      category, 
      minPrice, 
      maxPrice, 
      page = 1, 
      limit = 12 
    } = req.query;

    // Build filter object
    let filter = { isActive: true };

    // Search filter
    if (search && search.trim() !== '') {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category && category !== '' && category !== 'all') {
      filter.category = { $regex: category, $options: 'i' };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    console.log('🔍 Lab test filter:', filter);

    // Get lab tests
    const labTests = await LabTest.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const total = await LabTest.countDocuments(filter);

    console.log(`✅ Found ${labTests.length} lab tests`);

    res.json({
      success: true,
      count: labTests.length,
      data: labTests,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('❌ Get lab tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lab tests: ' + error.message
    });
  }
});

// @desc    Get lab test categories
// @route   GET /api/lab-tests/categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    console.log('📋 Fetching lab test categories');
    const categories = await LabTest.distinct('category', { isActive: true });
    console.log('✅ Categories found:', categories);
    
    res.json({
      success: true,
      data: categories.filter(cat => cat).sort()
    });
  } catch (error) {
    console.error('❌ Get lab test categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lab test categories: ' + error.message
    });
  }
});

// @desc    Get single lab test by ID
// @route   GET /api/lab-tests/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    console.log('🔍 Fetching lab test by ID:', req.params.id);
    
    const labTest = await LabTest.findOne({ 
      _id: req.params.id, 
      isActive: true 
    });

    if (!labTest) {
      console.log('❌ Lab test not found');
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }

    console.log('✅ Lab test found:', labTest.name);
    
    res.json({
      success: true,
      data: labTest
    });
  } catch (error) {
    console.error('❌ Get lab test by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lab test: ' + error.message
    });
  }
});

// @desc    Book lab test
// @route   POST /api/lab-tests/book
// @access  Private
router.post('/book', async (req, res) => {
  try {
    console.log('📝 Lab test booking request:', req.body);
    
    const { 
      testId, 
      patientName, 
      patientAge, 
      patientGender, 
      patientPhone, 
      preferredDate, 
      preferredTime, 
      address 
    } = req.body;

    // Validate required fields
    if (!testId || !patientName || !patientPhone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Get test details
    const test = await LabTest.findById(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }

    // Create lab order
    const labOrder = {
      testId: test._id,
      testName: test.name,
      price: test.price,
      patientName,
      patientAge,
      patientGender,
      patientPhone,
      preferredDate: preferredDate || new Date().toISOString().split('T')[0],
      preferredTime: preferredTime || '10:00 AM',
      address: address || 'Home collection',
      status: 'pending',
      createdAt: new Date()
    };

    console.log('✅ Lab test booked successfully:', labOrder);

    res.json({
      success: true,
      message: 'Lab test booked successfully',
      data: labOrder
    });

  } catch (error) {
    console.error('❌ Book lab test error:', error);
    res.status(500).json({
      success: false,
      message: 'Error booking lab test: ' + error.message
    });
  }
});

// @desc    Create sample lab tests
// @route   POST /api/lab-tests/sample
// @access  Public (Remove in production)
router.post('/sample', async (req, res) => {
  try {
    console.log('🎯 Creating sample lab tests...');
    
    const sampleTests = [
      {
        name: 'Complete Blood Count (CBC)',
        category: 'Hematology',
        price: 299,
        description: 'Measures different components of blood including red blood cells, white blood cells, and platelets.',
        fastingRequired: false,
        reportTime: '24 hours',
        sampleType: 'Blood',
        parameters: ['Hemoglobin', 'WBC Count', 'RBC Count', 'Platelet Count', 'MCV', 'MCH'],
        preparation: 'No special preparation required',
        isActive: true,
        isPopular: true
      },
      {
        name: 'Blood Glucose Test',
        category: 'Diabetes',
        price: 199,
        description: 'Measures blood sugar levels to diagnose and monitor diabetes.',
        fastingRequired: true,
        reportTime: '6 hours',
        sampleType: 'Blood',
        parameters: ['Fasting Blood Sugar', 'Postprandial Blood Sugar'],
        preparation: 'Fasting for 8-12 hours required',
        isActive: true,
        isPopular: true
      },
      {
        name: 'Thyroid Profile',
        category: 'Endocrinology',
        price: 599,
        description: 'Comprehensive test to measure thyroid hormone levels and function.',
        fastingRequired: false,
        reportTime: '48 hours',
        sampleType: 'Blood',
        parameters: ['TSH', 'T3', 'T4', 'Free T3', 'Free T4'],
        preparation: 'No special preparation required',
        isActive: true,
        isPopular: true
      },
      {
        name: 'Liver Function Test',
        category: 'Hepatology',
        price: 499,
        description: 'Assesses liver health by measuring enzymes, proteins, and substances.',
        fastingRequired: true,
        reportTime: '24 hours',
        sampleType: 'Blood',
        parameters: ['ALT', 'AST', 'ALP', 'Bilirubin', 'Albumin'],
        preparation: 'Fasting for 10-12 hours required',
        isActive: true
      },
      {
        name: 'Kidney Function Test',
        category: 'Nephrology',
        price: 399,
        description: 'Evaluates kidney function and detects kidney diseases.',
        fastingRequired: false,
        reportTime: '24 hours',
        sampleType: 'Blood',
        parameters: ['Creatinine', 'Urea', 'Uric Acid', 'eGFR'],
        preparation: 'No special preparation required',
        isActive: true
      },
      {
        name: 'Lipid Profile',
        category: 'Cardiology',
        price: 349,
        description: 'Measures cholesterol and triglyceride levels to assess heart health.',
        fastingRequired: true,
        reportTime: '24 hours',
        sampleType: 'Blood',
        parameters: ['Total Cholesterol', 'HDL', 'LDL', 'Triglycerides'],
        preparation: 'Fasting for 12-14 hours required',
        isActive: true
      }
    ];

    // Clear existing tests
    await LabTest.deleteMany({});
    
    // Insert sample tests
    const createdTests = await LabTest.insertMany(sampleTests);

    console.log(`✅ Created ${createdTests.length} sample lab tests`);

    res.json({
      success: true,
      message: `Created ${createdTests.length} sample lab tests`,
      data: createdTests
    });

  } catch (error) {
    console.error('❌ Create sample tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating sample tests: ' + error.message
    });
  }
});

module.exports = router;
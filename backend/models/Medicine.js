const express = require('express');
const Medicine = require('../models/Medicine');
const router = express.Router();

// @desc    Get all medicines - UPDATED FOR FIELD VARIATIONS
// @route   GET /api/medicines
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, page = 1, limit = 12 } = req.query;

    console.log('🔍 Medicine search request:', { search, category, minPrice, maxPrice });

    // Build filter that handles field name variations
    let filter = {
      $or: [
        { isActive: true },
        { isActives: true }
      ]
    };

    // Text search
    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { brand: { $regex: searchTerm, $options: 'i' } },
          { category: { $regex: searchTerm, $options: 'i' } }
        ]
      });
    }

    // Category filter
    if (category && category !== '' && category !== 'all') {
      filter.$and = filter.$and || [];
      filter.$and.push({ 
        category: { $regex: category, $options: 'i' } 
      });
    }

    // Price filter - use actual price field (not discountedPrice virtual)
    if (minPrice || maxPrice) {
      filter.$and = filter.$and || [];
      const priceFilter = {};
      
      if (minPrice) priceFilter.$gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);
      
      filter.$and.push({ price: priceFilter });
    }

    // Clean up filter - remove $and if empty
    if (filter.$and && filter.$and.length === 0) {
      delete filter.$and;
    }

    console.log('🔎 Database query filter:', JSON.stringify(filter, null, 2));

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Get medicines
    const medicines = await Medicine.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Calculate discounted price for each medicine
    const medicinesWithDiscount = medicines.map(medicine => ({
      ...medicine,
      discountedPrice: medicine.discount > 0 
        ? medicine.price - (medicine.price * medicine.discount / 100)
        : medicine.price
    }));

    // Get total count
    const total = await Medicine.countDocuments(filter);

    console.log(`📊 Search results: ${medicines.length} medicines found`);

    res.json({
      success: true,
      count: medicines.length,
      data: medicinesWithDiscount,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('❌ Get medicines error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching medicines: ' + error.message
    });
  }
});

// @desc    Simple search endpoint
// @route   GET /api/medicines/search
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.json({
        success: true,
        count: 0,
        data: [],
        message: 'Please enter a search term'
      });
    }

    const searchTerm = q.trim();
    
    const filter = {
      $or: [
        { isActive: true },
        { isActives: true }
      ],
      $and: [
        {
          $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { brand: { $regex: searchTerm, $options: 'i' } },
            { category: { $regex: searchTerm, $options: 'i' } }
          ]
        }
      ]
    };

    console.log('🔍 Simple search filter:', filter);

    const medicines = await Medicine.find(filter)
      .limit(20)
      .select('name brand category price discount')
      .sort({ name: 1 })
      .lean();

    console.log(`📊 Found ${medicines.length} medicines for "${searchTerm}"`);

    res.json({
      success: true,
      count: medicines.length,
      data: medicines,
      searchTerm: searchTerm
    });

  } catch (error) {
    console.error('❌ Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search error: ' + error.message
    });
  }
});

// @desc    Debug: Check actual data in database
// @route   GET /api/medicines/debug/data
// @access  Public
router.get('/debug/data', async (req, res) => {
  try {
    const medicines = await Medicine.find()
      .limit(5)
      .lean();

    // Get field names from actual data
    const fieldNames = medicines.length > 0 ? Object.keys(medicines[0]) : [];
    
    const totalCount = await Medicine.countDocuments();

    res.json({
      success: true,
      totalCount,
      fieldNames,
      sampleData: medicines,
      message: `Found ${totalCount} total documents in collection`
    });

  } catch (error) {
    console.error('Debug data error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug error: ' + error.message
    });
  }
});

module.exports = router;
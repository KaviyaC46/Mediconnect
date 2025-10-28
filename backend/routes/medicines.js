const express = require('express');
const Medicine = require('../models/Medicine');
const router = express.Router();

// @desc    Get all medicines - FIXED VERSION
// @route   GET /api/medicines
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, page = 1, limit = 12 } = req.query;

    console.log('🔍 Medicine search request:', { search, category, minPrice, maxPrice, page, limit });

    let filter = { 
      $or: [
        { isActive: true },
        { isActives: true },
        { inStock: true },
        { instock: true }
      ]
    };

    // Build filter object
    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { brand: { $regex: searchTerm, $options: 'i' } },
          { manufacturer: { $regex: searchTerm, $options: 'i' } },
          { category: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } }
        ]
      });
      console.log('📝 Search term applied:', searchTerm);
    }

    if (category && category !== '' && category !== 'all') {
      filter.$and = filter.$and || [];
      filter.$and.push({ 
        category: { $regex: category, $options: 'i' } 
      });
    }

    // FIXED: Price range filter - handle both price and discountedPrice
    if (minPrice || maxPrice) {
      filter.$and = filter.$and || [];
      const priceFilter = {};
      
      if (minPrice) {
        priceFilter.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        priceFilter.$lte = parseFloat(maxPrice);
      }
      
      // Try both price field names
      filter.$and.push({
        $or: [
          { price: priceFilter },
          { discountedPrice: priceFilter }
        ]
      });
    }

    // If no $and conditions, remove the $and array
    if (filter.$and && filter.$and.length === 0) {
      delete filter.$and;
    }

    console.log('🔎 Final filter:', JSON.stringify(filter, null, 2));

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Get medicines with better field selection
    const medicines = await Medicine.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum)
      .select('name brand category price discount description inStock stock prescriptionRequired image rating')
      .lean();

    // Get total count
    const total = await Medicine.countDocuments(filter);

    console.log(`📊 Found ${medicines.length} medicines out of ${total} total`);

    // Debug: Log first few results
    if (medicines.length > 0) {
      console.log('🎯 First 3 results:', medicines.slice(0, 3).map(m => ({
        name: m.name,
        brand: m.brand,
        category: m.category,
        price: m.price
      })));
    } else {
      console.log('❌ No medicines found with filter:', filter);
      
      // Debug: Check what's actually in the database
      const allMedicines = await Medicine.find().limit(3).select('name brand category').lean();
      console.log('📋 Sample of all medicines in DB:', allMedicines);
    }

    res.json({
      success: true,
      count: medicines.length,
      data: medicines,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      },
      searchTerm: search
    });

  } catch (error) {
    console.error('❌ Get medicines error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching medicines: ' + error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @desc    Get single medicine by ID - FIXED
// @route   GET /api/medicines/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    res.json({
      success: true,
      data: medicine
    });

  } catch (error) {
    console.error('Get medicine error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid medicine ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error fetching medicine: ' + error.message
    });
  }
});

// @desc    Get medicine categories - FIXED
// @route   GET /api/medicines/data/categories
// @access  Public
router.get('/data/categories', async (req, res) => {
  try {
    const categories = await Medicine.distinct('category', { 
      $or: [
        { isActive: true },
        { isActives: true },
        { inStock: true }
      ]
    });
    
    // Filter out null/undefined and sort
    const validCategories = categories.filter(cat => cat && cat.trim() !== '').sort();
    
    console.log('📂 Found categories:', validCategories);
    
    res.json({
      success: true,
      count: validCategories.length,
      data: validCategories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories: ' + error.message
    });
  }
});

// @desc    Get medicine brands - FIXED
// @route   GET /api/medicines/data/brands
// @access  Public
router.get('/data/brands', async (req, res) => {
  try {
    const brands = await Medicine.distinct('brand', { 
      $or: [
        { isActive: true },
        { isActives: true },
        { inStock: true }
      ]
    });
    
    const validBrands = brands.filter(brand => brand && brand.trim() !== '').sort();
    
    res.json({
      success: true,
      count: validBrands.length,
      data: validBrands
    });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching brands: ' + error.message
    });
  }
});

// @desc    Simple search endpoint for frontend
// @route   GET /api/medicines/search/simple
// @access  Public
router.get('/search/simple', async (req, res) => {
  try {
    const { q } = req.query;
    
    console.log('🔍 Simple search for:', q);

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
        { name: { $regex: searchTerm, $options: 'i' } },
        { brand: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    console.log('🔎 Simple search filter:', filter);

    const medicines = await Medicine.find(filter)
      .limit(20)
      .select('name brand category price discount inStock image rating')
      .sort({ name: 1 })
      .lean();

    console.log(`📊 Simple search found ${medicines.length} results for "${searchTerm}"`);

    res.json({
      success: true,
      count: medicines.length,
      data: medicines,
      searchTerm: searchTerm
    });

  } catch (error) {
    console.error('❌ Simple search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search error: ' + error.message
    });
  }
});

// @desc    Debug endpoint to check database contents
// @route   GET /api/medicines/debug/all
// @access  Public
router.get('/debug/all', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const allMedicines = await Medicine.find()
      .limit(parseInt(limit))
      .select('name brand category price discount inStock isActive prescriptionRequired')
      .lean();

    const totalCount = await Medicine.countDocuments();
    
    // Get field names from first document
    const fieldNames = allMedicines.length > 0 ? Object.keys(allMedicines[0]) : [];

    res.json({
      success: true,
      totalCount,
      sampleCount: allMedicines.length,
      fieldNames,
      sampleData: allMedicines,
      message: `Database contains ${totalCount} medicines total`
    });

  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug error: ' + error.message
    });
  }
});

module.exports = router;
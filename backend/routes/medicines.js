const express = require('express');
const Medicine = require('../models/Medicine');
const router = express.Router();

// @desc    Get all medicines
// @route   GET /api/medicines
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      category, 
      brand, 
      minPrice, 
      maxPrice, 
      prescriptionRequired, 
      page = 1, 
      limit = 12 
    } = req.query;

    // Build filter object
    let filter = { isActive: true };

    // Search filter
    if (search && search.trim() !== '') {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category && category !== '' && category !== 'all') {
      filter.category = { $regex: category, $options: 'i' };
    }

    // Brand filter
    if (brand && brand !== '' && brand !== 'all') {
      filter.brand = { $regex: brand, $options: 'i' };
    }

    // Prescription filter
    if (prescriptionRequired !== undefined) {
      filter.prescriptionRequired = prescriptionRequired === 'true';
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

    // Get medicines with calculated discounted price
    const medicines = await Medicine.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Calculate discounted price for each medicine
    const medicinesWithDiscount = medicines.map(medicine => ({
      ...medicine,
      discountedPrice: medicine.discount > 0 
        ? Math.round(medicine.price - (medicine.price * medicine.discount / 100))
        : medicine.price
    }));

    // Get total count for pagination
    const total = await Medicine.countDocuments(filter);

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
    console.error('Get medicines error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching medicines: ' + error.message
    });
  }
});

// @desc    Get medicine categories
// @route   GET /api/medicines/data/categories
// @access  Public
router.get('/data/categories', async (req, res) => {
  try {
    const categories = await Medicine.distinct('category', { isActive: true });
    res.json({
      success: true,
      data: categories.filter(cat => cat).sort()
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories: ' + error.message
    });
  }
});

// @desc    Get medicine brands
// @route   GET /api/medicines/data/brands
// @access  Public
router.get('/data/brands', async (req, res) => {
  try {
    const brands = await Medicine.distinct('brand', { isActive: true });
    res.json({
      success: true,
      data: brands.filter(brand => brand).sort()
    });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching brands: ' + error.message
    });
  }
});

// @desc    Get single medicine by ID
// @route   GET /api/medicines/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findOne({ 
      _id: req.params.id, 
      isActive: true 
    });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    // Calculate discounted price
    const medicineWithDiscount = {
      ...medicine.toObject(),
      discountedPrice: medicine.discount > 0 
        ? Math.round(medicine.price - (medicine.price * medicine.discount / 100))
        : medicine.price
    };

    res.json({
      success: true,
      data: medicineWithDiscount
    });
  } catch (error) {
    console.error('Get medicine by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching medicine: ' + error.message
    });
  }
});

// @desc    Create new medicine
// @route   POST /api/medicines
// @access  Private/Admin
router.post('/', async (req, res) => {
  try {
    const medicine = new Medicine(req.body);
    await medicine.save();

    res.status(201).json({
      success: true,
      data: medicine,
      message: 'Medicine created successfully'
    });
  } catch (error) {
    console.error('Create medicine error:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating medicine: ' + error.message
    });
  }
});

// @desc    Update medicine
// @route   PUT /api/medicines/:id
// @access  Private/Admin
router.put('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    res.json({
      success: true,
      data: medicine,
      message: 'Medicine updated successfully'
    });
  } catch (error) {
    console.error('Update medicine error:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating medicine: ' + error.message
    });
  }
});

module.exports = router;
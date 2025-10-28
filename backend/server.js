const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection with better error handling
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mediconnect';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1); // Exit if DB connection fails
});

// Import and use routes with better error handling
const loadRoutes = () => {
  try {
    app.use('/api/doctors', require('./routes/doctors'));
    console.log('✅ Doctor routes loaded');
  } catch (error) {
    console.warn('⚠️ Doctor routes not loaded:', error.message);
  }

  try {
    app.use('/api/appointments', require('./routes/appointments'));
    console.log('✅ Appointment routes loaded');
  } catch (error) {
    console.warn('⚠️ Appointment routes not loaded:', error.message);
  }

  try {
    app.use('/api/auth', require('./routes/auth'));
    console.log('✅ Auth routes loaded');
  } catch (error) {
    console.warn('⚠️ Auth routes not loaded:', error.message);
  }
};

loadRoutes();

// Improved medicine routes with better error handling
const setupMedicineRoutes = async () => {
  try {
    const medicineRoutes = require('./routes/medicines');
    app.use('/api/medicines', medicineRoutes);
    console.log('✅ Medicine routes loaded successfully');
  } catch (error) {
    console.error('❌ Failed to load medicine routes:', error.message);
    setupFallbackMedicineRoutes();
  }
};

const setupFallbackMedicineRoutes = () => {
  console.log('🟡 Setting up FALLBACK medicine routes...');

  // Enhanced medicine search endpoint - handles field variations
  app.get('/api/medicines/search', async (req, res) => {
    try {
      const { q, category, brand } = req.query;
      
      const Medicine = require('./models/Medicine');
      
      // Build query that handles field name variations
      let query = {
        $or: [
          { isActive: true },
          { isActives: true },
          { inStock: true },
          { instock: true }
        ]
      };
      
      // Text search across multiple fields
      if (q && q.trim() !== '') {
        const searchTerm = q.trim();
        query.$and = query.$and || [];
        query.$and.push({
          $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { brand: { $regex: searchTerm, $options: 'i' } },
            { category: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } }
          ]
        });
      }
      
      // Category filter
      if (category && category !== 'all') {
        query.$and = query.$and || [];
        query.$and.push({ category: { $regex: category, $options: 'i' } });
      }
      
      // Brand filter
      if (brand && brand !== 'all') {
        query.$and = query.$and || [];
        query.$and.push({ brand: { $regex: brand, $options: 'i' } });
      }
      
      // Clean up query - remove $and if empty
      if (query.$and && query.$and.length === 0) {
        delete query.$and;
      }

      console.log('🔍 Fallback search query:', JSON.stringify(query, null, 2));
      
      const medicines = await Medicine.find(query)
        .limit(20)
        .select('name brand category price discount inStock stock prescriptionRequired image')
        .sort({ name: 1 })
        .lean();

      console.log(`📊 Fallback search found ${medicines.length} medicines for: "${q}"`);
      
      res.json({
        success: true,
        count: medicines.length,
        data: medicines,
        searchTerm: q,
        usingFallback: true
      });
    } catch (error) {
      console.error('❌ Fallback search error:', error);
      res.status(500).json({
        success: false,
        message: 'Search error: ' + error.message,
        query: req.query
      });
    }
  });

  // Enhanced get all medicines endpoint
  app.get('/api/medicines', async (req, res) => {
    try {
      const { page = 1, limit = 20, category } = req.query;
      const Medicine = require('./models/Medicine');
      
      // Build query with field variations
      let query = {
        $or: [
          { isActive: true },
          { isActives: true },
          { inStock: true },
          { instock: true }
        ]
      };
      
      if (category && category !== 'all') {
        query.category = { $regex: category, $options: 'i' };
      }
      
      const medicines = await Medicine.find(query)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('name brand category price discount inStock stock rating image')
        .sort({ name: 1 })
        .lean();

      const total = await Medicine.countDocuments(query);
      
      console.log(`📊 Fallback get all found ${medicines.length} medicines`);
      
      res.json({
        success: true,
        data: medicines,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
        usingFallback: true
      });
    } catch (error) {
      console.error('❌ Fallback get medicines error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching medicines: ' + error.message
      });
    }
  });

  // Enhanced categories endpoint
  app.get('/api/medicines/data/categories', async (req, res) => {
    try {
      const Medicine = require('./models/Medicine');
      const categories = await Medicine.distinct('category', { 
        $or: [
          { isActive: true },
          { isActives: true },
          { inStock: true }
        ]
      });
      
      const validCategories = categories.filter(cat => cat && cat.trim() !== '').sort();
      
      console.log(`📂 Found ${validCategories.length} categories`);
      
      res.json({
        success: true,
        data: validCategories,
        usingFallback: true
      });
    } catch (error) {
      console.error('❌ Fallback categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching categories: ' + error.message
      });
    }
  });

  // Get medicine by ID - ADDED
  app.get('/api/medicines/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const Medicine = require('./models/Medicine');
      
      // Check if ID is valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid medicine ID format'
        });
      }
      
      const medicine = await Medicine.findById(id);
      
      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: 'Medicine not found'
        });
      }
      
      res.json({
        success: true,
        data: medicine,
        usingFallback: true
      });
    } catch (error) {
      console.error('❌ Get medicine by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching medicine: ' + error.message
      });
    }
  });
};

// Initialize medicine routes
setupMedicineRoutes();

// Health check route
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({
    success: true,
    message: 'MediConnect API is running',
    environment: process.env.NODE_ENV,
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Enhanced test route to check medicine data
app.get('/api/test-medicines', async (req, res) => {
  try {
    console.log('🟡 Testing medicine connection...');
    
    // Check if Medicine model exists
    let Medicine;
    try {
      Medicine = require('./models/Medicine');
    } catch (modelError) {
      return res.status(500).json({
        success: false,
        message: 'Medicine model not found: ' + modelError.message
      });
    }
    
    const count = await Medicine.countDocuments();
    const sampleMedicines = await Medicine.find()
      .limit(5)
      .select('name brand category price inStock')
      .lean();

    // Check database connection
    const dbConnected = mongoose.connection.readyState === 1;
    
    res.json({
      success: true,
      message: `Found ${count} medicines in database`,
      databaseConnected: dbConnected,
      sampleData: sampleMedicines,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Test medicines error:', error);
    res.status(500).json({
      success: false,
      message: 'Test failed: ' + error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ==================== ENHANCED PHARMACY FEATURES ====================

// Order Management System - FIXED
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, items, totalAmount, shippingAddress, paymentMethod } = req.body;
    
    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required'
      });
    }

    const Order = require('./models/Order');
    const order = new Order({
      userId: userId || 'guest', // Allow guest orders
      items,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      status: 'pending'
    });

    await order.save();
    
    // Update medicine stock - with error handling
    const Medicine = require('./models/Medicine');
    for (let item of items) {
      try {
        await Medicine.findByIdAndUpdate(
          item.medicineId,
          { $inc: { stock: -item.quantity } }
        );
      } catch (stockError) {
        console.error(`❌ Error updating stock for ${item.medicineId}:`, stockError);
        // Continue with other items, don't fail the whole order
      }
    }

    res.json({
      success: true,
      message: 'Order placed successfully',
      orderId: order._id,
      order
    });
  } catch (error) {
    console.error('❌ Order placement error:', error);
    res.status(500).json({
      success: false,
      message: 'Order placement failed: ' + error.message
    });
  }
});

// Enhanced inventory management
app.get('/api/inventory/low-stock', async (req, res) => {
  try {
    const { threshold = 10 } = req.query;
    const Medicine = require('./models/Medicine');
    
    const lowStockMedicines = await Medicine.find({
      stock: { $lt: parseInt(threshold) },
      inStock: true
    }).select('name brand stock price category')
      .sort({ stock: 1 });

    res.json({
      success: true,
      data: lowStockMedicines,
      threshold: parseInt(threshold),
      count: lowStockMedicines.length
    });
  } catch (error) {
    console.error('❌ Low stock fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching low stock items: ' + error.message
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 MediConnect Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n💊 MEDICINE ENDPOINTS:`);
  console.log(`   • GET  /api/medicines - All medicines (with pagination)`);
  console.log(`   • GET  /api/medicines/search?q=... - Search medicines`);
  console.log(`   • GET  /api/medicines/:id - Get medicine by ID`);
  console.log(`   • GET  /api/medicines/data/categories - Medicine categories`);
  console.log(`   • GET  /api/test-medicines - Test medicine data connection`);
  console.log(`\n🛒 ORDER & INVENTORY:`);
  console.log(`   • POST /api/orders - Place orders`);
  console.log(`   • GET  /api/inventory/low-stock - Low stock alerts`);
  console.log(`\n🔧 UTILITY ENDPOINTS:`);
  console.log(`   • GET  /api/health - Health check`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});
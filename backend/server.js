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

// MongoDB connection
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
  process.exit(1);
});

// Import and use routes
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

  try {
    const labTestRoutes = require('./routes/labtests');
    app.use('/api/lab-tests', labTestRoutes);
    console.log('✅ Lab test routes loaded');
  } catch (error) {
    console.warn('⚠️ Lab test routes not loaded:', error.message);
  }

  // ADD THESE NEW ROUTES:
  try {
    const orderRoutes = require('./routes/orders');
    app.use('/api/orders', orderRoutes);
    console.log('✅ Order routes loaded');
  } catch (error) {
    console.warn('⚠️ Order routes not loaded:', error.message);
  }

  try {
    const adminSettingsRoutes = require('./routes/adminSettings');
    app.use('/api/admin/settings', adminSettingsRoutes);
    console.log('✅ Admin settings routes loaded');
  } catch (error) {
    console.warn('⚠️ Admin settings routes not loaded:', error.message);
  }

  try {
    const adminRoutes = require('./routes/admin');
    app.use('/api/admin', adminRoutes);
    console.log('✅ Admin routes loaded');
  } catch (error) {
    console.warn('⚠️ Admin routes not loaded:', error.message);
  }
};

loadRoutes();

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

// Test order route
app.get('/api/orders/test', (req, res) => {
  res.json({
    success: true,
    message: 'Orders API is working!',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 MediConnect Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n📦 ORDER ENDPOINTS:`);
  console.log(`   • POST /api/orders - Create new order`);
  console.log(`   • GET  /api/orders/user/:userId - Get user orders`);
  console.log(`   • GET  /api/orders/test - Test orders API`);
  console.log(`\n👨‍💼 ADMIN ENDPOINTS:`);
  console.log(`   • GET  /api/admin/settings - Get admin settings`);
  console.log(`\n🔧 UTILITY ENDPOINTS:`);
  console.log(`   • GET  /api/health - Health check`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});
// In your server.js file, add this to the loadRoutes function:
try {
  const compatibleAppointmentRoutes = require('./routes/appointments-compatible');
  app.use('/api/appointments', compatibleAppointmentRoutes);
  console.log('✅ Compatible appointment routes loaded');
} catch (error) {
  console.warn('⚠️ Compatible appointment routes not loaded:', error.message);
}
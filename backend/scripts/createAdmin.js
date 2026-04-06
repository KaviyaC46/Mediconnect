// scripts/createAdmin.js
const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const createAdmin = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mediconnect');
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@mediconnect.com' });
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists:');
      console.log('   Email:', existingAdmin.email);
      console.log('   Role:', existingAdmin.role);
      console.log('   Name:', existingAdmin.name);
      await mongoose.connection.close();
      return;
    }

    // Create admin user
    const adminUser = new User({
      name: 'System Administrator',
      email: 'admin123@gmail.com',
      password: 'admin123', // This will be hashed by the pre-save hook
      phone: '9876543210',
      role: 'admin',
      age: 30,
      gender: 'Male',
      address: {
        street: 'Admin Street',
        city: 'Admin City',
        state: 'Admin State',
        pincode: '100001',
        country: 'India'
      }
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully:');
    console.log('   Email: admin@mediconnect.com');
    console.log('   Password: admin123');
    console.log('   Role: admin');
    console.log('   Name: System Administrator');
    
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

// Run the function
createAdmin();
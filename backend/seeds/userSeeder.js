const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const users = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: '123456',
    phone: '9876543210',
    age: 30,
    gender: 'Male',
    address: {
      street: '123 Main St',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    }
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: '123456',
    phone: '9876543211',
    age: 25,
    gender: 'Female',
    address: {
      street: '456 Park Ave',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001'
    }
  }
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare');
    console.log('✅ Connected to MongoDB');

    // Clear existing users
    await User.deleteMany();
    console.log('🗑️  Cleared existing users');

    // Insert new users
    await User.insertMany(users);
    console.log('🌱 Users seeded successfully');

    const seededUsers = await User.find().select('name email phone');
    console.log('\n📋 Seeded Users:');
    seededUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.phone}`);
    });

    console.log(`\n✅ Successfully seeded ${seededUsers.length} users`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedUsers();
}

module.exports = seedUsers;
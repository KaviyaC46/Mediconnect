const mongoose = require('mongoose');
const Medicine = require('./models/Medicine');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mediconnect', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function testMedicines() {
    try {
        console.log('Testing medicine data...');
        
        // Count total medicines
        const total = await Medicine.countDocuments();
        console.log('Total medicines in database:', total);
        
        // Get active medicines
        const activeMedicines = await Medicine.find({ isActive: true });
        console.log('Active medicines:', activeMedicines.length);
        
        // Display first 5 medicines
        console.log('\nFirst 5 medicines:');
        activeMedicines.slice(0, 5).forEach(med => {
            console.log(`- ${med.name} (${med.brand}) - ₹${med.discountedPrice || med.price}`);
        });
        
        // Test categories
        const categories = await Medicine.distinct('category');
        console.log('\nAvailable categories:', categories);
        
    } catch (error) {
        console.error('Test error:', error);
    } finally {
        mongoose.connection.close();
    }
}

testMedicines();
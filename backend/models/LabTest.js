const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Test name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  description: {
    type: String,
    trim: true
  },
  parameters: [{
    type: String,
    trim: true
  }],
  fastingRequired: {
    type: Boolean,
    default: false
  },
  reportTime: {
    type: String,
    default: '24 hours'
  },
  sampleType: {
    type: String,
    default: 'Blood'
  },
  preparation: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  }
}, {
  timestamps: true
});

// Calculate discounted price before saving
labTestSchema.pre('save', function(next) {
  if (this.discount > 0 && this.originalPrice) {
    this.price = this.originalPrice - (this.originalPrice * this.discount / 100);
  }
  next();
});

// Index for better search performance
labTestSchema.index({ name: 'text', category: 'text', description: 'text' });
labTestSchema.index({ category: 1 });
labTestSchema.index({ isActive: 1 });

module.exports = mongoose.model('LabTest', labTestSchema);
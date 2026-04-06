const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true
  },
  brand: {
    type: String,
    required: [true, 'Brand name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Pain Relief',
      'Antibiotic',
      'Vitamin',
      'Cardiac',
      'Diabetes',
      'Gastrointestinal',
      'Dermatology',
      'Respiratory',
      'Neurology',
      'Other'
    ]
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  discountedPrice: {
    type: Number,
    min: [0, 'Discounted price cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  composition: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    trim: true
  },
  prescriptionRequired: {
    type: Boolean,
    default: false
  },
  inStock: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    default: 0
  },
  images: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  manufacturer: {
    type: String,
    trim: true
  },
  expiryDate: {
    type: Date
  },
  dosage: {
    type: String,
    trim: true
  },
  sideEffects: [{
    type: String,
    trim: true
  }],
  precautions: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Calculate discounted price before saving
medicineSchema.pre('save', function(next) {
  if (this.discount > 0) {
    this.discountedPrice = this.price - (this.price * this.discount / 100);
  } else {
    this.discountedPrice = this.price;
  }
  next();
});

// Update stock status based on stock quantity
medicineSchema.pre('save', function(next) {
  this.inStock = this.stock > 0;
  next();
});

// Index for better search performance
medicineSchema.index({ name: 'text', brand: 'text', composition: 'text' });
medicineSchema.index({ category: 1 });
medicineSchema.index({ brand: 1 });
medicineSchema.index({ isActive: 1 });

module.exports = mongoose.model('Medicine', medicineSchema);
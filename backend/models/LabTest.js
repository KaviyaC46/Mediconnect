const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add test name'],
    trim: true,
    maxlength: [200, 'Name cannot be more than 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Please add category'],
    enum: [
      'Blood Test', 'Urine Test', 'Imaging', 'Cardiac', 'Hormone',
      'Allergy', 'Genetic', 'Cancer', 'Infectious Disease', 'Metabolic',
      'Liver Function', 'Kidney Function', 'Thyroid', 'Vitamin', 'Health Package'
    ]
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add price'],
    min: [0, 'Price cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot be more than 100%']
  },
  fastingRequired: {
    type: Boolean,
    default: false
  },
  reportTime: {
    type: String,
    required: [true, 'Please add report time'],
    default: '24 hours'
  },
  testDetails: [String], // What the test includes
  preparation: [String], // Preparation instructions
  includedTests: [String], // For packages
  popular: {
    type: Boolean,
    default: false
  },
  tags: [String], // For search
  department: {
    type: String,
    enum: [
      'Pathology', 'Radiology', 'Cardiology', 'Neurology', 'Oncology',
      'Endocrinology', 'Gastroenterology', 'General'
    ]
  },
  sampleType: {
    type: String,
    enum: ['Blood', 'Urine', 'Saliva', 'Tissue', 'Stool', 'Other'],
    default: 'Blood'
  },
  sampleVolume: String, // e.g., "5ml", "10ml"
  container: String, // e.g., "Vacutainer", "Sterile Container"
  storage: {
    type: String,
    default: 'Room Temperature'
  },
  methodology: String, // Testing methodology
  clinicalSignificance: String, // What the results mean
  normalRange: String, // Normal values
  isActive: {
    type: Boolean,
    default: true
  },
  popularityScore: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Virtual for discounted price
labTestSchema.virtual('discountedPrice').get(function() {
  return this.price - (this.price * this.discount / 100);
});

// Index for search functionality
labTestSchema.index({ name: 'text', category: 'text', tags: 'text' });
labTestSchema.index({ category: 1 });
labTestSchema.index({ popular: -1 });
labTestSchema.index({ department: 1 });

// Method to increment popularity
labTestSchema.methods.incrementPopularity = function() {
  this.popularityScore += 1;
  if (this.popularityScore >= 100) {
    this.popular = true;
  }
  return this.save();
};

module.exports = mongoose.model('LabTest', labTestSchema);
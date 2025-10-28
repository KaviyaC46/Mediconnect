const mongoose = require('mongoose');

const labOrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tests: [{
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabTest',
      required: true
    },
    price: {
      type: Number,
      required: [true, 'Please add test price'],
      min: [0, 'Price cannot be negative']
    }
  }],
  totalAmount: {
    type: Number,
    required: [true, 'Please add total amount'],
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'sample_collected', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  patientDetails: {
    name: {
      type: String,
      required: [true, 'Please add patient name']
    },
    age: {
      type: Number,
      required: [true, 'Please add patient age'],
      min: [1, 'Age must be at least 1'],
      max: [120, 'Age cannot be more than 120']
    },
    gender: {
      type: String,
      required: [true, 'Please add patient gender'],
      enum: ['Male', 'Female', 'Other']
    },
    phone: {
      type: String,
      required: [true, 'Please add patient phone number']
    },
    email: String
  },
  address: {
    address: {
      type: String,
      required: [true, 'Please add address']
    },
    city: {
      type: String,
      required: [true, 'Please add city']
    },
    state: {
      type: String,
      required: [true, 'Please add state']
    },
    pincode: {
      type: String,
      required: [true, 'Please add pincode'],
      match: [/^\d{6}$/, 'Please add a valid 6-digit pincode']
    },
    landmark: String,
    instructions: String // Special instructions for sample collection
  },
  preferredDate: {
    type: Date,
    required: [true, 'Please add preferred date']
  },
  preferredTime: {
    type: String,
    required: [true, 'Please add preferred time'],
    enum: ['Morning (8AM-12PM)', 'Afternoon (12PM-4PM)', 'Evening (4PM-8PM)', 'Anytime']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['online', 'cash', 'card', 'insurance'],
    default: 'online'
  },
  transactionId: String,
  sampleCollectedAt: Date,
  reportGeneratedAt: Date,
  reportUrl: String, // URL to download the report
  technicianNotes: String,
  cancellationReason: {
    type: String,
    maxlength: [500, 'Cancellation reason cannot be more than 500 characters']
  },
  rescheduled: {
    originalDate: Date,
    reason: String,
    rescheduledAt: Date
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date
}, {
  timestamps: true
});

// Index for efficient queries
labOrderSchema.index({ user: 1, createdAt: -1 });
labOrderSchema.index({ status: 1 });
labOrderSchema.index({ 'patientDetails.phone': 1 });
labOrderSchema.index({ preferredDate: 1 });

// Virtual for test count
labOrderSchema.virtual('testCount').get(function() {
  return this.tests.length;
});

// Virtual for order age in days
labOrderSchema.virtual('orderAge').get(function() {
  const diffTime = Math.abs(new Date() - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to calculate total amount
labOrderSchema.pre('save', function(next) {
  if (this.isModified('tests')) {
    this.totalAmount = this.tests.reduce((total, test) => {
      return total + test.price;
    }, 0);
  }
  next();
});

// Method to check if sample collection is today
labOrderSchema.methods.isCollectionToday = function() {
  const today = new Date().toDateString();
  const preferred = new Date(this.preferredDate).toDateString();
  return today === preferred;
};

module.exports = mongoose.model('LabOrder', labOrderSchema);
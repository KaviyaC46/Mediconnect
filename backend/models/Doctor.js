const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add doctor name'],
    trim: true
  },
  specialty: {
    type: String,
    required: [true, 'Please add specialty'],
    trim: true
  },
  qualification: {
    type: String,
    required: [true, 'Please add qualification']
  },
  experience: {
    type: Number,
    required: [true, 'Please add experience in years'],
    min: 0
  },
  location: {
    type: String,
    required: [true, 'Please add location']
  },
  consultationFee: {
    type: Number,
    required: [true, 'Please add consultation fee'],
    min: 0
  },
  availability: [{
    day: {
      type: String,
      required: true
    },
    slots: [{
      type: String,
      required: true
    }]
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema);
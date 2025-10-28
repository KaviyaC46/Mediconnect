const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  medicineIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine'
  }],
  imageUrl: String,
  doctorDetails: {
    name: String,
    license: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
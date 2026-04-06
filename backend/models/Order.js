const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  items: [{
    productId: String,
    name: String,
    type: String,
    price: Number,
    quantity: Number,
    testDetails: {
      patientName: String,
      patientAge: Number,
      patientGender: String,
      preferredDate: Date,
      preferredTime: String
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'card', 'cash'],
    default: 'upi'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  upiTransactionId: String,
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    name: String,
    phone: String,
    address: String,
    city: String,
    pincode: String
  },
  adminApproval: {
    approved: { type: Boolean, default: false },
    approvedBy: String,
    approvedAt: Date,
    notes: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema({
  upiId: {
    type: String,
    default: 'mediconnect.admin@upi'
  },
  qrCodeImage: {
    type: String,
    default: '/images/upi-qr.png'
  },
  bankDetails: {
    accountNumber: String,
    accountName: String,
    ifscCode: String,
    bankName: String
  },
  contactInfo: {
    phone: String,
    email: String,
    address: String
  }
});

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);
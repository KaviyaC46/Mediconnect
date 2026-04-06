const express = require('express');
const router = express.Router();
const AdminSettings = require('../models/AdminSettings');

// Get admin settings
router.get('/', async (req, res) => {
  try {
    let settings = await AdminSettings.findOne();
    
    if (!settings) {
      // Create default settings if none exist
      settings = new AdminSettings({
        upiId: 'mediconnect.admin@upi',
        qrCodeImage: '/images/upi-qr.png',
        bankDetails: {
          accountNumber: '123456789012',
          accountName: 'MediConnect Healthcare',
          ifscCode: 'SBIN0000123',
          bankName: 'State Bank of India'
        },
        contactInfo: {
          phone: '+91-9876543210',
          email: 'admin@mediconnect.com',
          address: '123 Medical Street, Healthcare City, India'
        }
      });
      await settings.save();
    }
const express = require('express');
const router = express.Router();
const AdminSettings = require('../models/AdminSettings');

// Get admin settings
router.get('/', async (req, res) => {
  try {
    let settings = await AdminSettings.findOne();
    
    if (!settings) {
      // Create default settings if none exist
      settings = new AdminSettings({
        upiId: 'mediconnect.admin@upi',
        qrCodeImage: '/images/upi-qr.png',
        bankDetails: {
          accountNumber: '123456789012',
          accountName: 'MediConnect Healthcare',
          ifscCode: 'SBIN0000123',
          bankName: 'State Bank of India'
        },
        contactInfo: {
          phone: '+91-9876543210',
          email: 'admin@mediconnect.com',
          address: '123 Medical Street, Healthcare City, India'
        }
      });
      await settings.save();
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get admin settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin settings'
    });
  }
});

module.exports = router;
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get admin settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin settings'
    });
  }
});

module.exports = router;
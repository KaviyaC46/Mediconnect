const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

// Admin login (keep your existing login code)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!['admin', 'superadmin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin login'
    });
  }
});

// Get all orders for admin
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
});

// Approve order (mark as payment received)
router.put('/orders/:orderId/approve', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { notes } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.adminApproval = {
      approved: true,
      approvedBy: req.user?._id || 'admin',
      approvedAt: new Date(),
      notes: notes || 'Payment received via UPI'
    };
    order.orderStatus = 'confirmed';
    order.paymentStatus = 'completed';

    await order.save();

    res.json({
      success: true,
      message: 'Order approved successfully',
      data: order
    });
  } catch (error) {
    console.error('Approve order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving order'
    });
  }
});

// Update order status
router.put('/orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.orderStatus = status;
    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status'
    });
  }
});

module.exports = router;
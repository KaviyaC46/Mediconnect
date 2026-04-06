const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Test route - GET /api/orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(10);
    
    res.json({
      success: true,
      message: 'Orders API is working!',
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders: ' + error.message
    });
  }
});

// Create new order - POST /api/orders
router.post('/', async (req, res) => {
  try {
    console.log('📦 Creating new order:', req.body);
    
    const { items, totalAmount, paymentMethod, upiTransactionId, shippingAddress, userId } = req.body;

    if (!items || !totalAmount || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: items, totalAmount, userId'
      });
    }

    // Generate simple order ID
    const orderId = 'ORD' + Date.now();

    const order = new Order({
      orderId,
      userId,
      items,
      totalAmount,
      paymentMethod: paymentMethod || 'upi',
      upiTransactionId: upiTransactionId || '',
      shippingAddress: shippingAddress || {},
      orderStatus: 'pending',
      paymentStatus: 'pending'
    });

    await order.save();

    console.log('✅ Order created successfully:', orderId);

    res.json({
      success: true,
      message: 'Order placed successfully',
      order: order
    });
  } catch (error) {
    console.error('❌ Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order: ' + error.message
    });
  }
});

// Get user orders
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
});

module.exports = router;
const express = require('express');
const Order = require('../models/Order');
const Medicine = require('../models/Medicine');
const auth = require('../middleware/auth');
const router = express.Router();
const Razorpay = require('razorpay');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const medicine = await Medicine.findById(item.medicineId);
      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: `Medicine ${item.medicineId} not found`
        });
      }

      if (!medicine.inStock) {
        return res.status(400).json({
          success: false,
          message: `${medicine.name} is out of stock`
        });
      }

      if (medicine.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${medicine.stock} units of ${medicine.name} available`
        });
      }

      const itemTotal = medicine.discountedPrice * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        medicine: medicine._id,
        quantity: item.quantity,
        price: medicine.discountedPrice
      });
    }

    // Create order
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      finalAmount: totalAmount,
      shippingAddress,
      paymentMethod
    });

    // Create Razorpay order for online payments
    if (paymentMethod !== 'cod') {
      const razorpayOrder = await razorpay.orders.create({
        amount: totalAmount * 100, // Razorpay expects amount in paise
        currency: 'INR',
        receipt: order.orderId,
        payment_capture: 1
      });

      order.razorpayOrderId = razorpayOrder.id;
    }

    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
      razorpayOrder: paymentMethod !== 'cod' ? {
        id: order.razorpayOrderId,
        amount: totalAmount * 100,
        currency: 'INR'
      } : null
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order: ' + error.message
    });
  }
});

// @desc    Verify payment
// @route   POST /api/orders/verify-payment
// @access  Private
router.post('/verify-payment', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature === razorpay_signature) {
      // Payment successful
      const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      order.paymentStatus = 'completed';
      order.razorpayPaymentId = razorpay_payment_id;
      order.razorpaySignature = razorpay_signature;
      order.orderStatus = 'confirmed';

      // Update medicine stock
      for (const item of order.items) {
        await Medicine.findByIdAndUpdate(
          item.medicine,
          { $inc: { stock: -item.quantity } }
        );
      }

      await order.save();

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: order
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment'
    });
  }
});

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.medicine', 'name brand image')
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

module.exports = router;
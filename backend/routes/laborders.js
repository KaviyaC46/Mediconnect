const express = require('express');
const LabOrder = require('../models/LabOrder');
const LabTest = require('../models/LabTest');
const router = express.Router();

// @desc    Create new lab test order
// @route   POST /api/laborders
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { 
      tests, 
      totalAmount, 
      patientDetails, 
      address, 
      preferredDate, 
      preferredTime,
      paymentMethod 
    } = req.body;

    // Validate tests
    for (let testItem of tests) {
      const test = await LabTest.findById(testItem.test);
      
      if (!test) {
        return res.status(404).json({
          success: false,
          message: `Lab test with ID ${testItem.test} not found`
        });
      }
    }

    // For now, using mock user ID
    // In real app, this would come from auth middleware
    const user = '64a1b2c3d4e5f67890123456'; // Mock user ID

    // Create lab order
    const labOrder = new LabOrder({
      user,
      tests,
      totalAmount,
      patientDetails,
      address,
      preferredDate: new Date(preferredDate),
      preferredTime,
      paymentMethod
    });

    const savedOrder = await labOrder.save();
    await savedOrder.populate('tests.test');

    res.status(201).json({
      success: true,
      message: 'Lab test order booked successfully',
      data: savedOrder
    });

  } catch (error) {
    console.error('Create lab order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error booking lab test order'
    });
  }
});

// @desc    Get user's lab orders
// @route   GET /api/laborders/my-orders
// @access  Private
router.get('/my-orders', async (req, res) => {
  try {
    // For now, using mock user ID
    const user = '64a1b2c3d4e5f67890123456'; // Mock user ID

    const labOrders = await LabOrder.find({ user })
      .populate('tests.test')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: labOrders
    });

  } catch (error) {
    console.error('Get lab orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lab orders'
    });
  }
});

// @desc    Get lab order by ID
// @route   GET /api/laborders/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const labOrder = await LabOrder.findById(req.params.id)
      .populate('user')
      .populate('tests.test');

    if (!labOrder) {
      return res.status(404).json({
        success: false,
        message: 'Lab order not found'
      });
    }

    res.json({
      success: true,
      data: labOrder
    });

  } catch (error) {
    console.error('Get lab order error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Lab order not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching lab order details'
    });
  }
});

// @desc    Update lab order status
// @route   PUT /api/laborders/:id
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { 
      status, 
      sampleCollectedAt, 
      reportGeneratedAt, 
      reportUrl, 
      technicianNotes,
      cancellationReason 
    } = req.body;

    const labOrder = await LabOrder.findById(req.params.id);
    
    if (!labOrder) {
      return res.status(404).json({
        success: false,
        message: 'Lab order not found'
      });
    }

    // Update lab order
    if (status) labOrder.status = status;
    if (sampleCollectedAt) labOrder.sampleCollectedAt = new Date(sampleCollectedAt);
    if (reportGeneratedAt) labOrder.reportGeneratedAt = new Date(reportGeneratedAt);
    if (reportUrl) labOrder.reportUrl = reportUrl;
    if (technicianNotes) labOrder.technicianNotes = technicianNotes;
    if (cancellationReason) labOrder.cancellationReason = cancellationReason;

    const updatedOrder = await labOrder.save();
    await updatedOrder.populate('tests.test');

    res.json({
      success: true,
      message: `Lab order ${status} successfully`,
      data: updatedOrder
    });

  } catch (error) {
    console.error('Update lab order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating lab order'
    });
  }
});

// @desc    Cancel lab order
// @route   PUT /api/laborders/:id/cancel
// @access  Private
router.put('/:id/cancel', async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    const labOrder = await LabOrder.findById(req.params.id);
    
    if (!labOrder) {
      return res.status(404).json({
        success: false,
        message: 'Lab order not found'
      });
    }

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(labOrder.status)) {
      return res.status(400).json({
        success: false,
        message: `Lab order cannot be cancelled in ${labOrder.status} status`
      });
    }

    // Update order status
    labOrder.status = 'cancelled';
    labOrder.cancellationReason = cancellationReason;

    const updatedOrder = await labOrder.save();
    await updatedOrder.populate('tests.test');

    res.json({
      success: true,
      message: 'Lab order cancelled successfully',
      data: updatedOrder
    });

  } catch (error) {
    console.error('Cancel lab order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling lab order'
    });
  }
});

// @desc    Reschedule lab order
// @route   PUT /api/laborders/:id/reschedule
// @access  Private
router.put('/:id/reschedule', async (req, res) => {
  try {
    const { preferredDate, preferredTime, reason } = req.body;

    const labOrder = await LabOrder.findById(req.params.id);
    
    if (!labOrder) {
      return res.status(404).json({
        success: false,
        message: 'Lab order not found'
      });
    }

    // Check if order can be rescheduled
    if (!['pending', 'confirmed'].includes(labOrder.status)) {
      return res.status(400).json({
        success: false,
        message: `Lab order cannot be rescheduled in ${labOrder.status} status`
      });
    }

    // Store original date for reschedule history
    labOrder.rescheduled = {
      originalDate: labOrder.preferredDate,
      reason: reason,
      rescheduledAt: new Date()
    };

    // Update preferred date and time
    labOrder.preferredDate = new Date(preferredDate);
    labOrder.preferredTime = preferredTime;

    const updatedOrder = await labOrder.save();
    await updatedOrder.populate('tests.test');

    res.json({
      success: true,
      message: 'Lab order rescheduled successfully',
      data: updatedOrder
    });

  } catch (error) {
    console.error('Reschedule lab order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rescheduling lab order'
    });
  }
});

// @desc    Download lab report
// @route   GET /api/laborders/:id/report
// @access  Private
router.get('/:id/report', async (req, res) => {
  try {
    const labOrder = await LabOrder.findById(req.params.id)
      .populate('tests.test')
      .populate('user');

    if (!labOrder) {
      return res.status(404).json({
        success: false,
        message: 'Lab order not found'
      });
    }

    if (!labOrder.reportUrl) {
      return res.status(404).json({
        success: false,
        message: 'Report not available yet'
      });
    }

    if (labOrder.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Report is not ready for download'
      });
    }

    // In a real application, you would:
    // 1. Generate PDF report
    // 2. Stream the file
    // 3. Or redirect to the report URL
    
    // For now, we'll return the report URL
    res.json({
      success: true,
      message: 'Report download ready',
      data: {
        reportUrl: labOrder.reportUrl,
        downloadLink: `/api/laborders/${labOrder._id}/report/download`
      }
    });

  } catch (error) {
    console.error('Download report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading report'
    });
  }
});

// @desc    Get today's sample collections
// @route   GET /api/laborders/today-collections
// @access  Private
router.get('/data/today-collections', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCollections = await LabOrder.find({
      preferredDate: {
        $gte: today,
        $lt: tomorrow
      },
      status: { $in: ['confirmed', 'sample_collected'] }
    })
    .populate('tests.test')
    .populate('user')
    .sort({ preferredTime: 1 });

    res.json({
      success: true,
      data: todayCollections
    });

  } catch (error) {
    console.error('Get today collections error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching today collections'
    });
  }
});

// @desc    Update payment status
// @route   PUT /api/laborders/:id/payment
// @access  Private
router.put('/:id/payment', async (req, res) => {
  try {
    const { paymentStatus, transactionId } = req.body;

    const labOrder = await LabOrder.findById(req.params.id);
    
    if (!labOrder) {
      return res.status(404).json({
        success: false,
        message: 'Lab order not found'
      });
    }

    // Update payment details
    labOrder.paymentStatus = paymentStatus;
    if (transactionId) labOrder.transactionId = transactionId;

    // If payment completed, confirm the order
    if (paymentStatus === 'completed' && labOrder.status === 'pending') {
      labOrder.status = 'confirmed';
    }

    const updatedOrder = await labOrder.save();
    await updatedOrder.populate('tests.test');

    res.json({
      success: true,
      message: `Payment status updated to ${paymentStatus}`,
      data: updatedOrder
    });

  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment status'
    });
  }
});

module.exports = router;
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middleware/auth');

// Simple appointment model that matches frontend structure
const appointmentSchema = new mongoose.Schema({
  _id: String,
  appointmentId: String,
  doctor: {
    _id: String,
    name: String,
    specialization: String,
    hospital: String,
    experience: String,
    rating: Number
  },
  date: String,
  time: String,
  symptoms: String,
  type: String,
  status: {
    type: String,
    default: 'confirmed'
  },
  consultationFee: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  patient: {
    name: String,
    age: String,
    gender: String
  },
  userId: String
}, { _id: false }); // Disable automatic _id generation since we're providing it

const CompatibleAppointment = mongoose.model('CompatibleAppointment', appointmentSchema);

// @desc    Create new appointment (compatible with frontend)
// @route   POST /api/appointments/compatible
// @access  Private
router.post('/compatible', auth, async (req, res) => {
  try {
    const {
      doctor,
      date,
      time,
      symptoms,
      type,
      consultationFee,
      patient
    } = req.body;

    console.log('📅 Creating compatible appointment:', { 
      doctor: doctor.name,
      date, 
      time,
      type,
      consultationFee
    });

    // Validate required fields
    if (!doctor || !date || !time || !consultationFee || !patient || !patient.name) {
      return res.status(400).json({
        success: false,
        message: 'Doctor, date, time, consultation fee, and patient name are required'
      });
    }

    // Generate unique IDs
    const _id = 'appt_' + Date.now();
    const appointmentId = 'APT' + Date.now();

    const appointment = new CompatibleAppointment({
      _id,
      appointmentId,
      doctor,
      date,
      time,
      symptoms: symptoms || '',
      type: type || 'video',
      status: 'confirmed',
      consultationFee,
      patient,
      userId: req.user.id,
      createdAt: new Date()
    });

    const savedAppointment = await appointment.save();

    console.log('✅ Compatible appointment created successfully');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: savedAppointment
    });

  } catch (error) {
    console.error('❌ Create compatible appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while booking appointment: ' + error.message
    });
  }
});

// @desc    Get user's appointments (compatible with frontend)
// @route   GET /api/appointments/compatible/my-appointments
// @access  Private
router.get('/compatible/my-appointments', auth, async (req, res) => {
  try {
    console.log('📋 Fetching compatible appointments for user:', req.user.id);
    
    const appointments = await CompatibleAppointment.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    console.log('✅ Found compatible appointments:', appointments.length);

    res.json({
      success: true,
      appointments
    });

  } catch (error) {
    console.error('❌ Get compatible appointments error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching appointments' 
    });
  }
});

// @desc    Cancel appointment
// @route   DELETE /api/appointments/compatible/:id
// @access  Private
router.delete('/compatible/:id', auth, async (req, res) => {
  try {
    console.log('🗑️ Cancelling appointment:', req.params.id);
    
    const appointment = await CompatibleAppointment.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    await CompatibleAppointment.deleteOne({ _id: req.params.id });

    console.log('✅ Appointment cancelled successfully');

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });

  } catch (error) {
    console.error('❌ Cancel appointment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while cancelling appointment' 
    });
  }
});

// @desc    DEBUG: Check all compatible appointments
// @route   GET /api/appointments/compatible/debug
// @access  Private
router.get('/compatible/debug', auth, async (req, res) => {
  try {
    const allAppointments = await CompatibleAppointment.find({});
    
    res.json({
      success: true,
      message: `Found ${allAppointments.length} compatible appointments`,
      data: allAppointments
    });

  } catch (error) {
    console.error('🐛 DEBUG Error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug error: ' + error.message
    });
  }
});

module.exports = router;
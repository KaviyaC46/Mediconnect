const express = require('express');
const mongoose = require('mongoose'); // ADDED this import
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const auth = require('../middleware/auth');
const router = express.Router();

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { doctorId, date, time, consultationType, symptoms, amount } = req.body;

    console.log('📅 Creating appointment with:', { 
      doctorId, 
      date, 
      time, 
      consultationType,
      amount,
      user: req.user.id 
    });

    // Validate required fields - USING FRONTEND FIELD NAMES
    if (!doctorId || !date || !time || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Doctor, date, time, and amount are required'
      });
    }

    // Validate doctorId format
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID format'
      });
    }

    // Check if doctor exists
    console.log('🔍 Searching for doctor with ID:', doctorId);
    const doctor = await Doctor.findById(doctorId);
    
    if (!doctor) {
      console.log('❌ Doctor not found in database');
      return res.status(404).json({
        success: false,
        message: 'Doctor not found. Please select a valid doctor.'
      });
    }

    console.log('✅ Doctor found:', doctor.name, '-', doctor.specialization);

    // Check if doctor is active
    if (doctor.isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'This doctor is currently not accepting appointments'
      });
    }

    // Check for existing appointment at same time slot
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date: new Date(date),
      timeSlot: time, // Map frontend 'time' to model 'timeSlot'
      status: { $in: ['scheduled', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked. Please choose another time.'
      });
    }

    // Validate date is not in the past
    const appointmentDateTime = new Date(date);
    if (appointmentDateTime < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book appointment for past dates'
      });
    }

    // Create appointment - MAPPING FRONTEND FIELDS TO MODEL FIELDS
    const appointment = new Appointment({
      patientId: req.user.id,
      doctorId,
      date: new Date(date),
      timeSlot: time, // Map 'time' from frontend to 'timeSlot' in model
      appointmentType: consultationType || 'consultation',
      symptoms: symptoms || [],
      reason: symptoms && symptoms.length > 0 ? symptoms.join(', ') : 'General consultation'
    });

    const savedAppointment = await appointment.save();
    
    // Populate doctor details for response
    await savedAppointment.populate('doctorId', 'name specialization experience rating fee qualification languages address about');

    console.log('✅ Appointment created successfully ID:', savedAppointment._id);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: savedAppointment
    });

  } catch (error) {
    console.error('❌ Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while booking appointment: ' + error.message
    });
  }
});

// @desc    Get user's appointments
// @route   GET /api/appointments/my-appointments
// @access  Private
router.get('/my-appointments', auth, async (req, res) => {
  try {
    console.log('📋 Fetching appointments for user:', req.user.id);
    
    const appointments = await Appointment.find({ patientId: req.user.id })
      .populate('doctorId', 'name specialization experience rating fee qualification languages address about')
      .sort({ date: -1, createdAt: -1 });

    console.log('✅ Found appointments:', appointments.length);

    res.json({
      success: true,
      data: appointments
    });

  } catch (error) {
    console.error('❌ Get appointments error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching appointments' 
    });
  }
});

// @desc    Update appointment status
// @route   PUT /api/appointments/:id
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;

    console.log('🔄 Updating appointment:', req.params.id, 'to status:', status);

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patientId: req.user.id
    });
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Update appointment
    appointment.status = status;
    const updatedAppointment = await appointment.save();
    await updatedAppointment.populate('doctorId', 'name specialization');

    console.log('✅ Appointment updated successfully');

    res.json({
      success: true,
      message: `Appointment ${status} successfully`,
      data: updatedAppointment
    });

  } catch (error) {
    console.error('❌ Update appointment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while updating appointment' 
    });
  }
});

// @desc    Get available time slots for a doctor
// @route   GET /api/appointments/slots
// @access  Private
router.get('/slots', auth, async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    
    if (!doctorId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID and date are required'
      });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get existing appointments for that day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await Appointment.find({
      doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['scheduled', 'confirmed'] }
    });

    // Generate time slots
    const slots = generateTimeSlots('09:00', '17:00', 30);
    const bookedSlots = existingAppointments.map(apt => apt.timeSlot);
    const availableSlots = slots.filter(slot => !bookedSlots.includes(slot));

    res.json({
      success: true,
      data: availableSlots
    });

  } catch (error) {
    console.error('❌ Get slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching available slots'
    });
  }
});

// @desc    DEBUG: Check all doctors in database
// @route   GET /api/appointments/debug/doctors
// @access  Private
router.get('/debug/doctors', auth, async (req, res) => {
  try {
    console.log('🐛 DEBUG: Checking all doctors in database');
    
    const allDoctors = await Doctor.find({});
    console.log('🐛 Total doctors in DB:', allDoctors.length);
    
    const doctorsList = allDoctors.map(doc => ({
      id: doc._id,
      name: doc.name,
      specialization: doc.specialization,
      isActive: doc.isActive
    }));

    res.json({
      success: true,
      message: `Found ${allDoctors.length} doctors in database`,
      data: doctorsList
    });

  } catch (error) {
    console.error('🐛 DEBUG Error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug error: ' + error.message
    });
  }
});

// Helper function to generate time slots
function generateTimeSlots(startTime, endTime, duration) {
  const slots = [];
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  let currentHour = startHour;
  let currentMinute = startMinute;
  
  while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
    const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    slots.push(timeString);
    
    currentMinute += duration;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }
  }
  
  return slots;
}

module.exports = router;
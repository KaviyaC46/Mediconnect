import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Rating,
  Chip,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  Person,
  CalendarMonth,
  AccessTime,
  LocationOn,
  School,
  Work,
  Language,
  VideoCall
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bookingStep, setBookingStep] = useState(0);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('video');
  const [patientDetails, setPatientDetails] = useState({
    name: '',
    age: '',
    gender: '',
    symptoms: ''
  });
  const [loading, setLoading] = useState(false);

  // Mock doctor data - replace with API call
  const doctor = {
    _id: id || '1',
    name: 'Dr. Sarah Johnson',
    specialization: 'Cardiologist',
    rating: 4.8,
    reviews: 127,
    experience: '10 years',
    education: 'MD Cardiology, AIIMS Delhi',
    languages: ['English', 'Hindi', 'Spanish'],
    hospital: 'City Medical Center',
    address: '123 Medical Street, Healthcare City',
    consultationFee: 500,
    availability: ['Monday', 'Wednesday', 'Friday'],
    about: 'Dr. Sarah Johnson is a renowned cardiologist with over 10 years of experience in treating heart-related conditions. She specializes in interventional cardiology and has successfully performed over 1000 cardiac procedures.',
    services: ['Heart Checkup', 'ECG', 'Echo', 'Angioplasty']
  };

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
  ];

  const handleBookAppointment = () => {
    setBookingDialogOpen(true);
    setBookingStep(0);
  };

  const handleCloseBooking = () => {
    setBookingDialogOpen(false);
    setBookingStep(0);
    // Reset form
    setSelectedDate('');
    setSelectedTime('');
    setAppointmentType('video');
    setPatientDetails({
      name: '',
      age: '',
      gender: '',
      symptoms: ''
    });
  };

  const handleNextStep = () => {
    setBookingStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setBookingStep(prev => prev - 1);
  };

  const handleConfirmBooking = () => {
    setLoading(true);
    
    try {
      // Create appointment object
      const appointmentData = {
        _id: 'appointment-' + Date.now(),
        appointmentId: 'APT' + Date.now(),
        doctor: {
          id: doctor._id,
          name: doctor.name,
          specialization: doctor.specialization,
          hospital: doctor.hospital,
          experience: doctor.experience
        },
        patient: {
          name: patientDetails.name,
          age: patientDetails.age,
          gender: patientDetails.gender
        },
        date: selectedDate,
        time: selectedTime,
        type: appointmentType,
        status: 'confirmed', // Auto-confirm for demo
        symptoms: patientDetails.symptoms,
        consultationFee: doctor.consultationFee,
        createdAt: new Date()
      };

      // Save to localStorage
      const existingAppointments = JSON.parse(localStorage.getItem('userAppointments') || '[]');
      const updatedAppointments = [appointmentData, ...existingAppointments];
      localStorage.setItem('userAppointments', JSON.stringify(updatedAppointments));

      console.log('✅ Appointment saved:', appointmentData);
      
      // Show success message and redirect
      setTimeout(() => {
        setLoading(false);
        alert('Appointment booked successfully! You can view it in your appointments.');
        handleCloseBooking();
        navigate('/appointments');
      }, 1000);

    } catch (error) {
      console.error('❌ Appointment booking error:', error);
      setLoading(false);
      alert('Failed to book appointment. Please try again.');
    }
  };

  const renderBookingStep = () => {
    switch (bookingStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Appointment Type
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: appointmentType === 'video' ? 2 : 1,
                    borderColor: appointmentType === 'video' ? 'primary.main' : 'divider',
                    backgroundColor: appointmentType === 'video' ? '#f0f7ff' : 'white'
                  }}
                  onClick={() => setAppointmentType('video')}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <VideoCall sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6">Video Consultation</Typography>
                    <Typography color="textSecondary">
                      Consult from home
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                      ₹{doctor.consultationFee}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: appointmentType === 'in-person' ? 2 : 1,
                    borderColor: appointmentType === 'in-person' ? 'primary.main' : 'divider',
                    backgroundColor: appointmentType === 'in-person' ? '#f0f7ff' : 'white'
                  }}
                  onClick={() => setAppointmentType('in-person')}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <LocationOn sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
                    <Typography variant="h6">In-Person Visit</Typography>
                    <Typography color="textSecondary">
                      Visit at clinic
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                      ₹{doctor.consultationFee}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Date & Time
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Select Date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ 
                    min: new Date().toISOString().split('T')[0] 
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Select Time</InputLabel>
                  <Select
                    value={selectedTime}
                    label="Select Time"
                    onChange={(e) => setSelectedTime(e.target.value)}
                  >
                    {timeSlots.map((time) => (
                      <MenuItem key={time} value={time}>
                        {time}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            {selectedDate && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Available slots for {new Date(selectedDate).toLocaleDateString()}
              </Alert>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Patient Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={patientDetails.name}
                  onChange={(e) => setPatientDetails({...patientDetails, name: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Age"
                  type="number"
                  value={patientDetails.age}
                  onChange={(e) => setPatientDetails({...patientDetails, age: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={patientDetails.gender}
                    label="Gender"
                    onChange={(e) => setPatientDetails({...patientDetails, gender: e.target.value})}
                    required
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Symptoms / Reason for visit"
                  multiline
                  rows={3}
                  value={patientDetails.symptoms}
                  onChange={(e) => setPatientDetails({...patientDetails, symptoms: e.target.value})}
                  placeholder="Describe your symptoms or reason for consultation"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Confirm Booking
            </Typography>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Appointment Summary
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Doctor:</Typography>
                <Typography fontWeight="bold">{doctor.name}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Specialization:</Typography>
                <Typography fontWeight="bold">{doctor.specialization}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Date & Time:</Typography>
                <Typography fontWeight="bold">
                  {new Date(selectedDate).toLocaleDateString()} at {selectedTime}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Type:</Typography>
                <Typography fontWeight="bold">
                  {appointmentType === 'video' ? 'Video Consultation' : 'In-Person Visit'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Patient:</Typography>
                <Typography fontWeight="bold">
                  {patientDetails.name} ({patientDetails.age} yrs, {patientDetails.gender})
                </Typography>
              </Box>
              {patientDetails.symptoms && (
                <Box sx={{ mb: 1 }}>
                  <Typography>Symptoms:</Typography>
                  <Typography fontWeight="bold" color="primary">
                    {patientDetails.symptoms}
                  </Typography>
                </Box>
              )}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Consultation Fee:</Typography>
                <Typography variant="h6" color="primary">
                  ₹{doctor.consultationFee}
                </Typography>
              </Box>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Doctor Profile */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h4" gutterBottom>
                {doctor.name}
              </Typography>
              <Typography variant="h6" color="primary" gutterBottom>
                {doctor.specialization}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating value={doctor.rating} precision={0.1} readOnly />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {doctor.rating} ({doctor.reviews} reviews)
                </Typography>
              </Box>

              <Typography variant="body1" paragraph>
                {doctor.about}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Work sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography>{doctor.experience} experience</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <School sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography>{doctor.education}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography>{doctor.hospital}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Language sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography>{doctor.languages.join(', ')}</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Services Offered:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {doctor.services.map((service, index) => (
                    <Chip key={index} label={service} variant="outlined" />
                  ))}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h5" color="primary" gutterBottom>
                  ₹{doctor.consultationFee}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Consultation Fee
                </Typography>
                <Button 
                  variant="contained" 
                  size="large" 
                  fullWidth
                  onClick={handleBookAppointment}
                  sx={{ mt: 2 }}
                >
                  Book Appointment
                </Button>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  Available: {doctor.availability.join(', ')}
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      <Dialog 
        open={bookingDialogOpen} 
        onClose={handleCloseBooking}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Book Appointment with {doctor.name}
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={bookingStep} sx={{ mb: 3 }}>
            <Step><StepLabel>Appointment Type</StepLabel></Step>
            <Step><StepLabel>Date & Time</StepLabel></Step>
            <Step><StepLabel>Patient Details</StepLabel></Step>
            <Step><StepLabel>Confirmation</StepLabel></Step>
          </Stepper>

          {renderBookingStep()}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseBooking} disabled={loading}>
            Cancel
          </Button>
          <Box sx={{ flex: 1 }} />
          {bookingStep > 0 && (
            <Button onClick={handlePrevStep} disabled={loading}>
              Back
            </Button>
          )}
          {bookingStep < 3 ? (
            <Button 
              variant="contained" 
              onClick={handleNextStep}
              disabled={
                (bookingStep === 1 && (!selectedDate || !selectedTime)) ||
                (bookingStep === 2 && (!patientDetails.name || !patientDetails.age || !patientDetails.gender)) ||
                loading
              }
            >
              Next
            </Button>
          ) : (
            <Button 
              variant="contained" 
              onClick={handleConfirmBooking}
              disabled={loading}
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DoctorDetails;
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  CircularProgress,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import { CalendarToday, Schedule, Person, LocationOn, Email, Phone } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchDoctorDetails();
  }, [doctorId]);

  const fetchDoctorDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/doctors/${doctorId}`);
      console.log('Doctor API Response:', response.data); // Debug log
      
      if (response.data.success) {
        setDoctor(response.data.data);
      } else {
        showAlert('Failed to load doctor details', 'error');
      }
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      showAlert('Error loading doctor details. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, severity = 'success') => {
    setAlert({ open: true, message, severity });
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedSlot || !patientName || !patientPhone) {
      showAlert('Please fill all required fields', 'warning');
      return;
    }

    try {
      setBookingLoading(true);
      const appointmentData = {
        doctorId,
        doctorName: doctor?.name,
        date: selectedDate,
        timeSlot: selectedSlot,
        patientName,
        patientPhone,
        symptoms,
        status: 'confirmed'
      };

      const response = await axios.post('/api/appointments', appointmentData);
      
      if (response.data.success) {
        showAlert('Appointment booked successfully!', 'success');
        setTimeout(() => {
          navigate('/appointments');
        }, 2000);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      showAlert('Error booking appointment. Please try again.', 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  // Get available time slots based on selected date
  const getAvailableSlots = () => {
    if (!selectedDate || !doctor?.availability) return [];
    
    const dayOfWeek = new Date(selectedDate).getDay();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[dayOfWeek];
    
    // Find availability for the selected day
    const dayAvailability = doctor.availability.find(avail => 
      avail.day?.toLowerCase() === today.toLowerCase()
    );
    
    return dayAvailability ? dayAvailability.slots : [];
  };

  const availableSlots = getAvailableSlots();

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading doctor details...</Typography>
      </Container>
    );
  }

  if (!doctor) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h5">Doctor not found</Typography>
        <Button variant="contained" onClick={() => navigate('/doctors')} sx={{ mt: 2 }}>
          Back to Doctors
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Doctor Info */}
      <Card sx={{ mb: 4, p: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom color="primary">
              {doctor.name || 'Doctor'}
            </Typography>
            <Chip 
              label={doctor.specialization || 'General Practitioner'} 
              color="primary" 
              sx={{ mb: 2 }} 
            />
            
            <Typography variant="body1" paragraph>
              {doctor.qualification || 'Medical Professional'}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2">
                    <strong>Location:</strong> {doctor.location || 'Not specified'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Schedule sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2">
                    <strong>Experience:</strong> {doctor.experience || 0} years
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                {doctor.contact?.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Email sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2">
                      {doctor.contact.email}
                    </Typography>
                  </Box>
                )}
                
                {doctor.contact?.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Phone sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2">
                      {doctor.contact.phone}
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>

            {doctor.consultationFee && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="h6" color="primary">
                  Consultation Fee: ₹{doctor.consultationFee}
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Card>

      {/* Appointment Form */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom color="primary">
          Book Appointment
        </Typography>

        {/* Date Selection */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Select Date
          </Typography>
          <TextField
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedSlot(''); // Reset slot when date changes
            }}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              min: new Date().toISOString().split('T')[0] // Today's date
            }}
          />
        </Box>

        {/* Time Slots */}
        {selectedDate && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Available Time Slots for {new Date(selectedDate).toLocaleDateString()}
            </Typography>
            {availableSlots.length > 0 ? (
              <Grid container spacing={1}>
                {availableSlots.map((time, index) => (
                  <Grid item key={index}>
                    <Button
                      variant={selectedSlot === time ? "contained" : "outlined"}
                      onClick={() => setSelectedSlot(time)}
                      color="primary"
                    >
                      {time}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography color="error">
                No available slots for this date. Please choose another date.
              </Typography>
            )}
          </Box>
        )}

        {/* Patient Details */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Patient Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Patient Name *"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                fullWidth
                required
                placeholder="Enter patient full name"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Phone Number *"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                fullWidth
                required
                placeholder="Enter 10-digit phone number"
                type="tel"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Symptoms or Reason for Visit"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                multiline
                rows={3}
                fullWidth
                placeholder="Describe your symptoms or reason for appointment..."
              />
            </Grid>
          </Grid>
        </Box>

        {/* Book Button */}
        <Button
          variant="contained"
          size="large"
          onClick={handleBookAppointment}
          disabled={bookingLoading || !selectedDate || !selectedSlot || !patientName || !patientPhone}
          fullWidth
          sx={{ mt: 2, py: 1.5 }}
        >
          {bookingLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            `Book Appointment - ₹${doctor.consultationFee || 0}`
          )}
        </Button>

        <Typography variant="body2" color="textSecondary" sx={{ mt: 2, textAlign: 'center' }}>
          * Required fields must be filled
        </Typography>
      </Card>

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setAlert({ ...alert, open: false })} 
          severity={alert.severity}
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default BookAppointment;
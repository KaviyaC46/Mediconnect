import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  TextField,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { LocationOn } from '@mui/icons-material';
import axios from 'axios';

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [doctorLoading, setDoctorLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState('');

  // Fetch real doctor data from API
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        console.log('🟡 Fetching doctor with ID:', id);
        const response = await axios.get(`http://localhost:5000/api/doctors/${id}`);
        console.log('✅ Doctor data:', response.data);
        
        if (response.data.success) {
          setDoctor(response.data.data);
        } else {
          setError('Doctor not found');
        }
      } catch (error) {
        console.error('❌ Error fetching doctor:', error);
        setError('Failed to load doctor details');
      } finally {
        setDoctorLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select date and time');
      return;
    }

    if (!doctor) {
      setError('Doctor information not loaded');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('authToken');
      
      console.log('🟡 Booking appointment for doctor:', doctor._id);
      console.log('📅 Date:', selectedDate);
      console.log('⏰ Time:', selectedTime);

      const response = await axios.post('http://localhost:5000/api/appointments', {
        doctorId: doctor._id, // Use the real doctor ID
        date: selectedDate,
        time: selectedTime,
        consultationType: 'in-person',
        symptoms: symptoms,
        amount: doctor.fee
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Appointment booking success:', response.data);
      
      if (response.data.success) {
        setBookingSuccess(true);
        setTimeout(() => {
          navigate('/appointments');
        }, 2000);
      }
      
    } catch (error) {
      console.error('❌ Booking error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(error.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  if (doctorLoading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <Typography>Loading doctor details...</Typography>
      </Container>
    );
  }

  if (!doctor) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <Alert severity="error">Doctor not found</Alert>
        <Button onClick={() => navigate('/doctors')} sx={{ mt: 2 }}>
          Back to Doctors
        </Button>
      </Container>
    );
  }

  if (bookingSuccess) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="success" sx={{ mb: 2 }}>
          Appointment booked successfully! Redirecting to appointments...
        </Alert>
        <Card>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="h5" gutterBottom color="primary">
              ✅ Appointment Confirmed!
            </Typography>
            <Typography variant="body1" gutterBottom>
              With: <strong>{doctor.name}</strong>
            </Typography>
            <Typography variant="body1" gutterBottom>
              Date: <strong>{selectedDate}</strong> at <strong>{selectedTime}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              You will receive a confirmation shortly.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button 
        variant="outlined" 
        onClick={() => navigate('/doctors')}
        sx={{ mb: 3 }}
      >
        ← Back to Doctors
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Doctor Info */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    mr: 3
                  }}
                >
                  {doctor.name.split(' ').map(n => n[0]).join('')}
                </Box>
                <Box>
                  <Typography variant="h4" component="h1" gutterBottom>
                    {doctor.name}
                  </Typography>
                  <Chip 
                    label={doctor.specialization} 
                    color="primary" 
                    sx={{ mr: 1, mb: 1 }}
                  />
                  <Typography variant="body1" color="textSecondary">
                    ⭐ {doctor.rating} • {doctor.experience}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="h6" gutterBottom>About</Typography>
              <Typography variant="body1" paragraph>
                {doctor.about}
              </Typography>

              <Typography variant="h6" gutterBottom>Qualifications</Typography>
              <Typography variant="body1" paragraph>
                {doctor.qualification}
              </Typography>

              <Typography variant="h6" gutterBottom>Consultation Fee</Typography>
              <Typography variant="h5" color="primary" paragraph>
                ₹{doctor.fee}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="textSecondary">
                  {doctor.address}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Booking Section */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 100 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom color="primary">
                Book Appointment
              </Typography>

              <Box sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  label="Select Date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                />

                <Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
                  Available Time Slots:
                </Typography>
                <Grid container spacing={1}>
                  {timeSlots.map((time) => (
                    <Grid item xs={6} key={time}>
                      <Button
                        fullWidth
                        variant={selectedTime === time ? "contained" : "outlined"}
                        onClick={() => setSelectedTime(time)}
                        size="small"
                      >
                        {time}
                      </Button>
                    </Grid>
                  ))}
                </Grid>

                <TextField
                  fullWidth
                  label="Symptoms (Optional)"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  multiline
                  rows={3}
                  sx={{ mt: 2 }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleBookAppointment}
                  disabled={loading || !selectedDate || !selectedTime}
                  sx={{ mt: 3 }}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Booking...' : `Book Appointment - ₹${doctor.fee}`}
                </Button>

                {selectedDate && selectedTime && (
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 2, textAlign: 'center' }}>
                    Booking for {selectedDate} at {selectedTime}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DoctorDetails;
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  CalendarMonth, 
  Person, 
  AccessTime,
  LocationOn,
  VideoCall 
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Appointments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentAppointment, setRecentAppointment] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = () => {
    setLoading(true);
    
    try {
      // Load appointments from localStorage
      const savedAppointments = JSON.parse(localStorage.getItem('userAppointments') || '[]');
      console.log('Loaded appointments from storage:', savedAppointments); // Debug log
      
      // Sort by date (newest first)
      const sortedAppointments = savedAppointments.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setAppointments(sortedAppointments);
      
      // Check for recent appointments
      const hasRecent = sortedAppointments.some(apt => isRecentAppointment(apt));
      setRecentAppointment(hasRecent);
    } catch (error) {
      console.error('Error loading appointments:', error);
      // Initialize empty array if there's an error
      localStorage.setItem('userAppointments', JSON.stringify([]));
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Safe data access functions
  const getDoctorName = (appointment) => {
    return appointment?.doctor?.name || 'Doctor Information Not Available';
  };

  const getDoctorSpecialization = (appointment) => {
    return appointment?.doctor?.specialization || 'Specialization Not Available';
  };

  const getDoctorHospital = (appointment) => {
    return appointment?.doctor?.hospital || 'Hospital Not Available';
  };

  const getDoctorExperience = (appointment) => {
    return appointment?.doctor?.experience || 'Experience Not Available';
  };

  const getPatientName = (appointment) => {
    return appointment?.patient?.name || 'Patient Name Not Available';
  };

  const getPatientAge = (appointment) => {
    return appointment?.patient?.age || '';
  };

  const getPatientGender = (appointment) => {
    return appointment?.patient?.gender || '';
  };

  const getStatusColor = (status) => {
    if (!status) return 'default';
    
    switch (status.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const getTypeColor = (type) => {
    if (!type) return 'default';
    
    switch (type.toLowerCase()) {
      case 'video': return 'primary';
      case 'in-person': return 'secondary';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatBookingDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const handleBookAppointment = () => {
    navigate('/doctors');
  };

  const handleJoinCall = (appointmentId) => {
    alert(`Joining video call for appointment ${appointmentId}`);
    // Here you would integrate with video call API
  };

  const handleCancelAppointment = (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      const updatedAppointments = appointments.filter(apt => apt._id !== appointmentId);
      setAppointments(updatedAppointments);
      
      // Update localStorage
      localStorage.setItem('userAppointments', JSON.stringify(updatedAppointments));
      
      alert('Appointment cancelled successfully');
    }
  };

  const isRecentAppointment = (appointment) => {
    if (!appointment?.createdAt) return false;
    
    try {
      const appointmentTime = new Date(appointment.createdAt);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return appointmentTime > fiveMinutesAgo;
    } catch (error) {
      return false;
    }
  };

  // Debug function to check localStorage
  const debugStorage = () => {
    const stored = localStorage.getItem('userAppointments');
    console.log('Current localStorage:', stored);
    console.log('Parsed:', JSON.parse(stored || '[]'));
  };

  if (!user) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Please login to view your appointments
        </Typography>
        <Button variant="contained" onClick={() => navigate('/login')}>
          Login
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Debug button - remove in production */}
      <Button onClick={debugStorage} variant="outlined" color="secondary" size="small" sx={{ mb: 2 }}>
        Debug Storage
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CalendarMonth sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Typography variant="h4">
            My Appointments
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          size="large"
          onClick={handleBookAppointment}
        >
          Book New Appointment
        </Button>
      </Box>

      {/* Show success message if appointment was recently booked */}
      {recentAppointment && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Your appointment has been booked successfully!
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : appointments.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CalendarMonth sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No Appointments Found
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 4, maxWidth: 400, margin: '0 auto' }}>
              You haven't booked any doctor appointments yet. Book your first appointment with our specialist doctors.
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              onClick={handleBookAppointment}
            >
              Book Your First Appointment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {appointments.map((appointment) => (
            <Grid item xs={12} key={appointment._id || appointment.appointmentId}>
              <Card elevation={2} sx={{ 
                borderLeft: 4, 
                borderColor: getStatusColor(appointment.status) + '.main',
                backgroundColor: isRecentAppointment(appointment) ? '#f0f7ff' : 'white'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Appointment #{appointment.appointmentId || 'N/A'}
                        {isRecentAppointment(appointment) && (
                          <Chip 
                            label="New" 
                            color="success" 
                            size="small" 
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Booked on {formatBookingDate(appointment.createdAt)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip 
                        label={appointment.status || 'unknown'} 
                        color={getStatusColor(appointment.status)}
                        size="small"
                      />
                      <Chip 
                        label={appointment.type === 'video' ? 'Video Consult' : 'In-Person'} 
                        color={getTypeColor(appointment.type)}
                        size="small"
                        variant="outlined"
                        icon={appointment.type === 'video' ? <VideoCall /> : <LocationOn />}
                      />
                    </Box>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <Person sx={{ mr: 2, color: 'primary.main', mt: 0.5 }} />
                        <Box>
                          <Typography variant="h6" color="primary">
                            {getDoctorName(appointment)}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {getDoctorSpecialization(appointment)}
                          </Typography>
                          <Typography variant="body2">
                            {getDoctorHospital(appointment)}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {getDoctorExperience(appointment)} experience
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <AccessTime sx={{ mr: 2, color: 'primary.main', mt: 0.5 }} />
                        <Box>
                          <Typography variant="h6">
                            {formatDate(appointment.date)}
                          </Typography>
                          <Typography variant="body1" color="primary.main">
                            {appointment.time || 'Time not set'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>

                  {appointment.symptoms && (
                    <Box sx={{ mb: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Symptoms / Reason for visit:
                      </Typography>
                      <Typography variant="body2">
                        {appointment.symptoms}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Patient: {getPatientName(appointment)} 
                        {getPatientAge(appointment) && ` (${getPatientAge(appointment)} yrs`}
                        {getPatientGender(appointment) && `, ${getPatientGender(appointment)})`}
                        {!getPatientAge(appointment) && !getPatientGender(appointment) && ')'}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        Fee: ₹{appointment.consultationFee || '0'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {appointment.status === 'confirmed' && appointment.type === 'video' && (
                        <Button 
                          variant="contained" 
                          size="small"
                          startIcon={<VideoCall />}
                          onClick={() => handleJoinCall(appointment.appointmentId)}
                        >
                          Join Call
                        </Button>
                      )}
                      {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                        <Button 
                          variant="outlined" 
                          color="error" 
                          size="small"
                          onClick={() => handleCancelAppointment(appointment._id)}
                        >
                          Cancel
                        </Button>
                      )}
                      <Button variant="outlined" size="small">
                        Reschedule
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Appointments;
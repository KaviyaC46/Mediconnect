// src/components/Doctors.js
import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Rating,
  Alert
} from '@mui/material';
import {
  Person,
  Work,
  LocationOn,
  Schedule,
  Star
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Doctors = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    date: '',
    time: '',
    symptoms: '',
    patientName: '',
    patientAge: '',
    patientGender: ''
  });

  // ... your existing functions and doctors data ...

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* 🚨 INSERT THE TEST BUTTON RIGHT HERE - RIGHT AFTER THE CONTAINER OPENING TAG */}
      <Button 
        onClick={() => {
          console.log('🧪 TEST: Checking localStorage...');
          const testData = localStorage.getItem('userAppointments');
          console.log('🧪 TEST: userAppointments in localStorage:', testData);
          console.log('🧪 TEST: Parsed data:', JSON.parse(testData || '[]'));
          
          // Test navigation
          console.log('🧪 TEST: Testing navigation...');
          navigate('/appointments');
        }}
        variant="outlined" 
        color="secondary"
        sx={{ mb: 2, mr: 2 }}
      >
        Test Storage & Navigation
      </Button>

      {/* Your existing content continues here */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Find Your Doctor
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Book appointments with our trusted healthcare specialists
        </Typography>
      </Box>

      {/* ... rest of your existing JSX code ... */}
    </Container>
  );
};

export default Doctors;
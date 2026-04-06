// src/pages/Doctors.js
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
  Alert,
  InputAdornment,
  Paper
} from '@mui/material';
import {
  Person,
  Work,
  LocationOn,
  Schedule,
  Star,
  Search,
  School,
  Award,
  Language,
  LocalHospital,
  Phone,
  Email
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Doctors = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [hospitalFilter, setHospitalFilter] = useState('all');
  const [consultationTypeFilter, setConsultationTypeFilter] = useState('all');
  
  const [bookingForm, setBookingForm] = useState({
    date: '',
    time: '',
    symptoms: '',
    patientName: '',
    patientAge: '',
    patientGender: ''
  });

  // Comprehensive doctors data
  const doctors = [
    {
      _id: 'doc1',
      name: 'Dr. Sarah Johnson',
      specialization: 'Cardiologist',
      experience: '15 years',
      hospital: 'City General Hospital',
      rating: 4.8,
      consultationFee: 1500,
      availability: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
      type: 'video',
      education: 'MD Cardiology, Harvard Medical School',
      languages: ['English', 'Spanish'],
      bio: 'Dr. Sarah Johnson is a renowned cardiologist with over 15 years of experience in treating heart diseases. She specializes in interventional cardiology and has performed over 5000 successful procedures.',
      qualifications: [
        'MBBS - AIIMS Delhi',
        'MD - Cardiology',
        'DM - Cardiology',
        'Fellowship in Interventional Cardiology (USA)'
      ],
      services: [
        'Heart Disease Treatment',
        'Angioplasty',
        'Bypass Surgery',
        'Cardiac Rehabilitation',
        'Heart Failure Management'
      ],
      awards: [
        'Best Cardiologist Award 2022',
        'Excellence in Cardiac Care 2021'
      ],
      experienceDetails: 'Senior Consultant at City General Hospital (2015-Present), Associate Professor at Medical College (2010-2015)',
      phone: '+91-9876543210',
      email: 'sarah.johnson@cityhospital.com',
      address: 'City General Hospital, Medical Street, Mumbai - 400001',
      yearsOfExperience: 15,
      patientsTreated: 15000,
      successRate: '98%',
      image: '/images/doctor1.jpg'
    },
    {
      _id: 'doc2',
      name: 'Dr. Michael Chen',
      specialization: 'Neurologist',
      experience: '12 years',
      hospital: 'Neuro Care Center',
      rating: 4.9,
      consultationFee: 2000,
      availability: ['10:00 AM', '01:00 PM', '03:00 PM'],
      type: 'in-person',
      education: 'MD Neurology, Johns Hopkins University',
      languages: ['English', 'Mandarin'],
      bio: 'Dr. Michael Chen is a leading neurologist specializing in brain and nervous system disorders. With extensive experience in stroke management and neurological rehabilitation.',
      qualifications: [
        'MBBS - Johns Hopkins University',
        'MD - Neurology',
        'DM - Neurology',
        'Fellowship in Stroke Management'
      ],
      services: [
        'Stroke Treatment',
        'Epilepsy Management',
        'Parkinson\'s Disease',
        'Migraine Treatment',
        'Neurological Rehabilitation'
      ],
      awards: [
        'Neurology Excellence Award 2023',
        'Best Researcher in Neuroscience 2022'
      ],
      experienceDetails: 'Head of Neurology at Neuro Care Center (2018-Present), Consultant at Brain Institute (2012-2018)',
      phone: '+91-9876543211',
      email: 'michael.chen@neurocare.com',
      address: 'Neuro Care Center, Science Park, Delhi - 110001',
      yearsOfExperience: 12,
      patientsTreated: 8000,
      successRate: '96%',
      image: '/images/doctor2.jpg'
    },
    {
      _id: 'doc3',
      name: 'Dr. Priya Sharma',
      specialization: 'Pediatrician',
      experience: '10 years',
      hospital: 'Children Medical Center',
      rating: 4.7,
      consultationFee: 1200,
      availability: ['09:30 AM', '11:30 AM', '04:00 PM'],
      type: 'video',
      education: 'MD Pediatrics, AIIMS Delhi',
      languages: ['English', 'Hindi', 'Tamil'],
      bio: 'Dr. Priya Sharma is a compassionate pediatrician dedicated to children\'s health and wellness. She specializes in newborn care, vaccination, and childhood diseases.',
      qualifications: [
        'MBBS - AIIMS Delhi',
        'MD - Pediatrics',
        'Fellowship in Neonatology',
        'PG Diploma in Child Health'
      ],
      services: [
        'Newborn Care',
        'Vaccination',
        'Childhood Diseases',
        'Growth Monitoring',
        'Nutrition Counseling'
      ],
      awards: [
        'Best Pediatrician Award 2023',
        'Child Healthcare Excellence 2022'
      ],
      experienceDetails: 'Senior Pediatrician at Children Medical Center (2017-Present), Consultant at Kids Hospital (2014-2017)',
      phone: '+91-9876543212',
      email: 'priya.sharma@childrenmedical.com',
      address: 'Children Medical Center, Health Avenue, Bangalore - 560001',
      yearsOfExperience: 10,
      patientsTreated: 12000,
      successRate: '99%',
      image: '/images/doctor3.jpg'
    },
    {
      _id: 'doc4',
      name: 'Dr. Rajesh Kumar',
      specialization: 'Orthopedic Surgeon',
      experience: '18 years',
      hospital: 'Bone & Joint Clinic',
      rating: 4.9,
      consultationFee: 1800,
      availability: ['10:00 AM', '12:00 PM', '03:00 PM', '05:00 PM'],
      type: 'in-person',
      education: 'MS Orthopedics, CMC Vellore',
      languages: ['English', 'Hindi', 'Telugu'],
      bio: 'Dr. Rajesh Kumar is an experienced orthopedic surgeon specializing in joint replacement surgeries and sports injuries. He has successfully performed over 2000 joint replacement surgeries.',
      qualifications: [
        'MBBS - CMC Vellore',
        'MS - Orthopedics',
        'Fellowship in Joint Replacement (UK)',
        'Diploma in Sports Medicine'
      ],
      services: [
        'Knee Replacement',
        'Hip Replacement',
        'Arthroscopic Surgery',
        'Fracture Treatment',
        'Sports Injury Management'
      ],
      awards: [
        'Best Orthopedic Surgeon 2023',
        'Excellence in Joint Replacement 2022'
      ],
      experienceDetails: 'Chief Orthopedic Surgeon at Bone & Joint Clinic (2015-Present), Senior Consultant at Apollo Hospitals (2008-2015)',
      phone: '+91-9876543213',
      email: 'rajesh.kumar@boneclinic.com',
      address: 'Bone & Joint Clinic, Medical Complex, Chennai - 600001',
      yearsOfExperience: 18,
      patientsTreated: 20000,
      successRate: '97%',
      image: '/images/doctor4.jpg'
    },
    {
      _id: 'doc5',
      name: 'Dr. Anjali Mehta',
      specialization: 'Dermatologist',
      experience: '8 years',
      hospital: 'Skin Care Specialists',
      rating: 4.6,
      consultationFee: 1000,
      availability: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
      type: 'video',
      education: 'MD Dermatology, PGI Chandigarh',
      languages: ['English', 'Hindi', 'Punjabi'],
      bio: 'Dr. Anjali Mehta is a skilled dermatologist specializing in skin diseases, cosmetic dermatology, and laser treatments. She provides comprehensive care for all skin types and conditions.',
      qualifications: [
        'MBBS - PGI Chandigarh',
        'MD - Dermatology',
        'Fellowship in Cosmetic Dermatology',
        'Diploma in Dermatosurgery'
      ],
      services: [
        'Acne Treatment',
        'Skin Allergy',
        'Laser Therapy',
        'Hair Fall Treatment',
        'Cosmetic Procedures'
      ],
      awards: [
        'Young Dermatologist Award 2023',
        'Excellence in Skin Care 2022'
      ],
      experienceDetails: 'Consultant Dermatologist at Skin Care Specialists (2019-Present), Resident Doctor at Skin Institute (2016-2019)',
      phone: '+91-9876543214',
      email: 'anjali.mehta@skincare.com',
      address: 'Skin Care Specialists, Beauty Plaza, Hyderabad - 500001',
      yearsOfExperience: 8,
      patientsTreated: 6000,
      successRate: '95%',
      image: '/images/doctor5.jpg'
    }
  ];

  // Get unique specializations and hospitals for filters
  const specializations = ['all', ...new Set(doctors.map(doc => doc.specialization))];
  const hospitals = ['all', ...new Set(doctors.map(doc => doc.hospital))];

  // Filter doctors based on search and filters
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.hospital.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialization = specializationFilter === 'all' || doctor.specialization === specializationFilter;
    const matchesHospital = hospitalFilter === 'all' || doctor.hospital === hospitalFilter;
    const matchesConsultationType = consultationTypeFilter === 'all' || doctor.type === consultationTypeFilter;

    return matchesSearch && matchesSpecialization && matchesHospital && matchesConsultationType;
  });

  const handleBookAppointment = (doctor) => {
    if (!user) {
      alert('Please login to book an appointment');
      navigate('/login');
      return;
    }

    setSelectedDoctor(doctor);
    setBookingForm({
      date: getTomorrowDate(),
      time: doctor.availability[0] || '',
      symptoms: '',
      patientName: user.name || '',
      patientAge: '',
      patientGender: ''
    });
    setBookingDialogOpen(true);
    setBookingSuccess(false);
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleFormChange = (field, value) => {
    setBookingForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const confirmBooking = () => {
    if (!bookingForm.date || !bookingForm.time || !bookingForm.patientName) {
      alert('Please fill in all required fields (Date, Time, and Patient Name)');
      return;
    }

    try {
      const appointmentId = 'APT' + Date.now();
      const _id = 'appt_' + Date.now();

      const newAppointment = {
        _id,
        appointmentId,
        doctor: {
          _id: selectedDoctor._id,
          name: selectedDoctor.name,
          specialization: selectedDoctor.specialization,
          hospital: selectedDoctor.hospital,
          experience: selectedDoctor.experience,
          rating: selectedDoctor.rating
        },
        date: bookingForm.date,
        time: bookingForm.time,
        symptoms: bookingForm.symptoms,
        type: selectedDoctor.type,
        status: 'confirmed',
        consultationFee: selectedDoctor.consultationFee,
        createdAt: new Date().toISOString(),
        patient: {
          name: bookingForm.patientName,
          age: bookingForm.patientAge,
          gender: bookingForm.patientGender
        }
      };

      const existingAppointments = JSON.parse(localStorage.getItem('userAppointments') || '[]');
      const updatedAppointments = [newAppointment, ...existingAppointments];
      localStorage.setItem('userAppointments', JSON.stringify(updatedAppointments));

      setBookingSuccess(true);
      
      setTimeout(() => {
        setBookingDialogOpen(false);
        navigate('/appointments');
      }, 1500);

    } catch (error) {
      console.error('Error saving appointment:', error);
      alert('Error booking appointment. Please try again.');
    }
  };

  const getTypeColor = (type) => {
    return type === 'video' ? 'primary' : 'secondary';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Find Your Doctor
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Book appointments with our trusted healthcare specialists
        </Typography>
      </Box>

      {/* Search and Filter Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search doctors, specialization, hospital..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Specialization</InputLabel>
              <Select
                value={specializationFilter}
                label="Specialization"
                onChange={(e) => setSpecializationFilter(e.target.value)}
              >
                {specializations.map(spec => (
                  <MenuItem key={spec} value={spec}>
                    {spec === 'all' ? 'All Specializations' : spec}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Hospital</InputLabel>
              <Select
                value={hospitalFilter}
                label="Hospital"
                onChange={(e) => setHospitalFilter(e.target.value)}
              >
                {hospitals.map(hospital => (
                  <MenuItem key={hospital} value={hospital}>
                    {hospital === 'all' ? 'All Hospitals' : hospital}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Consultation</InputLabel>
              <Select
                value={consultationTypeFilter}
                label="Consultation"
                onChange={(e) => setConsultationTypeFilter(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="video">Video Consult</MenuItem>
                <MenuItem value="in-person">In-Person</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="textSecondary">
              {filteredDoctors.length} doctors found
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {bookingSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Appointment booked successfully! Redirecting to appointments...
        </Alert>
      )}

      {filteredDoctors.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Person sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No Doctors Found
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Try adjusting your search criteria or filters
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredDoctors.map((doctor) => (
            <Grid item xs={12} key={doctor._id}>
              <Card elevation={3} sx={{ 
                borderRadius: 2,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ 
                          width: 80, 
                          height: 80, 
                          bgcolor: 'primary.main', 
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 3
                        }}>
                          <Person sx={{ fontSize: 40, color: 'white' }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h5" fontWeight="bold">
                              {doctor.name}
                            </Typography>
                            <Chip 
                              label={doctor.type === 'video' ? 'Video Consult' : 'In-Person'} 
                              color={getTypeColor(doctor.type)}
                              size="small"
                              sx={{ ml: 2 }}
                            />
                          </Box>
                          <Typography variant="h6" color="primary" gutterBottom>
                            {doctor.specialization}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Rating value={doctor.rating} readOnly size="small" />
                            <Typography variant="body2" sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
                              <Star sx={{ fontSize: 16, color: 'gold', mr: 0.5 }} />
                              {doctor.rating}/5 • {doctor.yearsOfExperience} years • {doctor.successRate} Success Rate
                            </Typography>
                          </Box>

                          {/* Enhanced Doctor Information */}
                          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mt: 2, mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <LocalHospital sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                              <Typography variant="body2">
                                {doctor.hospital}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Work sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                              <Typography variant="body2">
                                {doctor.experience}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Language sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                              <Typography variant="body2">
                                {doctor.languages.join(', ')}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Qualifications and Services */}
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              <strong>Qualifications:</strong> {doctor.qualifications.slice(0, 2).join(', ')}
                              {doctor.qualifications.length > 2 && ` +${doctor.qualifications.length - 2} more`}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              <strong>Services:</strong> {doctor.services.slice(0, 3).join(', ')}
                              {doctor.services.length > 3 && ` +${doctor.services.length - 3} more`}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Patients Treated:</strong> {doctor.patientsTreated}+
                            </Typography>
                          </Box>

                          {/* Contact Information */}
                          <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Contact Information:
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <Phone sx={{ fontSize: 16, mr: 1 }} />
                              <Typography variant="body2">{doctor.phone}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Email sx={{ fontSize: 16, mr: 1 }} />
                              <Typography variant="body2">{doctor.email}</Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        height: '100%',
                        justifyContent: 'space-between'
                      }}>
                        <Box>
                          <Typography variant="h4" color="primary" gutterBottom>
                            {formatCurrency(doctor.consultationFee)}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Consultation Fee
                          </Typography>
                          
                          {/* Availability */}
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Available Slots Today:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {doctor.availability.map((time, index) => (
                                <Chip 
                                  key={index}
                                  label={time}
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                />
                              ))}
                            </Box>
                          </Box>

                          {/* Awards */}
                          {doctor.awards.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Awards & Recognition:
                              </Typography>
                              {doctor.awards.slice(0, 2).map((award, index) => (
                                <Chip 
                                  key={index}
                                  label={award}
                                  size="small"
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                />
                              ))}
                            </Box>
                          )}
                        </Box>
                        
                        <Button 
                          variant="contained" 
                          size="large"
                          fullWidth
                          onClick={() => handleBookAppointment(doctor)}
                          sx={{ 
                            mt: 2,
                            py: 1.5,
                            fontSize: '1.1rem'
                          }}
                        >
                          Book Appointment
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Booking Dialog */}
      <Dialog 
        open={bookingDialogOpen} 
        onClose={() => setBookingDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', pb: 2 }}>
          <Typography variant="h5" component="div">
            Book Appointment
          </Typography>
          <Typography variant="subtitle1" color="primary" sx={{ mt: 1 }}>
            with {selectedDoctor?.name} - {selectedDoctor?.specialization}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {selectedDoctor?.hospital} • {selectedDoctor?.experience} • {selectedDoctor?.successRate} Success Rate
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Fee: {selectedDoctor && formatCurrency(selectedDoctor.consultationFee)}
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Patient Name *"
                value={bookingForm.patientName}
                onChange={(e) => handleFormChange('patientName', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Age"
                type="number"
                value={bookingForm.patientAge}
                onChange={(e) => handleFormChange('patientAge', e.target.value)}
                inputProps={{ min: 0, max: 120 }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={bookingForm.patientGender}
                  label="Gender"
                  onChange={(e) => handleFormChange('patientGender', e.target.value)}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                  <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Appointment Date *"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={bookingForm.date}
                onChange={(e) => handleFormChange('date', e.target.value)}
                required
                inputProps={{ 
                  min: getTomorrowDate()
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
  <FormControl fullWidth required>
    <InputLabel>Preferred Time *</InputLabel>
    <Select
      value={bookingForm.time}
      label="Preferred Time *"
      onChange={(e) => handleFormChange('time', e.target.value)}
    >
      {selectedDoctor?.availability.map((time) => (
        <MenuItem key={time} value={time}>
          {time}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Grid>

<Grid item xs={12}>
  <TextField
    fullWidth
    multiline
    rows={4}
    label="Symptoms / Reason for Visit"
    value={bookingForm.symptoms}
    onChange={(e) => handleFormChange('symptoms', e.target.value)}
    placeholder="Please describe your symptoms, medical concerns, or reason for this appointment in detail..."
    helperText="This helps the doctor prepare for your consultation"
  />
</Grid>
</Grid>
</DialogContent>

<DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
  <Button 
    onClick={() => setBookingDialogOpen(false)}
    size="large"
  >
    Cancel
  </Button>
  <Button 
    variant="contained" 
    onClick={confirmBooking}
    disabled={!bookingForm.date || !bookingForm.time || !bookingForm.patientName}
    size="large"
    sx={{ minWidth: 200 }}
  >
    Confirm Booking
  </Button>
</DialogActions>
</Dialog>
</Container>
);
};

export default Doctors;
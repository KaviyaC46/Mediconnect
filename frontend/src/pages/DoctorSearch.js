import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Rating,
  Pagination
} from '@mui/material';
import {
  Search,
  MedicalServices,
  LocationOn,
  Work,
  Phone,
  Email
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DoctorSearch = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [specializations, setSpecializations] = useState([]);
  const [locations, setLocations] = useState([]);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch doctors
  const fetchDoctors = async (pageNum = 1) => {
    try {
      setLoading(true);
      const params = {
        page: pageNum,
        limit: 12,
        search: searchTerm,
        specialization: specialization,
        location: location,
        experience: experience
      };

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await axios.get('http://localhost:5000/api/doctors', { params });
      
      if (response.data.success) {
        setDoctors(response.data.data);
        setTotalPages(response.data.pagination.pages);
        setPage(pageNum);
      } else {
        console.error('Failed to fetch doctors:', response.data.message);
        // Use mock data if API fails
        setDoctors(getMockDoctors());
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      // Use mock data if API fails
      setDoctors(getMockDoctors());
    } finally {
      setLoading(false);
    }
  };

  // Mock data for testing
  const getMockDoctors = () => [
    {
      _id: '1',
      name: 'Dr. Rajesh Kumar',
      specialization: 'Cardiologist',
      qualification: 'MD, DM Cardiology',
      experience: 15,
      fee: 800,
      location: 'Delhi',
      address: 'AIIMS Delhi, Ansari Nagar',
      phone: '+91 9876543210',
      email: 'dr.rajesh@example.com',
      about: 'Senior Cardiologist with 15+ years of experience in interventional cardiology.',
      rating: 4.5,
      totalRatings: 120,
      availability: [
        { day: 'Monday', slots: ['09:00 AM', '10:00 AM', '11:00 AM'] },
        { day: 'Wednesday', slots: ['02:00 PM', '03:00 PM', '04:00 PM'] }
      ]
    },
    {
      _id: '2',
      name: 'Dr. Priya Sharma',
      specialization: 'Dermatologist',
      qualification: 'MD Dermatology',
      experience: 8,
      fee: 600,
      location: 'Mumbai',
      address: 'Fortis Hospital, Mulund',
      phone: '+91 9876543211',
      email: 'dr.priya@example.com',
      about: 'Expert in skin treatments and cosmetic dermatology.',
      rating: 4.8,
      totalRatings: 85,
      availability: [
        { day: 'Tuesday', slots: ['10:00 AM', '11:00 AM', '12:00 PM'] },
        { day: 'Friday', slots: ['03:00 PM', '04:00 PM', '05:00 PM'] }
      ]
    },
    {
      _id: '3',
      name: 'Dr. Amit Patel',
      specialization: 'Orthopedic',
      qualification: 'MS Orthopedics',
      experience: 12,
      fee: 700,
      location: 'Bangalore',
      address: 'Manipal Hospital, Whitefield',
      phone: '+91 9876543212',
      email: 'dr.amit@example.com',
      about: 'Specialized in joint replacement and sports injuries.',
      rating: 4.6,
      totalRatings: 95,
      availability: [
        { day: 'Monday', slots: ['09:00 AM', '10:00 AM'] },
        { day: 'Thursday', slots: ['02:00 PM', '03:00 PM'] }
      ]
    }
  ];

  const fetchSpecializations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/doctors/data/specializations');
      if (response.data.success) {
        setSpecializations(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching specializations:', error);
      setSpecializations(['Cardiologist', 'Dermatologist', 'Orthopedic', 'Pediatrician', 'Neurologist']);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/doctors/data/locations');
      if (response.data.success) {
        setLocations(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      setLocations(['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata']);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchDoctors(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSpecialization('');
    setLocation('');
    setExperience('');
    setPage(1);
    fetchDoctors(1);
  };

  const bookAppointment = (doctorId) => {
    navigate(`/book-appointment/${doctorId}`);
  };

  // Initial data loading
  useEffect(() => {
    fetchDoctors();
    fetchSpecializations();
    fetchLocations();
  }, []);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom color="primary">
          <MedicalServices sx={{ fontSize: 40, mr: 2, verticalAlign: 'bottom' }} />
          Find Your Doctor
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Book appointments with verified healthcare professionals
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 4, p: 3, backgroundColor: '#f8f9fa' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search doctors or specializations"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g., Cardiologist, Dr. Smith"
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'primary.main' }} />,
              }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Specialization</InputLabel>
              <Select
                value={specialization}
                label="Specialization"
                onChange={(e) => setSpecialization(e.target.value)}
              >
                <MenuItem value="">All Specializations</MenuItem>
                {specializations.map((spec) => (
                  <MenuItem key={spec} value={spec}>{spec}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Location</InputLabel>
              <Select
                value={location}
                label="Location"
                onChange={(e) => setLocation(e.target.value)}
              >
                <MenuItem value="">All Locations</MenuItem>
                {locations.map((loc) => (
                  <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Experience</InputLabel>
              <Select
                value={experience}
                label="Experience"
                onChange={(e) => setExperience(e.target.value)}
              >
                <MenuItem value="">Any Experience</MenuItem>
                <MenuItem value="5">5+ years</MenuItem>
                <MenuItem value="10">10+ years</MenuItem>
                <MenuItem value="15">15+ years</MenuItem>
                <MenuItem value="20">20+ years</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={loading}
                sx={{ flex: 1 }}
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
              <Button
                variant="outlined"
                onClick={clearFilters}
                sx={{ flex: 1 }}
              >
                Clear
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Doctors Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: 200 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading doctors...
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {doctors.map((doctor) => (
              <Grid item xs={12} sm={6} md={4} key={doctor._id}>
                <DoctorCard 
                  doctor={doctor} 
                  onBookAppointment={bookAppointment}
                />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => fetchDoctors(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {doctors.length === 0 && !loading && (
        <Box textAlign="center" sx={{ mt: 4, p: 6 }}>
          <Typography variant="h5" color="textSecondary" gutterBottom>
            No doctors found
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Try adjusting your search criteria or clear filters to see all doctors.
          </Typography>
          <Button variant="contained" onClick={clearFilters}>
            Clear Filters
          </Button>
        </Box>
      )}
    </Container>
  );
};

// Doctor Card Component
const DoctorCard = ({ doctor, onBookAppointment }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      transition: 'all 0.3s ease', 
      '&:hover': { 
        transform: 'translateY(-4px)', 
        boxShadow: 3 
      } 
    }}>
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Doctor Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              mr: 2
            }}
          >
            {doctor.name.split(' ').map(n => n[0]).join('')}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              {doctor.name}
            </Typography>
            <Chip 
              label={doctor.specialization} 
              color="primary" 
              size="small" 
              sx={{ mb: 1 }}
            />
          </Box>
        </Box>

        {/* Doctor Details */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {doctor.qualification}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOn sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
            <Typography variant="body2" color="textSecondary">
              {doctor.location}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Work sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
            <Typography variant="body2" color="textSecondary">
              {doctor.experience} years experience
            </Typography>
          </Box>

          {doctor.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Phone sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
              <Typography variant="body2" color="textSecondary">
                {doctor.phone}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating value={doctor.rating} readOnly size="small" />
            <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
              ({doctor.totalRatings || 0} reviews)
            </Typography>
          </Box>

          {doctor.about && (
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2, fontStyle: 'italic' }}>
              "{doctor.about}"
            </Typography>
          )}
        </Box>

        {/* Consultation Fee */}
        <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
          Consultation Fee: {formatPrice(doctor.fee)}
        </Typography>
      </CardContent>

      {/* Book Appointment Button */}
      <Box sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => onBookAppointment(doctor._id)}
        >
          Book Appointment
        </Button>
      </Box>
    </Card>
  );
};

export default DoctorSearch;
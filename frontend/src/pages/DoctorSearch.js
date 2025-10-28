import React, { useState, useEffect, useCallback } from 'react';
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
  FilterList,
  LocationOn,
  MedicalServices,
  Work
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DoctorSearch = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [specialties, setSpecialties] = useState([]);
  const [locations, setLocations] = useState([]);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [rating, setRating] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Wrap fetchDoctors in useCallback to fix dependency warning
  const fetchDoctors = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pageNum,
        limit: 12
      });

      if (searchTerm) params.append('search', searchTerm);
      if (specialty) params.append('specialty', specialty);
      if (location) params.append('location', location);

      const response = await axios.get(`http://localhost:5000/api/doctors?${params}`);
      
      if (response.data.success) {
        setDoctors(response.data.data);
        setFilteredDoctors(response.data.data);
        setTotalPages(response.data.pagination.pages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, specialty, location]);

  const fetchSpecialties = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/doctors/specialties');
      if (response.data.success) {
        setSpecialties(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching specialties:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/doctors/locations');
      if (response.data.success) {
        setLocations(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  // Filter doctors based on current criteria
  const filterDoctors = useCallback(() => {
    let filtered = [...doctors];

    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (specialty) {
      filtered = filtered.filter(doctor => doctor.specialty === specialty);
    }

    if (location) {
      filtered = filtered.filter(doctor => doctor.location === location);
    }

    if (experience) {
      filtered = filtered.filter(doctor => doctor.experience >= parseInt(experience));
    }

    if (rating > 0) {
      filtered = filtered.filter(doctor => doctor.rating >= rating);
    }

    setFilteredDoctors(filtered);
    setPage(1);
  }, [doctors, searchTerm, specialty, location, experience, rating]);

  const handleSearch = () => {
    filterDoctors();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSpecialty('');
    setLocation('');
    setExperience('');
    setRating(0);
    setPage(1);
    setFilteredDoctors(doctors);
  };

  const bookAppointment = (doctorId) => {
    navigate(`/book-appointment/${doctorId}`);
  };

  // Initial data loading - fixed with useCallback dependencies
  useEffect(() => {
    fetchDoctors();
    fetchSpecialties();
    fetchLocations();
  }, [fetchDoctors]); // Now fetchDoctors is properly included

  // Apply filters whenever search criteria or doctors data changes
  useEffect(() => {
    if (doctors.length > 0) {
      filterDoctors();
    }
  }, [doctors, filterDoctors]);

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
        <Grid container spacing={3}>
          {/* Search */}
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search doctors or specialties"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g., Cardiologist, Dr. Smith"
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'primary.main' }} />,
              }}
            />
          </Grid>

          {/* Specialty */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Specialty</InputLabel>
              <Select
                value={specialty}
                label="Specialty"
                onChange={(e) => setSpecialty(e.target.value)}
              >
                <MenuItem value="">All Specialties</MenuItem>
                {specialties.map((spec) => (
                  <MenuItem key={spec} value={spec}>{spec}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Location */}
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

          {/* Experience */}
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

          {/* Action Buttons */}
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <FilterList />}
                sx={{ flex: 1 }}
              >
                Search
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

        {/* Rating Filter */}
        <Box sx={{ mt: 3 }}>
          <Typography gutterBottom>Minimum Rating: {rating > 0 ? `${rating}+ stars` : 'Any rating'}</Typography>
          <Rating
            value={rating}
            onChange={(e, newValue) => setRating(newValue || 0)}
            size="large"
          />
        </Box>
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
            {filteredDoctors.map((doctor) => (
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

      {filteredDoctors.length === 0 && !loading && (
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
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Doctor Image Placeholder */}
        <Box
          sx={{
            height: 120,
            backgroundColor: '#e3f2fd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            borderRadius: 2
          }}
        >
          <MedicalServices sx={{ fontSize: 60, color: 'primary.main' }} />
        </Box>

        {/* Doctor Details */}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {doctor.name}
        </Typography>
        
        <Chip 
          label={doctor.specialty} 
          color="primary" 
          size="small" 
          sx={{ mb: 2 }}
        />

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

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Rating value={doctor.rating} readOnly size="small" />
          <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
            ({doctor.totalRatings || 0} reviews)
          </Typography>
        </Box>

        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {doctor.qualification}
        </Typography>

        {doctor.availability && (
          <Chip 
            label={doctor.availability} 
            color={doctor.availability === 'Available Today' ? 'success' : 'default'}
            size="small"
            sx={{ mb: 2 }}
          />
        )}
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
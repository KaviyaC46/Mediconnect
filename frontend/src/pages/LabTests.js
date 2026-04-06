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
  Checkbox,
  FormControlLabel,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Search,
  Science,
  LocalHospital,
  Schedule
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const LabTest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // ADD THIS LINE - Environment variable for API base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || '';

  // State variables
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [currentTest, setCurrentTest] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Booking form state
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [address, setAddress] = useState('');

  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  // Fetch tests with useCallback - UPDATED to use API_BASE_URL
  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching lab tests...');
      
      const params = {
        search: searchTerm,
        category: category
      };

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      console.log('📡 API Call: /api/lab-tests with params:', params);
      
      // UPDATED: Use API_BASE_URL instead of hardcoded URL
      const response = await axios.get(`${API_BASE_URL}/api/lab-tests`, { params });
      console.log('✅ Lab tests API response:', response.data);
      
      if (response.data.success) {
        setTests(response.data.data);
      } else {
        console.warn('❌ API returned error, using mock data');
        setTests(getMockTests());
      }
    } catch (error) {
      console.error('❌ Error fetching lab tests:', error);
      console.log('🔄 Using mock data as fallback');
      setTests(getMockTests());
      showAlert('Using demo data. Backend might be unavailable.', 'info');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, category, API_BASE_URL]); // ADDED API_BASE_URL to dependencies

  // Mock data for testing
  const getMockTests = () => [
    {
      _id: '1',
      name: 'Complete Blood Count (CBC)',
      category: 'Hematology',
      price: 299,
      description: 'Measures different components of blood including red blood cells, white blood cells, and platelets.',
      fastingRequired: false,
      reportTime: '24 hours',
      sampleType: 'Blood',
      parameters: ['Hemoglobin', 'WBC Count', 'RBC Count', 'Platelet Count', 'MCV', 'MCH'],
      preparation: 'No special preparation required'
    },
    {
      _id: '2',
      name: 'Blood Glucose Test',
      category: 'Diabetes',
      price: 199,
      description: 'Measures blood sugar levels to diagnose and monitor diabetes.',
      fastingRequired: true,
      reportTime: '6 hours',
      sampleType: 'Blood',
      parameters: ['Fasting Blood Sugar', 'Postprandial Blood Sugar'],
      preparation: 'Fasting for 8-12 hours required'
    },
    {
      _id: '3',
      name: 'Thyroid Profile',
      category: 'Endocrinology',
      price: 599,
      description: 'Comprehensive test to measure thyroid hormone levels and function.',
      fastingRequired: false,
      reportTime: '48 hours',
      sampleType: 'Blood',
      parameters: ['TSH', 'T3', 'T4', 'Free T3', 'Free T4'],
      preparation: 'No special preparation required'
    },
    {
      _id: '4',
      name: 'Liver Function Test',
      category: 'Hepatology',
      price: 499,
      description: 'Assesses liver health by measuring enzymes, proteins, and substances.',
      fastingRequired: true,
      reportTime: '24 hours',
      sampleType: 'Blood',
      parameters: ['ALT', 'AST', 'ALP', 'Bilirubin', 'Albumin'],
      preparation: 'Fasting for 10-12 hours required'
    }
  ];

  // UPDATED: Use API_BASE_URL
  const fetchCategories = async () => {
    try {
      console.log('🔄 Fetching categories...');
      const response = await axios.get(`${API_BASE_URL}/api/lab-tests/categories`);
      console.log('✅ Categories response:', response.data);
      
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      setCategories(['Hematology', 'Diabetes', 'Endocrinology', 'Hepatology', 'Nephrology', 'Cardiology']);
    }
  };

  // UPDATED: Use API_BASE_URL
  const createSampleData = async () => {
    try {
      console.log('🎯 Creating sample lab test data...');
      const response = await axios.post(`${API_BASE_URL}/api/lab-tests/sample`);
      console.log('✅ Sample data created:', response.data);
      showAlert('Sample lab test data created successfully!', 'success');
      fetchTests(); // Refresh the list
    } catch (error) {
      console.error('❌ Error creating sample data:', error);
      showAlert('Failed to create sample data', 'error');
    }
  };

  const showAlert = (message, severity = 'success') => {
    setAlert({ open: true, message, severity });
  };

  const handleSearch = () => {
    console.log('🔍 Searching with:', { searchTerm, category });
    fetchTests();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategory('');
  };

  const handleTestSelection = (test, isSelected) => {
    if (isSelected) {
      setSelectedTests(prev => [...prev, test]);
    } else {
      setSelectedTests(prev => prev.filter(t => t._id !== test._id));
    }
  };

  const openBookingDialog = (test) => {
    if (!user) {
      showAlert('Please login to book lab tests', 'warning');
      navigate('/login');
      return;
    }
    setCurrentTest(test);
    setPatientName(user.name || '');
    setPatientPhone(user.phone || '');
    setPreferredDate(new Date().toISOString().split('T')[0]);
    setPreferredTime('10:00 AM');
    setBookingDialogOpen(true);
  };

  const closeBookingDialog = () => {
    setBookingDialogOpen(false);
    setCurrentTest(null);
    setPatientName('');
    setPatientAge('');
    setPatientGender('');
    setPatientPhone('');
    setPreferredDate('');
    setPreferredTime('');
    setAddress('');
  };

  // UPDATED: Use API_BASE_URL
  const bookTest = async () => {
    if (!patientName || !patientPhone) {
      showAlert('Please fill all required fields', 'warning');
      return;
    }

    try {
      setBookingLoading(true);
      
      if (currentTest) {
        const bookingData = {
          testId: currentTest._id,
          patientName,
          patientAge,
          patientGender,
          patientPhone,
          preferredDate,
          preferredTime,
          address: address || 'Home collection'
        };

        console.log('📝 Booking test:', bookingData);
        
        // UPDATED: Use API_BASE_URL
        const response = await axios.post(`${API_BASE_URL}/api/lab-tests/book`, bookingData);
        
        if (response.data.success) {
          showAlert('Lab test booked successfully!', 'success');
          closeBookingDialog();
          
          // Add to cart
          let cart = JSON.parse(localStorage.getItem('cart') || '[]');
          cart.push({
            ...currentTest,
            quantity: 1,
            type: 'labtest'
          });
          localStorage.setItem('cart', JSON.stringify(cart));
        }
      }

    } catch (error) {
      console.error('❌ Error booking test:', error);
      showAlert('Test booked successfully! (Demo mode)', 'success');
      closeBookingDialog();
    } finally {
      setBookingLoading(false);
    }
  };

  const bookSelectedTests = () => {
    if (!user) {
      showAlert('Please login to book lab tests', 'warning');
      navigate('/login');
      return;
    }

    if (selectedTests.length === 0) {
      showAlert('Please select at least one test', 'warning');
      return;
    }

    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    selectedTests.forEach(test => {
      const existingItem = cart.find(item => item._id === test._id && item.type === 'labtest');
      
      if (!existingItem) {
        cart.push({
          ...test,
          quantity: 1,
          type: 'labtest'
        });
      }
    });

    localStorage.setItem('cart', JSON.stringify(cart));
    showAlert(`${selectedTests.length} tests added to cart!`, 'success');
    setSelectedTests([]);
  };

  const getTotalPrice = () => {
    return selectedTests.reduce((total, test) => total + test.price, 0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  // Initial data loading
  useEffect(() => {
    console.log('🚀 LabTest component mounted');
    fetchTests();
    fetchCategories();
  }, [fetchTests]);

  // Auto-search when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm || category) {
        fetchTests();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, category, fetchTests]);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom color="primary">
          <Science sx={{ fontSize: 40, mr: 2, verticalAlign: 'bottom' }} />
          Lab Tests
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Book diagnostic tests from certified laboratories
        </Typography>
        
        {/* Sample Data Button - Remove in production */}
        <Button 
          variant="outlined" 
          color="secondary" 
          onClick={createSampleData}
          sx={{ mt: 1 }}
        >
          Create Sample Data
        </Button>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 4, p: 3, backgroundColor: '#f8f9fa' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search tests"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by test name or category..."
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'primary.main' }} />,
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
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

          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate('/cart')}
              fullWidth
            >
              View Cart
            </Button>
          </Grid>
        </Grid>

        {/* Selected Tests Summary */}
        {selectedTests.length > 0 && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#e8f5e8', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Selected Tests: {selectedTests.length}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Total: {formatPrice(getTotalPrice())}
            </Typography>
            <Button variant="contained" color="success" onClick={bookSelectedTests}>
              Add Selected to Cart
            </Button>
          </Box>
        )}
      </Card>

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: 200 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading lab tests...
          </Typography>
        </Box>
      )}

      {/* Tests Grid */}
      {!loading && tests.length > 0 && (
        <Grid container spacing={3}>
          {tests.map((test) => (
            <Grid item xs={12} sm={6} md={4} key={test._id}>
              <TestCard 
                test={test} 
                onSelectionChange={handleTestSelection}
                onBookTest={openBookingDialog}
                isSelected={selectedTests.some(t => t._id === test._id)}
                formatPrice={formatPrice}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty State */}
      {!loading && tests.length === 0 && (
        <Box textAlign="center" sx={{ mt: 4, p: 6 }}>
          <Typography variant="h5" color="textSecondary" gutterBottom>
            No lab tests found
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            {searchTerm || category 
              ? `No tests found for your search criteria.`
              : 'No lab tests available. Try creating sample data.'
            }
          </Typography>
          <Button variant="contained" onClick={clearFilters}>
            Clear Filters
          </Button>
        </Box>
      )}

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onClose={closeBookingDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Book Lab Test: {currentTest?.name}
        </DialogTitle>
        <DialogContent>
          {currentTest && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Patient Name *"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Phone Number *"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    fullWidth
                    required
                    type="tel"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Age"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    fullWidth
                    type="number"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={patientGender}
                      label="Gender"
                      onChange={(e) => setPatientGender(e.target.value)}
                    >
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Preferred Date"
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Preferred Time</InputLabel>
                    <Select
                      value={preferredTime}
                      label="Preferred Time"
                      onChange={(e) => setPreferredTime(e.target.value)}
                    >
                      <MenuItem value="10:00 AM">10:00 AM</MenuItem>
                      <MenuItem value="11:00 AM">11:00 AM</MenuItem>
                      <MenuItem value="12:00 PM">12:00 PM</MenuItem>
                      <MenuItem value="02:00 PM">02:00 PM</MenuItem>
                      <MenuItem value="03:00 PM">03:00 PM</MenuItem>
                      <MenuItem value="04:00 PM">04:00 PM</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Collection Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Enter address for sample collection"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      Test Details
                    </Typography>
                    <Typography variant="body2">
                      <strong>Test:</strong> {currentTest.name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Price:</strong> {formatPrice(currentTest.price)}
                    </Typography>
                    {currentTest.fastingRequired && (
                      <Typography variant="body2" color="warning.main">
                        <strong>Note:</strong> Fasting required for this test
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeBookingDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={bookTest}
            disabled={bookingLoading || !patientName || !patientPhone}
          >
            {bookingLoading ? 'Booking...' : `Book Test - ${formatPrice(currentTest?.price || 0)}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert onClose={() => setAlert({ ...alert, open: false })} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

// Test Card Component
const TestCard = ({ test, onSelectionChange, onBookTest, isSelected, formatPrice }) => {
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
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        {/* Selection Checkbox */}
        <FormControlLabel
          control={
            <Checkbox
              checked={isSelected}
              onChange={(e) => onSelectionChange(test, e.target.checked)}
              color="primary"
            />
          }
          label="Select for bulk booking"
          sx={{ mb: 1 }}
        />

        {/* Test Icon */}
        <Box
          sx={{
            height: 80,
            backgroundColor: '#e8f5e8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            borderRadius: 1
          }}
        >
          <LocalHospital sx={{ fontSize: 40, color: 'success.main' }} />
        </Box>

        {/* Test Details */}
        <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 600 }}>
          {test.name}
        </Typography>
        
        <Chip 
          label={test.category} 
          color="primary" 
          size="small" 
          sx={{ mb: 1 }}
        />

        <Typography variant="body2" color="textSecondary" sx={{ mb: 1, minHeight: '40px' }}>
          {test.description}
        </Typography>

        {test.parameters && (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1, fontSize: '0.8rem' }}>
            <strong>Includes:</strong> {test.parameters.slice(0, 3).join(', ')}
            {test.parameters.length > 3 && ` +${test.parameters.length - 3} more`}
          </Typography>
        )}

        {test.fastingRequired && (
          <Chip
            label="Fasting Required"
            color="warning"
            size="small"
            sx={{ mb: 1 }}
          />
        )}

        {test.reportTime && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Schedule sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
            <Typography variant="body2" color="textSecondary">
              Report in {test.reportTime}
            </Typography>
          </Box>
        )}

        {test.sampleType && (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            <strong>Sample:</strong> {test.sampleType}
          </Typography>
        )}

        {/* Price */}
        <Typography variant="h6" color="primary" fontWeight="bold">
          {formatPrice(test.price)}
        </Typography>
      </CardContent>

      {/* Action Buttons */}
      <Box sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => onBookTest(test)}
          color="primary"
        >
          Book Now
        </Button>
      </Box>
    </Card>
  );
};

export default LabTest;
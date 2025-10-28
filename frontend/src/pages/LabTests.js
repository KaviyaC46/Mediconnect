import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  Button,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const LabTests = () => {
  const [tests, setTests] = useState([]);
  const [popularTests, setPopularTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchTests();
    fetchPopularTests();
    fetchCategories();
  }, []);

  const fetchTests = async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);

      const response = await axios.get(`http://localhost:5000/api/labtests?${params}`);
      setTests(response.data);
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  };

  const fetchPopularTests = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/labtests/popular');
      setPopularTests(response.data);
    } catch (error) {
      console.error('Error fetching popular tests:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/labtests/data/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = () => {
    fetchTests({
      search: searchTerm,
      category: category,
    });
  };

  const addToCart = (test) => {
    if (!user) {
      alert('Please login to add tests to cart');
      return;
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item._id === test._id && item.type === 'labtest');
    
    if (!existingItem) {
      cart.push({
        ...test,
        quantity: 1,
        type: 'labtest'
      });
      localStorage.setItem('cart', JSON.stringify(cart));
      setSuccess(`${test.name} added to cart!`);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setSuccess('Test already in cart!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const calculateDiscountedPrice = (price, discount) => {
    return price - (price * discount / 100);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Lab Tests - Diagnostic Services
      </Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Search and Filters */}
      <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Search tests, conditions, symptoms"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={1}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSearch}
              sx={{ height: '56px' }}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Popular Tests */}
      {!searchTerm && !category && popularTests.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            🔥 Popular Tests
          </Typography>
          <Grid container spacing={3}>
            {popularTests.map((test) => (
              <Grid item xs={12} md={6} key={test._id}>
                <Card sx={{ border: '2px solid #1976d2' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="h2">
                        {test.name}
                      </Typography>
                      <Box>
                        <Chip label="Popular" color="primary" size="small" />
                        {test.fastingRequired && (
                          <Chip label="Fasting" color="warning" size="small" sx={{ ml: 1 }} />
                        )}
                      </Box>
                    </Box>
                    <Typography color="textSecondary" gutterBottom>
                      {test.category}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Reports in: {test.reportTime}
                    </Typography>
                    
                    {test.testDetails && test.testDetails.length > 0 && (
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        Includes: {test.testDetails.slice(0, 3).join(', ')}
                        {test.testDetails.length > 3 && '...'}
                      </Typography>
                    )}
                    
                    <Box sx={{ mt: 2 }}>
                      {test.discount > 0 ? (
                        <>
                          <Typography variant="h6" color="primary">
                            ₹{calculateDiscountedPrice(test.price, test.discount).toFixed(2)}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ textDecoration: 'line-through' }}>
                            ₹{test.price}
                          </Typography>
                          <Typography variant="body2" color="success.main">
                            {test.discount}% off
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="h6" color="primary">
                          ₹{test.price}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => addToCart(test)}
                    >
                      Add to Cart
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* All Tests */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        {searchTerm || category ? 'Search Results' : 'All Diagnostic Tests'}
      </Typography>
      <Grid container spacing={3}>
        {tests.length === 0 ? (
          <Grid item xs={12}>
            <Typography variant="h6" textAlign="center" color="textSecondary">
              No tests found. Try different search criteria.
            </Typography>
          </Grid>
        ) : (
          tests.map((test) => (
            <Grid item xs={12} sm={6} md={4} key={test._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {test.name}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {test.category}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    {test.fastingRequired && (
                      <Chip label="Fasting Required" color="warning" size="small" />
                    )}
                    {test.popular && (
                      <Chip label="Popular" color="primary" size="small" sx={{ ml: 1 }} />
                    )}
                  </Box>

                  <Typography variant="body2" gutterBottom>
                    Reports in: {test.reportTime}
                  </Typography>
                  
                  {test.testDetails && test.testDetails.length > 0 && (
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      Includes: {test.testDetails.slice(0, 2).join(', ')}
                      {test.testDetails.length > 2 && '...'}
                    </Typography>
                  )}

                  <Box sx={{ mt: 2 }}>
                    {test.discount > 0 ? (
                      <>
                        <Typography variant="h6" color="primary">
                          ₹{calculateDiscountedPrice(test.price, test.discount).toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ textDecoration: 'line-through' }}>
                          ₹{test.price}
                        </Typography>
                        <Typography variant="body2" color="success.main">
                          {test.discount}% off
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="h6" color="primary">
                        ₹{test.price}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => addToCart(test)}
                  >
                    Add to Cart
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
};

export default LabTests;
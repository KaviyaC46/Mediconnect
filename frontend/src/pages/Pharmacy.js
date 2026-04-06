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
  Snackbar,
  Alert
} from '@mui/material';
import {
  Search,
  LocalPharmacy,
  ShoppingCart
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Pharmacy = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [cart, setCart] = useState([]);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000]);

  // Alert states
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  // Fetch medicines
  const fetchMedicines = async (pageNum = 1) => {
    try {
      setLoading(true);
      const params = {
        page: pageNum,
        limit: 12,
        search: searchTerm,
        category: category,
        brand: brand,
        minPrice: priceRange[0],
        maxPrice: priceRange[1]
      };

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await axios.get('http://localhost:5000/api/medicines', { params });
      
      if (response.data.success) {
        setMedicines(response.data.data);
      } else {
        showAlert('Failed to fetch medicines', 'error');
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
      // Use mock data if API fails
      setMedicines(getMockMedicines());
      showAlert('Using demo data. Backend might be unavailable.', 'info');
    } finally {
      setLoading(false);
    }
  };

  // Mock data for testing
  const getMockMedicines = () => [
    {
      _id: '1',
      name: 'Paracetamol 500mg',
      brand: 'Cipla',
      price: 25,
      discount: 20,
      discountedPrice: 20,
      inStock: true,
      prescriptionRequired: false,
      composition: ['Paracetamol'],
      category: 'Pain Relief',
      description: 'Used for relief of fever and mild to moderate pain'
    },
    {
      _id: '2',
      name: 'Amoxicillin 250mg',
      brand: 'Sun Pharma',
      price: 45,
      discount: 0,
      discountedPrice: 45,
      inStock: true,
      prescriptionRequired: true,
      composition: ['Amoxicillin'],
      category: 'Antibiotic',
      description: 'Antibiotic used to treat bacterial infections'
    },
    {
      _id: '3',
      name: 'Vitamin C 1000mg',
      brand: 'Himalaya',
      price: 120,
      discount: 10,
      discountedPrice: 108,
      inStock: true,
      prescriptionRequired: false,
      composition: ['Vitamin C'],
      category: 'Vitamin',
      description: 'Dietary supplement for immune support'
    },
    {
      _id: '4',
      name: 'Dolo 650mg',
      brand: 'Micro Labs',
      price: 30,
      discount: 15,
      discountedPrice: 25.5,
      inStock: true,
      prescriptionRequired: false,
      composition: ['Paracetamol'],
      category: 'Pain Relief',
      description: 'For fever and pain relief'
    }
  ];

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/medicines/data/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(['Pain Relief', 'Antibiotic', 'Vitamin', 'Cardiac', 'Diabetes']);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/medicines/data/brands');
      if (response.data.success) {
        setBrands(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      setBrands(['Cipla', 'Sun Pharma', 'Himalaya', 'Micro Labs']);
    }
  };

  const showAlert = (message, severity = 'success') => {
    setAlert({ open: true, message, severity });
  };

  const handleSearch = () => {
    fetchMedicines(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategory('');
    setBrand('');
    setPriceRange([0, 5000]);
    fetchMedicines(1);
  };

  const addToCart = (medicine) => {
    if (!user) {
      showAlert('Please login to add items to cart', 'warning');
      navigate('/login');
      return;
    }

    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    const existingItem = cart.find(item => item._id === medicine._id && item.type === 'medicine');
    
    if (existingItem) {
      cart = cart.map(item =>
        item._id === medicine._id && item.type === 'medicine'
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      cart.push({
        ...medicine,
        quantity: 1,
        type: 'medicine'
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    setCart(cart);
    showAlert(`${medicine.name} added to cart`, 'success');
  };

  const loadCartFromStorage = () => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart.filter(item => item.type === 'medicine'));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  // Initial data loading
  useEffect(() => {
    fetchMedicines();
    fetchCategories();
    fetchBrands();
    loadCartFromStorage();
  }, []);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom color="primary">
          <LocalPharmacy sx={{ fontSize: 40, mr: 2, verticalAlign: 'bottom' }} />
          Pharmacy
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Order genuine medicines with doorstep delivery
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 4, p: 3, backgroundColor: '#f8f9fa' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search medicines"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by medicine name, brand or category..."
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'primary.main' }} />,
              }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
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

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Brand</InputLabel>
              <Select
                value={brand}
                label="Brand"
                onChange={(e) => setBrand(e.target.value)}
              >
                <MenuItem value="">All Brands</MenuItem>
                {brands.map((brandItem) => (
                  <MenuItem key={brandItem} value={brandItem}>{brandItem}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              fullWidth
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              onClick={clearFilters}
              fullWidth
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>

        {/* Cart Button */}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<ShoppingCart />}
            onClick={() => navigate('/cart')}
            sx={{ position: 'relative' }}
          >
            View Cart
            {cart.length > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  backgroundColor: 'error.main',
                  color: 'white',
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {cart.length}
              </Box>
            )}
          </Button>
        </Box>
      </Card>

      {/* Medicines Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: 200 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading medicines...
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {medicines.map((medicine) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={medicine._id}>
              <MedicineCard 
                medicine={medicine} 
                onAddToCart={addToCart}
                formatPrice={formatPrice}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {medicines.length === 0 && !loading && (
        <Box textAlign="center" sx={{ mt: 4, p: 6 }}>
          <Typography variant="h5" color="textSecondary" gutterBottom>
            {searchTerm ? 'No medicines found' : 'No medicines available'}
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            {searchTerm 
              ? `No medicines found for "${searchTerm}". Try adjusting your search criteria.`
              : 'Try adjusting your search criteria or clear filters to see all medicines.'
            }
          </Typography>
          <Button variant="contained" onClick={clearFilters}>
            Clear Filters
          </Button>
        </Box>
      )}

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

// Medicine Card Component
const MedicineCard = ({ medicine, onAddToCart, formatPrice }) => {
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    setAdding(true);
    await onAddToCart(medicine);
    setAdding(false);
  };

  const displayPrice = medicine.discountedPrice || medicine.price;
  const hasDiscount = medicine.discount > 0;

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
        {/* Medicine Image Placeholder */}
        <Box
          sx={{
            height: 120,
            backgroundColor: '#e3f2fd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            borderRadius: 1
          }}
        >
          <LocalPharmacy sx={{ fontSize: 40, color: 'primary.main' }} />
        </Box>

        {/* Medicine Details */}
        <Typography variant="h6" gutterBottom sx={{ 
          fontSize: '1rem', 
          fontWeight: 600, 
          minHeight: '48px',
          lineHeight: 1.2
        }}>
          {medicine.name}
        </Typography>
        
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {medicine.brand}
        </Typography>

        <Typography variant="body2" color="textSecondary" sx={{ 
          mb: 1, 
          minHeight: '40px',
          fontSize: '0.8rem'
        }}>
          {medicine.composition?.join(', ') || 'No composition details'}
        </Typography>

        {/* Price */}
        <Box sx={{ mb: 2 }}>
          {hasDiscount ? (
            <Box>
              <Typography variant="h6" color="primary" fontWeight="bold">
                {formatPrice(displayPrice)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="textSecondary" sx={{ textDecoration: 'line-through' }}>
                  {formatPrice(medicine.price)}
                </Typography>
                <Chip label={`${medicine.discount}% OFF`} color="success" size="small" />
              </Box>
            </Box>
          ) : (
            <Typography variant="h6" color="primary" fontWeight="bold">
              {formatPrice(displayPrice)}
            </Typography>
          )}
        </Box>

        {/* Stock Status */}
        <Box sx={{ mb: 2 }}>
          <Chip
            label={medicine.inStock ? 'In Stock' : 'Out of Stock'}
            color={medicine.inStock ? 'success' : 'error'}
            size="small"
          />
          {medicine.prescriptionRequired && (
            <Chip
              label="Prescription Required"
              color="warning"
              size="small"
              sx={{ ml: 1 }}
            />
          )}
        </Box>
      </CardContent>

      {/* Add to Cart Button */}
      <Box sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleAddToCart}
          disabled={!medicine.inStock || adding}
          startIcon={<ShoppingCart />}
        >
          {medicine.inStock ? (adding ? 'Adding...' : 'Add to Cart') : 'Out of Stock'}
        </Button>
      </Box>
    </Card>
  );
};

export default Pharmacy;
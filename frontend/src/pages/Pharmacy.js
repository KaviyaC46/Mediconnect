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
  Slider,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Search,
  FilterList,
  LocalPharmacy,
  ShoppingCart,
  Add,
  Remove
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Pharmacy = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [prescriptionRequired, setPrescriptionRequired] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Alert states
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  // Fetch medicines function
  const fetchMedicines = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pageNum,
        limit: 12,
        inStock: true
      });

      if (searchTerm) params.append('search', searchTerm);
      if (category) params.append('category', category);
      if (brand) params.append('brand', brand);
      if (prescriptionRequired) params.append('prescriptionRequired', prescriptionRequired);
      params.append('minPrice', priceRange[0]);
      params.append('maxPrice', priceRange[1]);

      console.log('Fetching medicines with params:', params.toString());

      const response = await axios.get(`http://localhost:5000/api/medicines?${params}`);
      
      console.log('Medicines API Response:', response.data);
      
      if (response.data.success) {
        setFilteredMedicines(response.data.data);
        setTotalPages(response.data.pagination.pages);
        setPage(pageNum);
      } else {
        showAlert('Failed to fetch medicines', 'error');
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
      showAlert('Error loading medicines. Please check if backend server is running.', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, category, brand, prescriptionRequired, priceRange]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/medicines/data/categories');
      console.log('Categories API Response:', response.data);
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/medicines/data/brands');
      console.log('Brands API Response:', response.data);
      if (response.data.success) {
        setBrands(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const loadCartFromStorage = () => {
    const savedCart = localStorage.getItem('pharmacyCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCartToStorage = (cartData) => {
    localStorage.setItem('pharmacyCart', JSON.stringify(cartData));
  };

  const showAlert = (message, severity = 'success') => {
    setAlert({ open: true, message, severity });
  };

  const handleSearch = useCallback(() => {
    setPage(1);
    fetchMedicines(1);
  }, [fetchMedicines]);

  // Auto-search when filters change (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm || category || brand || prescriptionRequired || priceRange[1] < 5000) {
        handleSearch();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, category, brand, prescriptionRequired, priceRange, handleSearch]); // Fixed: Added handleSearch to dependencies

  const clearFilters = () => {
    setSearchTerm('');
    setCategory('');
    setBrand('');
    setPriceRange([0, 5000]);
    setPrescriptionRequired('');
    setPage(1);
    // Fetch all medicines when clearing filters
    fetchMedicines(1);
  };

  const addToCart = (medicine) => {
    if (!user) {
      showAlert('Please login to add items to cart', 'warning');
      navigate('/login');
      return;
    }

    const existingItem = cart.find(item => item.medicineId === medicine._id);
    let newCart;

    if (existingItem) {
      newCart = cart.map(item =>
        item.medicineId === medicine._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, {
        medicineId: medicine._id,
        name: medicine.name,
        brand: medicine.brand,
        price: medicine.discountedPrice || medicine.price,
        image: medicine.image,
        prescriptionRequired: medicine.prescriptionRequired,
        quantity: 1
      }];
    }

    setCart(newCart);
    saveCartToStorage(newCart);
    showAlert(`${medicine.name} added to cart`, 'success');
  };

  const updateCartQuantity = (medicineId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(medicineId);
      return;
    }

    const newCart = cart.map(item =>
      item.medicineId === medicineId
        ? { ...item, quantity: newQuantity }
        : item
    );

    setCart(newCart);
    saveCartToStorage(newCart);
  };

  const removeFromCart = (medicineId) => {
    const newCart = cart.filter(item => item.medicineId !== medicineId);
    setCart(newCart);
    saveCartToStorage(newCart);
    showAlert('Item removed from cart', 'info');
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const proceedToCheckout = () => {
    if (cart.length === 0) {
      showAlert('Cart is empty', 'warning');
      return;
    }

    // Check for prescription required items
    const prescriptionItems = cart.filter(item => item.prescriptionRequired);
    if (prescriptionItems.length > 0) {
      showAlert('Prescription required for some items. Please upload prescription at checkout.', 'warning');
    }

    navigate('/cart');
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
  }, [fetchMedicines]);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom color="primary">
            <LocalPharmacy sx={{ fontSize: 40, mr: 2, verticalAlign: 'bottom' }} />
            Pharmacy
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Order genuine medicines with doorstep delivery
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<ShoppingCart />}
          onClick={() => setCartOpen(true)}
          sx={{ position: 'relative' }}
        >
          Cart
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

      {/* Search and Filters */}
      <Card sx={{ mb: 4, p: 3, backgroundColor: '#f8f9fa' }}>
        <Grid container spacing={3}>
          {/* Search */}
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search medicines"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g., Paracetamol, Dolo 650"
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'primary.main' }} />,
              }}
            />
          </Grid>

          {/* Category */}
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

          {/* Brand */}
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

          {/* Prescription Required */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Prescription</InputLabel>
              <Select
                value={prescriptionRequired}
                label="Prescription"
                onChange={(e) => setPrescriptionRequired(e.target.value)}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="true">Prescription Required</MenuItem>
                <MenuItem value="false">Over the Counter</MenuItem>
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

        {/* Price Range */}
        <Box sx={{ mt: 3 }}>
          <Typography gutterBottom>Price Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}</Typography>
          <Slider
            value={priceRange}
            onChange={(e, newValue) => setPriceRange(newValue)}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => formatPrice(value)}
            min={0}
            max={5000}
            step={100}
          />
        </Box>
      </Card>

      {/* Search Results Info */}
      {searchTerm && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">
            Search Results for: "{searchTerm}"
            {filteredMedicines.length > 0 && ` (${filteredMedicines.length} medicines found)`}
          </Typography>
        </Box>
      )}

      {/* Medicines Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: 200 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading medicines...
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {filteredMedicines.map((medicine) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={medicine._id}>
                <MedicineCard 
                  medicine={medicine} 
                  onAddToCart={addToCart}
                  formatPrice={formatPrice}
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
                onChange={(e, value) => fetchMedicines(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {filteredMedicines.length === 0 && !loading && (
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

      {/* Cart Dialog */}
      <Dialog open={cartOpen} onClose={() => setCartOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ShoppingCart sx={{ mr: 1 }} />
            Shopping Cart ({cart.length} items)
          </Box>
        </DialogTitle>
        <DialogContent>
          {cart.length === 0 ? (
            <Typography color="textSecondary" textAlign="center" py={4}>
              Your cart is empty
            </Typography>
          ) : (
            <Box>
              {cart.map((item) => (
                <Box key={item.medicineId} sx={{ display: 'flex', alignItems: 'center', py: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">{item.name}</Typography>
                    <Typography variant="body2" color="textSecondary">{item.brand}</Typography>
                    <Typography variant="body1" fontWeight="bold" color="primary">
                      {formatPrice(item.price)}
                    </Typography>
                    {item.prescriptionRequired && (
                      <Chip label="Prescription Required" color="warning" size="small" sx={{ mt: 1 }} />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                      size="small"
                      onClick={() => updateCartQuantity(item.medicineId, item.quantity - 1)}
                    >
                      <Remove />
                    </Button>
                    <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                    <Button
                      size="small"
                      onClick={() => updateCartQuantity(item.medicineId, item.quantity + 1)}
                    >
                      <Add />
                    </Button>
                    <Button
                      color="error"
                      onClick={() => removeFromCart(item.medicineId)}
                      sx={{ ml: 2 }}
                    >
                      Remove
                    </Button>
                  </Box>
                </Box>
              ))}
              <Box sx={{ mt: 3, pt: 2, borderTop: 2, borderColor: 'divider' }}>
                <Typography variant="h5" textAlign="right">
                  Total: {formatPrice(getCartTotal())}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCartOpen(false)}>Continue Shopping</Button>
          {cart.length > 0 && (
            <Button variant="contained" onClick={proceedToCheckout}>
              Proceed to Checkout
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } }}>
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        {/* Medicine Image Placeholder */}
        <Box
          sx={{
            height: 120,
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            borderRadius: 1
          }}
        >
          <LocalPharmacy sx={{ fontSize: 40, color: 'text.secondary' }} />
        </Box>

        {/* Medicine Details */}
        <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 600, minHeight: '48px' }}>
          {medicine.name}
        </Typography>
        
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {medicine.brand}
        </Typography>

        <Typography variant="body2" color="textSecondary" sx={{ mb: 1, minHeight: '40px' }}>
          {medicine.composition?.join(', ') || 'No composition details'}
        </Typography>

        {/* Price */}
        <Box sx={{ mb: 2 }}>
          {medicine.discount > 0 ? (
            <Box>
              <Typography variant="h6" color="primary" fontWeight="bold">
                {formatPrice(medicine.discountedPrice || medicine.price)}
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
              {formatPrice(medicine.price)}
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
          startIcon={adding ? <CircularProgress size={16} /> : <ShoppingCart />}
        >
          {medicine.inStock ? (adding ? 'Adding...' : 'Add to Cart') : 'Out of Stock'}
        </Button>
      </Box>
    </Card>
  );
};

export default Pharmacy;
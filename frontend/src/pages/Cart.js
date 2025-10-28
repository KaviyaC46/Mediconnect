import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  IconButton,
  TextField,
  Divider,
  Alert,
} from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = [...cartItems];
    updatedCart[index].quantity = newQuantity;
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeItem = (index) => {
    const updatedCart = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const calculateItemPrice = (item) => {
    const price = item.discount > 0 
      ? item.price - (item.price * item.discount / 100)
      : item.price;
    return price * item.quantity;
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + calculateItemPrice(item), 0);
  };

  const proceedToCheckout = async () => {
    if (!user) {
      alert('Please login to proceed with checkout');
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    try {
      // Separate medicines and lab tests
      const medicines = cartItems.filter(item => item.type === 'medicine');
      const labTests = cartItems.filter(item => item.type === 'labtest');

      // Create medicine orders
      if (medicines.length > 0) {
        const orderData = {
          items: medicines.map(item => ({
            medicine: item._id,
            quantity: item.quantity,
            price: calculateItemPrice(item) / item.quantity
          })),
          totalAmount: medicines.reduce((total, item) => total + calculateItemPrice(item), 0),
          shippingAddress: {
            address: 'To be provided',
            city: 'To be provided',
            state: 'To be provided',
            pincode: 'To be provided',
            phone: user.phone
          },
          paymentMethod: 'online'
        };

        await axios.post('http://localhost:5000/api/orders', orderData);
      }

      // Create lab test orders
      if (labTests.length > 0) {
        const labOrderData = {
          tests: labTests.map(item => ({
            test: item._id,
            price: calculateItemPrice(item) / item.quantity
          })),
          totalAmount: labTests.reduce((total, item) => total + calculateItemPrice(item), 0),
          patientDetails: {
            name: user.name,
            age: user.age || 0,
            gender: user.gender || 'Not specified',
            phone: user.phone
          },
          address: {
            address: 'To be provided',
            city: 'To be provided',
            state: 'To be provided',
            pincode: 'To be provided'
          },
          preferredDate: new Date().toISOString().split('T')[0],
          preferredTime: '10:00 AM',
          paymentMethod: 'online'
        };

        await axios.post('http://localhost:5000/api/laborders', labOrderData);
      }

      // Clear cart
      localStorage.removeItem('cart');
      setCartItems([]);
      
      alert('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  if (!user) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Alert severity="warning">
          Please login to view your cart.
        </Alert>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={() => navigate('/login')}
        >
          Login
        </Button>
      </Container>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Your Cart is Empty
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Add some items from doctors, pharmacy, or lab tests.
        </Typography>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={() => navigate('/')}
        >
          Continue Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Shopping Cart
      </Typography>

      <Grid container spacing={4}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          {cartItems.map((item, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6">
                      {item.name}
                    </Typography>
                    <Typography color="textSecondary">
                      {item.type === 'medicine' ? item.brand : item.category}
                    </Typography>
                    {item.type === 'medicine' && item.prescriptionRequired && (
                      <Typography variant="body2" color="error">
                        Prescription Required
                      </Typography>
                    )}
                    {item.type === 'labtest' && item.fastingRequired && (
                      <Typography variant="body2" color="warning.main">
                        Fasting Required
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12} sm={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconButton 
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Remove />
                      </IconButton>
                      <TextField
                        value={item.quantity}
                        size="small"
                        sx={{ width: 60, mx: 1 }}
                        inputProps={{ style: { textAlign: 'center' } }}
                        disabled
                      />
                      <IconButton onClick={() => updateQuantity(index, item.quantity + 1)}>
                        <Add />
                      </IconButton>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <Typography variant="h6" textAlign="center">
                      ₹{calculateItemPrice(item).toFixed(2)}
                    </Typography>
                    {item.discount > 0 && (
                      <Typography variant="body2" color="textSecondary" textAlign="center" sx={{ textDecoration: 'line-through' }}>
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12} sm={1}>
                    <IconButton 
                      color="error" 
                      onClick={() => removeItem(index)}
                    >
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                {cartItems.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      {item.name} x {item.quantity}
                    </Typography>
                    <Typography variant="body2">
                      ₹{calculateItemPrice(item).toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" color="primary">
                  ₹{calculateTotal().toFixed(2)}
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3 }}
                onClick={proceedToCheckout}
              >
                Proceed to Checkout
              </Button>

              <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 1 }}
                onClick={() => navigate('/')}
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cart;
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  TextField,
  Divider,
  Paper
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  ShoppingCartCheckout
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState([]); // ADD THIS LINE

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = [...cart];
    updatedCart[index].quantity = newQuantity;
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeItem = (index) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (!user) {
      alert('Please login to proceed to checkout');
      navigate('/login');
      return;
    }
    
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }
    
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Your Cart is Empty
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          Add some items to your cart to see them here
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/pharmacy')}
        >
          Shop Medicines
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/lab-tests')}
          sx={{ ml: 2 }}
        >
          Book Lab Tests
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Shopping Cart
      </Typography>

      <Grid container spacing={3}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          {cart.map((item, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6">{item.name}</Typography>
                    <Typography color="textSecondary">
                      {item.type === 'labtest' ? 'Lab Test' : 'Medicine'}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ₹{item.price}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={3}>
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
                        sx={{ 
                          width: 60, 
                          mx: 1,
                          '& .MuiInputBase-input': { textAlign: 'center' }
                        }}
                        inputProps={{ min: 1 }}
                        onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                      />
                      <IconButton onClick={() => updateQuantity(index, item.quantity + 1)}>
                        <Add />
                      </IconButton>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={2}>
                    <Typography variant="h6" align="center">
                      ₹{item.price * item.quantity}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={1}>
                    <IconButton 
                      color="error" 
                      onClick={() => removeItem(index)}
                      sx={{ display: 'block', margin: '0 auto' }}
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
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal:</Typography>
                <Typography>₹{getTotalPrice()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Shipping:</Typography>
                <Typography>₹0</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Tax:</Typography>
                <Typography>₹0</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary">
                  ₹{getTotalPrice()}
                </Typography>
              </Box>
            </Box>

            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              fullWidth
              startIcon={<ShoppingCartCheckout />}
              onClick={handleCheckout}
              sx={{ mt: 2 }}
            >
              Proceed to Checkout
            </Button>

            <Button 
              variant="outlined" 
              fullWidth
              onClick={() => navigate('/pharmacy')}
              sx={{ mt: 1 }}
            >
              Continue Shopping
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cart;
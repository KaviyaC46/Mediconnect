import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const API_BASE_URL = process.env.REACT_APP_API_URL || '';

  const [cart, setCart] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: ''
  });
  const [adminSettings, setAdminSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  const steps = ['Cart Review', 'Shipping Details', 'Payment', 'Confirmation'];

  useEffect(() => {
    loadCart();
    loadAdminSettings();
  }, []);

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  };

  const loadAdminSettings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/settings`);
      setAdminSettings(response.data.data);
    } catch (error) {
      console.error('Error loading admin settings:', error);
      // Use default settings if API fails
      setAdminSettings({
        upiId: 'mediconnect.admin@upi',
        qrCodeImage: '/images/upi-qr.png'
      });
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

 const handlePlaceOrder = async () => {
  try {
    setLoading(true);
    
    if (!user) {
      alert('Please login to place an order');
      navigate('/login');
      return;
    }

    // Create order object
    const orderData = {
      _id: 'order-' + Date.now(),
      orderId: 'ORD' + Date.now(),
      userId: user._id || user.id,
      items: cart,
      totalAmount: getTotalPrice(),
      paymentMethod,
      upiTransactionId: transactionId,
      shippingAddress,
      orderStatus: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date(),
      adminApproval: {
        approved: false
      }
    };

    // Save to localStorage for demo (replace with API call later)
    const existingOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    const updatedOrders = [orderData, ...existingOrders];
    localStorage.setItem('userOrders', JSON.stringify(updatedOrders));

    console.log('✅ Order saved locally:', orderData);
    
    setCurrentOrder(orderData);
    setOrderPlaced(true);
    
    // Clear cart
    localStorage.removeItem('cart');
    setCart([]);
    
    handleNext();
    
  } catch (error) {
    console.error('❌ Order placement error:', error);
    alert('Failed to place order. Please try again.');
  } finally {
    setLoading(false);
  }
};
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Order Summary</Typography>
            {cart.map((item, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6">{item.name}</Typography>
                  <Typography color="textSecondary">
                    {item.type === 'labtest' ? 'Lab Test' : 'Medicine'}
                  </Typography>
                  <Typography>Quantity: {item.quantity}</Typography>
                  <Typography variant="h6" color="primary">
                    ₹{item.price * item.quantity}
                  </Typography>
                </CardContent>
              </Card>
            ))}
            <Divider sx={{ my: 2 }} />
            <Typography variant="h5" align="right">
              Total: ₹{getTotalPrice()}
            </Typography>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Shipping Details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={shippingAddress.name}
                  onChange={(e) => setShippingAddress({...shippingAddress, name: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  multiline
                  rows={3}
                  value={shippingAddress.address}
                  onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Pincode"
                  value={shippingAddress.pincode}
                  onChange={(e) => setShippingAddress({...shippingAddress, pincode: e.target.value})}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Payment Method</Typography>
            <FormControl component="fieldset">
              <FormLabel component="legend">Select Payment Method</FormLabel>
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <FormControlLabel value="upi" control={<Radio />} label="UPI Payment" />
                <FormControlLabel value="card" control={<Radio />} label="Credit/Debit Card" />
                <FormControlLabel value="cash" control={<Radio />} label="Cash on Delivery" />
              </RadioGroup>
            </FormControl>

            {paymentMethod === 'upi' && adminSettings && (
              <Box sx={{ mt: 3, p: 3, border: '1px solid #ddd', borderRadius: 2, backgroundColor: '#f9f9f9' }}>
                <Typography variant="h6" gutterBottom color="primary">
                  UPI Payment Instructions
                </Typography>
                
                <Paper elevation={2} sx={{ p: 3, textAlign: 'center', my: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Send ₹{getTotalPrice()} to:
                  </Typography>
                  <Typography variant="h5" color="primary" gutterBottom>
                    {adminSettings.upiId}
                  </Typography>
                  
                  {/* QR Code Placeholder */}
                  <Box sx={{ 
                    width: 200, 
                    height: 200, 
                    margin: '20px auto',
                    backgroundColor: '#fff',
                    border: '2px solid #1976d2',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                  }}>
                    <Typography variant="body2" color="textSecondary">
                      UPI QR Code
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      (Scan to Pay)
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                    Use any UPI app like Google Pay, PhonePe, Paytm
                  </Typography>
                </Paper>

                <TextField
                  fullWidth
                  label="UPI Transaction ID"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter UPI transaction reference number"
                  sx={{ mb: 2 }}
                  required
                />
                
                <Alert severity="info">
                  After making payment, enter the transaction ID above and click "Place Order". 
                  Your order will be confirmed after admin verification.
                </Alert>

                <Box sx={{ mt: 2, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    Bank Transfer Alternative:
                  </Typography>
                  <Typography variant="body2">
                    Account: {adminSettings.bankDetails?.accountName}
                  </Typography>
                  <Typography variant="body2">
                    Account No: {adminSettings.bankDetails?.accountNumber}
                  </Typography>
                  <Typography variant="body2">
                    IFSC: {adminSettings.bankDetails?.ifscCode}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        );

      case 3:
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom color="success.main">
              Order Placed Successfully!
            </Typography>
            {currentOrder && (
              <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6">Order ID: {currentOrder.orderId}</Typography>
                <Typography>Total Amount: ₹{currentOrder.totalAmount}</Typography>
                <Typography>Status: {currentOrder.orderStatus}</Typography>
                <Typography>Payment: {currentOrder.paymentStatus}</Typography>
                
                <Alert severity="info" sx={{ mt: 2 }}>
                  Your order is pending payment verification. 
                  Admin will confirm your order once payment is verified.
                  You can track your order status in the Orders section.
                </Alert>
              </Paper>
            )}
            <Button 
              variant="contained" 
              sx={{ mt: 3, mr: 2 }}
              onClick={() => navigate('/orders')}
            >
              View My Orders
            </Button>
            <Button 
              variant="outlined" 
              sx={{ mt: 3 }}
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  if (cart.length === 0 && !orderPlaced) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>Your cart is empty</Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Continue Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card>
        <CardContent>
          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button 
                  variant="contained" 
                  onClick={() => navigate('/')}
                >
                  Continue Shopping
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={activeStep === steps.length - 2 ? handlePlaceOrder : handleNext}
                  disabled={
                    (activeStep === 1 && (!shippingAddress.name || !shippingAddress.phone)) ||
                    (activeStep === 2 && paymentMethod === 'upi' && !transactionId) ||
                    loading
                  }
                >
                  {loading ? 'Processing...' : 
                   activeStep === steps.length - 2 ? 'Place Order' : 'Next'}
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Checkout;
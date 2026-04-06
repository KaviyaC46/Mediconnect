import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { ShoppingCart, LocalPharmacy, QrCode, Payment } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_URL || '';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      
      // Load from localStorage
      const savedOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
      
      // Filter orders for current user and medicine type
      const userMedicineOrders = savedOrders.filter(order => {
        const isCurrentUser = order.userId === (user._id || user.id);
        const hasMedicineItems = order.items.some(item => item.type === 'medicine');
        return isCurrentUser && hasMedicineItems;
      });

      if (userMedicineOrders.length > 0) {
        setOrders(userMedicineOrders);
      } else {
        // Fallback to mock data
        const mockOrders = getMockMedicineOrders();
        setOrders(mockOrders);
      }

    } catch (error) {
      console.error('Error loading orders:', error);
      setError('Failed to load orders');
      const mockOrders = getMockMedicineOrders();
      setOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  const getMockMedicineOrders = () => {
    return [
      {
        _id: '1',
        orderId: 'ORD001',
        items: [
          { name: 'Paracetamol', type: 'medicine', price: 25, quantity: 2 },
          { name: 'Vitamin C', type: 'medicine', price: 150, quantity: 1 }
        ],
        totalAmount: 200,
        orderStatus: 'pending_payment', // New status for pending payment verification
        paymentStatus: 'pending_verification', // New payment status
        createdAt: new Date('2024-01-15'),
        shippingAddress: {
          name: user?.name || 'John Doe',
          address: '123 Main St, City, State'
        },
        paymentMethod: 'upi',
        upiTransactionId: '' // Will be filled after payment
      }
    ];
  };

  const handleMakePayment = (order) => {
    setSelectedOrder(order);
    setPaymentDialogOpen(true);
  };

  const handlePaymentComplete = async (transactionId) => {
    try {
      // Update order with transaction ID and mark as pending verification
      const updatedOrders = orders.map(order => 
        order._id === selectedOrder._id 
          ? {
              ...order,
              paymentStatus: 'pending_verification',
              orderStatus: 'pending_approval',
              upiTransactionId: transactionId,
              paymentDate: new Date().toISOString()
            }
          : order
      );

      setOrders(updatedOrders);
      localStorage.setItem('userOrders', JSON.stringify(updatedOrders));

      // In a real app, you would send this to your backend
      // await axios.post(`${API_BASE_URL}/api/orders/${selectedOrder._id}/payment`, {
      //   upiTransactionId: transactionId,
      //   paymentStatus: 'pending_verification'
      // });

      setPaymentDialogOpen(false);
      alert('Payment details submitted! Your order is pending admin verification.');

    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Error submitting payment details. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
      case 'completed': 
      case 'approved': return 'success';
      case 'pending':
      case 'pending_payment': 
      case 'pending_approval': return 'warning';
      case 'cancelled': 
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getPaymentColor = (status) => {
    switch (status) {
      case 'completed': 
      case 'verified': return 'success';
      case 'pending': 
      case 'pending_verification': return 'warning';
      case 'failed': 
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (orderStatus, paymentStatus) => {
    if (orderStatus === 'pending_approval') {
      return 'Pending Admin Approval';
    }
    if (paymentStatus === 'pending_verification') {
      return 'Payment Verification Pending';
    }
    return orderStatus;
  };

  const getOrderDate = (order) => {
    if (order.createdAt instanceof Date) {
      return order.createdAt.toLocaleDateString();
    } else if (typeof order.createdAt === 'string') {
      return new Date(order.createdAt).toLocaleDateString();
    } else {
      return 'Recent';
    }
  };

  const isRecentOrder = (order) => {
    const orderTime = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return orderTime > fiveMinutesAgo;
  };

  if (!user) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Please login to view your orders
        </Typography>
        <Button variant="contained" onClick={() => navigate('/login')}>
          Login
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <LocalPharmacy sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
        <Typography variant="h4">
          Medicine Orders
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Show success message if order was recently placed */}
      {orders.some(order => isRecentOrder(order)) && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Your recent order has been placed successfully! It will be processed soon.
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <ShoppingCart sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Medicine Orders Found
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
              You haven't placed any medicine orders yet.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/pharmacy')}>
              Shop Medicines
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order._id || order.orderId}>
              <Card elevation={2} sx={{ 
                borderLeft: isRecentOrder(order) ? 4 : 0,
                borderColor: isRecentOrder(order) ? 'success.main' : 'transparent'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Order #{order.orderId}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Placed on {getOrderDate(order)}
                        {isRecentOrder(order) && (
                          <Chip 
                            label="New" 
                            color="success" 
                            size="small" 
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'flex-end' }}>
                      <Chip 
                        label={getStatusText(order.orderStatus, order.paymentStatus)} 
                        color={getStatusColor(order.orderStatus)}
                        size="small"
                      />
                      <Chip 
                        label={`Payment: ${order.paymentStatus}`} 
                        color={getPaymentColor(order.paymentStatus)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  {order.shippingAddress && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Shipping Address:
                      </Typography>
                      <Typography variant="body2">
                        {order.shippingAddress.name}<br />
                        {order.shippingAddress.address}
                        {order.shippingAddress.city && `, ${order.shippingAddress.city}`}
                        {order.shippingAddress.pincode && ` - ${order.shippingAddress.pincode}`}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Items ({order.items.length}):
                    </Typography>
                    {order.items.map((item, index) => (
                      <Box key={index} sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        py: 1,
                        borderBottom: index < order.items.length - 1 ? 1 : 0,
                        borderColor: 'divider'
                      }}>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {item.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {item.type === 'medicine' ? 'Medicine' : 'Lab Test'} • Qty: {item.quantity}
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="bold">
                          ₹{item.price * item.quantity}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  {order.upiTransactionId && (
                    <Box sx={{ mb: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Payment Details:
                      </Typography>
                      <Typography variant="body2">
                        UPI Transaction ID: {order.upiTransactionId}
                      </Typography>
                      {order.paymentDate && (
                        <Typography variant="body2" color="textSecondary">
                          Paid on: {new Date(order.paymentDate).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="h6">
                      Total: ₹{order.totalAmount}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {order.paymentStatus === 'pending' && (
                        <Button 
                          variant="contained" 
                          size="small"
                          startIcon={<Payment />}
                          onClick={() => handleMakePayment(order)}
                        >
                          Make Payment
                        </Button>
                      )}
                      {(order.paymentStatus === 'pending_verification' || order.orderStatus === 'pending_approval') && (
                        <Button variant="outlined" size="small" disabled>
                          Waiting for Approval
                        </Button>
                      )}
                      <Button variant="outlined" size="small">
                        Track Order
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Payment Instructions Dialog */}
      <Dialog 
        open={paymentDialogOpen} 
        onClose={() => setPaymentDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Payment sx={{ mr: 1 }} />
            Complete Your Payment
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Amount to Pay: ₹{selectedOrder?.totalAmount}
            </Typography>
            
            <Box sx={{ my: 3, p: 3, backgroundColor: 'grey.50', borderRadius: 2 }}>
              <QrCode sx={{ fontSize: 120, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Scan QR Code to Pay
              </Typography>
              <Typography variant="body1" color="textSecondary" gutterBottom>
                UPI ID: <strong>mediconnect@upi</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Please use your name as payment reference
              </Typography>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Payment Instructions:
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'left' }}>
                1. Open your UPI app (Google Pay, PhonePe, Paytm, etc.)<br />
                2. Scan the QR code above or enter UPI ID manually<br />
                3. Pay the exact amount: ₹{selectedOrder?.totalAmount}<br />
                4. Take a screenshot of the payment confirmation<br />
                5. Enter your UPI Transaction ID below
              </Typography>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Button 
                variant="outlined" 
                onClick={() => {
                  // Generate a mock transaction ID for demo
                  const mockTransactionId = 'TXN' + Date.now();
                  handlePaymentComplete(mockTransactionId);
                }}
                sx={{ mr: 2 }}
              >
                I Have Paid (Demo)
              </Button>
              <Button 
                variant="contained"
                onClick={() => {
                  const transactionId = prompt('Please enter your UPI Transaction ID:');
                  if (transactionId) {
                    handlePaymentComplete(transactionId);
                  }
                }}
              >
                Enter Transaction ID
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Orders;
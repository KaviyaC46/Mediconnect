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
  Button
} from '@mui/material';
import { Science, CalendarToday, LocalHospital } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LabOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_URL || '';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      
      // Try to load from localStorage first
      const savedOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
      
      // Filter orders for current user and lab test type
      const userLabOrders = savedOrders.filter(order => {
        const isCurrentUser = order.userId === (user._id || user.id);
        const hasLabTestItems = order.items.some(item => item.type === 'labtest');
        return isCurrentUser && hasLabTestItems;
      });

      if (userLabOrders.length > 0) {
        setOrders(userLabOrders);
      } else {
        // If no orders in localStorage, try backend API
        try {
          const response = await axios.get(`${API_BASE_URL}/api/orders/user/${user._id || user.id}`);
          if (response.data.success) {
            const labOrders = response.data.data.filter(order => 
              order.items.some(item => item.type === 'labtest')
            );
            setOrders(labOrders);
          }
        } catch (apiError) {
          console.log('Backend API not available, using mock data');
          // Fallback to mock data if backend fails
          const mockOrders = getMockLabOrders();
          setOrders(mockOrders);
        }
      }

    } catch (error) {
      console.error('Error loading lab orders:', error);
      setError('Failed to load lab orders');
      // Fallback to mock data
      const mockOrders = getMockLabOrders();
      setOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  const getMockLabOrders = () => {
    return [
      {
        _id: '1',
        orderId: 'LAB001',
        items: [
          { 
            name: 'Complete Blood Count (CBC)', 
            type: 'labtest', 
            price: 299, 
            quantity: 1,
            testDetails: {
              patientName: user?.name || 'John Doe',
              patientAge: 30,
              patientGender: 'Male',
              preferredDate: '2024-01-20',
              preferredTime: '10:00 AM'
            }
          }
        ],
        totalAmount: 299,
        orderStatus: 'confirmed',
        paymentStatus: 'completed',
        createdAt: new Date('2024-01-15'),
        shippingAddress: {
          name: user?.name || 'John Doe',
          phone: '9876543210',
          address: '123 Main St, City, State'
        }
      }
    ];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
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

  // Function to check if this order was just placed (within last 5 minutes)
  const isRecentOrder = (order) => {
    const orderTime = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return orderTime > fiveMinutesAgo;
  };

  if (!user) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Please login to view your lab orders
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
        <Science sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
        <Typography variant="h4">
          Lab Test Orders
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
          Your recent lab test has been booked successfully! Sample collection will be scheduled as per your preference.
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <LocalHospital sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Lab Test Orders Found
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
              You haven't booked any lab tests yet.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/lab-tests')}>
              Book Lab Tests
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
                        Booked on {getOrderDate(order)}
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
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip 
                        label={order.orderStatus} 
                        color={getStatusColor(order.orderStatus)}
                        size="small"
                      />
                      <Chip 
                        label={`Payment: ${order.paymentStatus}`} 
                        color={getStatusColor(order.paymentStatus)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  {order.items.map((item, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="h6" color="primary" gutterBottom>
                        {item.name}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        ₹{item.price}
                      </Typography>
                      
                      {item.testDetails && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Test Details:
                          </Typography>
                          <Grid container spacing={1}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                <strong>Patient:</strong> {item.testDetails.patientName}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                <strong>Age/Gender:</strong> {item.testDetails.patientAge} yrs, {item.testDetails.patientGender}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                <strong>Preferred Date:</strong> {item.testDetails.preferredDate}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                <strong>Time:</strong> {item.testDetails.preferredTime}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      )}
                    </Box>
                  ))}

                  {order.shippingAddress && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Collection Address:
                      </Typography>
                      <Typography variant="body2">
                        {order.shippingAddress.name} • {order.shippingAddress.phone}<br />
                        {order.shippingAddress.address}
                        {order.shippingAddress.city && `, ${order.shippingAddress.city}`}
                        {order.shippingAddress.pincode && ` - ${order.shippingAddress.pincode}`}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="h6">
                      Total: ₹{order.totalAmount}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button variant="outlined" size="small">
                        View Report
                      </Button>
                      {order.orderStatus === 'pending' && (
                        <Button variant="outlined" size="small">
                          Reschedule
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default LabOrders;
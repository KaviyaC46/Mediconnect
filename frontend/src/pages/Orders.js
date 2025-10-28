import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid,
  Button,
  Divider,
  Alert,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/orders/my-orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'shipped': return 'info';
      case 'confirmed': return 'primary';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateOrderTotal = (order) => {
    return order.items?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;
  };

  if (!user) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Alert severity="warning">
          Please login to view your orders.
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

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography>Loading orders...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          My Medicine Orders
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/pharmacy')}
        >
          Shop Medicines
        </Button>
      </Box>

      {orders.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" gutterBottom color="textSecondary">
              No Medicine Orders Found
            </Typography>
            <Typography variant="body1" color="textSecondary" gutterBottom sx={{ mb: 3 }}>
              You haven't placed any medicine orders yet.
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/pharmacy')}
            >
              Browse Medicines
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order._id}>
              <Card sx={{ transition: 'box-shadow 0.3s', '&:hover': { boxShadow: 3 } }}>
                <CardContent>
                  {/* Order Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Order # {order._id.slice(-8).toUpperCase()}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Ordered on {formatDate(order.createdAt)}
                      </Typography>
                      {order.shippingAddress && (
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                          Deliver to: {order.shippingAddress.address}, {order.shippingAddress.city}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Chip 
                        label={order.status?.charAt(0).toUpperCase() + order.status?.slice(1)} 
                        color={getStatusColor(order.status)}
                        sx={{ mb: 1 }}
                      />
                      <Box>
                        <Chip 
                          label={`Payment: ${order.paymentStatus}`}
                          color={getPaymentStatusColor(order.paymentStatus)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Order Items */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Order Items:
                    </Typography>
                    {order.items?.map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {item.medicine?.name || 'Medicine'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {item.medicine?.brand} • Qty: {item.quantity}
                          </Typography>
                          {item.medicine?.prescriptionRequired && (
                            <Chip label="Prescription Required" size="small" color="warning" sx={{ mt: 0.5 }} />
                          )}
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Order Summary */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">
                      Total Amount:
                    </Typography>
                    <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                      ₹{calculateOrderTotal(order).toFixed(2)}
                    </Typography>
                  </Box>

                  {/* Order Actions */}
                  <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-end' }}>
                    {order.status === 'pending' && (
                      <Button variant="outlined" color="error" size="small">
                        Cancel Order
                      </Button>
                    )}
                    <Button variant="outlined" size="small">
                      View Details
                    </Button>
                    {order.status === 'delivered' && (
                      <Button variant="contained" size="small">
                        Reorder
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Quick Stats */}
      {orders.length > 0 && (
        <Box sx={{ mt: 4, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Order Summary
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={6} md={3} textAlign="center">
              <Typography variant="h4" color="primary">
                {orders.length}
              </Typography>
              <Typography variant="body2">Total Orders</Typography>
            </Grid>
            <Grid item xs={6} md={3} textAlign="center">
              <Typography variant="h4" color="success.main">
                {orders.filter(o => o.status === 'delivered').length}
              </Typography>
              <Typography variant="body2">Delivered</Typography>
            </Grid>
            <Grid item xs={6} md={3} textAlign="center">
              <Typography variant="h4" color="warning.main">
                {orders.filter(o => o.status === 'pending').length}
              </Typography>
              <Typography variant="body2">Pending</Typography>
            </Grid>
            <Grid item xs={6} md={3} textAlign="center">
              <Typography variant="h4" color="info.main">
                {orders.filter(o => o.status === 'shipped').length}
              </Typography>
              <Typography variant="body2">Shipped</Typography>
            </Grid>
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default Orders;
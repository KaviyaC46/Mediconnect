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

const LabOrders = () => {
  const [labOrders, setLabOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchLabOrders();
    }
  }, [user]);

  const fetchLabOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/laborders/my-orders');
      setLabOrders(response.data);
    } catch (error) {
      console.error('Error fetching lab orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'info';
      case 'sample_collected': return 'primary';
      case 'confirmed': return 'primary';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'sample_collected': 'Sample Collected',
      'processing': 'Processing',
      'completed': 'Completed'
    };
    return statusMap[status] || status;
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
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateOrderTotal = (order) => {
    return order.tests?.reduce((total, test) => total + test.price, 0) || 0;
  };

  const downloadReport = (orderId) => {
    // Simulate report download
    alert(`Downloading report for order ${orderId.slice(-8).toUpperCase()}`);
    // In real implementation, this would download a PDF
  };

  const rescheduleTest = (orderId) => {
    alert(`Reschedule functionality for order ${orderId.slice(-8).toUpperCase()}`);
    // In real implementation, this would open a rescheduling modal
  };

  if (!user) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Alert severity="warning">
          Please login to view your lab test orders.
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
        <Typography>Loading lab test orders...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          My Lab Test Orders
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/lab-tests')}
        >
          Book New Test
        </Button>
      </Box>

      {labOrders.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" gutterBottom color="textSecondary">
              No Lab Test Orders Found
            </Typography>
            <Typography variant="body1" color="textSecondary" gutterBottom sx={{ mb: 3 }}>
              You haven't booked any lab tests yet.
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/lab-tests')}
            >
              Browse Lab Tests
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {labOrders.map((order) => (
            <Grid item xs={12} key={order._id}>
              <Card sx={{ transition: 'box-shadow 0.3s', '&:hover': { boxShadow: 3 } }}>
                <CardContent>
                  {/* Order Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Lab Order # {order._id.slice(-8).toUpperCase()}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Booked on {formatDateTime(order.createdAt)}
                      </Typography>
                      {order.patientDetails && (
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                          Patient: {order.patientDetails.name} • {order.patientDetails.age} yrs • {order.patientDetails.gender}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Chip 
                        label={getStatusText(order.status)} 
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

                  {/* Test Details */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Tests Booked:
                    </Typography>
                    {order.tests?.map((test, index) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', py: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {test.test?.name || 'Lab Test'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {test.test?.category}
                          </Typography>
                          {test.test?.fastingRequired && (
                            <Chip label="Fasting Required" size="small" color="warning" sx={{ mt: 0.5 }} />
                          )}
                          {test.test?.reportTime && (
                            <Typography variant="body2" color="textSecondary">
                              Report in: {test.test.reportTime}
                            </Typography>
                          )}
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 'medium', minWidth: 100, textAlign: 'right' }}>
                          ₹{test.price.toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Appointment Details */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Preferred Date & Time
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(order.preferredDate)} at {order.preferredTime || 'Anytime'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Collection Address
                      </Typography>
                      <Typography variant="body1">
                        {order.address ? 
                          `${order.address.address}, ${order.address.city}` : 
                          'Home Collection'
                        }
                      </Typography>
                    </Grid>
                  </Grid>

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
                  <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    {order.status === 'pending' && (
                      <Button variant="outlined" color="error" size="small">
                        Cancel Order
                      </Button>
                    )}
                    {order.status === 'confirmed' && (
                      <Button variant="outlined" size="small" onClick={() => rescheduleTest(order._id)}>
                        Reschedule
                      </Button>
                    )}
                    {order.status === 'completed' && (
                      <Button variant="contained" size="small" onClick={() => downloadReport(order._id)}>
                        Download Report
                      </Button>
                    )}
                    <Button variant="outlined" size="small">
                      View Details
                    </Button>
                    {order.status === 'completed' && (
                      <Button variant="outlined" size="small" onClick={() => navigate('/lab-tests')}>
                        Book Again
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
      {labOrders.length > 0 && (
        <Box sx={{ mt: 4, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Lab Test Summary
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={6} md={3} textAlign="center">
              <Typography variant="h4" color="primary">
                {labOrders.length}
              </Typography>
              <Typography variant="body2">Total Tests</Typography>
            </Grid>
            <Grid item xs={6} md={3} textAlign="center">
              <Typography variant="h4" color="success.main">
                {labOrders.filter(o => o.status === 'completed').length}
              </Typography>
              <Typography variant="body2">Completed</Typography>
            </Grid>
            <Grid item xs={6} md={3} textAlign="center">
              <Typography variant="h4" color="info.main">
                {labOrders.filter(o => o.status === 'processing').length}
              </Typography>
              <Typography variant="body2">Processing</Typography>
            </Grid>
            <Grid item xs={6} md={3} textAlign="center">
              <Typography variant="h4" color="warning.main">
                {labOrders.filter(o => o.status === 'pending').length}
              </Typography>
              <Typography variant="body2">Pending</Typography>
            </Grid>
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default LabOrders;
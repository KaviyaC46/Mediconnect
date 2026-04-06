import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  AppBar,
  Toolbar,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Dashboard,
  ShoppingCart,
  People,
  Science,
  Logout,
  LocalPharmacy,
  MedicalServices,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_URL || '';

  const [adminUser, setAdminUser] = useState(null);
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [approvalNotes, setApprovalNotes] = useState('');

  useEffect(() => {
    checkAdminAuth();
    loadDashboardData();
  }, []);

  const checkAdminAuth = () => {
    const adminToken = localStorage.getItem('adminToken');
    const adminUserData = localStorage.getItem('adminUser');
    
    if (!adminToken || !adminUserData) {
      navigate('/admin/login');
      return;
    }

    setAdminUser(JSON.parse(adminUserData));
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load orders from localStorage (for demo)
      const savedOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
      
      // Calculate stats
      const totalOrders = savedOrders.length;
      const pendingOrders = savedOrders.filter(order => order.orderStatus === 'pending').length;
      const medicineOrders = savedOrders.filter(order => 
        order.items.some(item => item.type === 'medicine')
      ).length;
      const labTestOrders = savedOrders.filter(order => 
        order.items.some(item => item.type === 'labtest')
      ).length;

      setStats({
        totalOrders,
        pendingOrders,
        totalUsers: 156, // Mock user count
        totalTests: labTestOrders,
        totalMedicines: medicineOrders
      });

      setOrders(savedOrders);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
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

  const getPaymentColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const openApproveDialog = (order) => {
    setSelectedOrder(order);
    setApprovalNotes('');
    setApproveDialogOpen(true);
  };

  const closeApproveDialog = () => {
    setApproveDialogOpen(false);
    setSelectedOrder(null);
    setApprovalNotes('');
  };

  const handleApproveOrder = () => {
    if (!selectedOrder) return;

    // Update order status in localStorage
    const savedOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    const updatedOrders = savedOrders.map(order => {
      if (order._id === selectedOrder._id) {
        return {
          ...order,
          orderStatus: 'confirmed',
          paymentStatus: 'completed',
          adminApproval: {
            approved: true,
            approvedBy: adminUser?.name || 'Admin',
            approvedAt: new Date(),
            notes: approvalNotes
          }
        };
      }
      return order;
    });

    localStorage.setItem('userOrders', JSON.stringify(updatedOrders));
    
    // Update local state
    setOrders(updatedOrders);
    setStats(prev => ({
      ...prev,
      pendingOrders: prev.pendingOrders - 1
    }));

    closeApproveDialog();
    alert('Order approved successfully!');
  };

  const handleRejectOrder = (order) => {
    if (window.confirm(`Are you sure you want to reject order ${order.orderId}?`)) {
      const savedOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
      const updatedOrders = savedOrders.map(o => {
        if (o._id === order._id) {
          return {
            ...o,
            orderStatus: 'cancelled',
            paymentStatus: 'failed'
          };
        }
        return o;
      });

      localStorage.setItem('userOrders', JSON.stringify(updatedOrders));
      setOrders(updatedOrders);
      alert('Order rejected successfully!');
    }
  };

  const getOrderType = (order) => {
    const hasMedicine = order.items.some(item => item.type === 'medicine');
    const hasLabTest = order.items.some(item => item.type === 'labtest');
    
    if (hasMedicine && hasLabTest) return 'Mixed';
    if (hasMedicine) return 'Medicine';
    if (hasLabTest) return 'Lab Test';
    return 'Unknown';
  };

  const getOrderTypeIcon = (order) => {
    const type = getOrderType(order);
    switch (type) {
      case 'Medicine': return <LocalPharmacy />;
      case 'Lab Test': return <Science />;
      case 'Mixed': return <MedicalServices />;
      default: return <ShoppingCart />;
    }
  };

  if (!adminUser) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <AppBar position="static">
        <Toolbar>
          <Dashboard sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Welcome, {adminUser.name}
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<Logout />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ShoppingCart sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Orders
                    </Typography>
                    <Typography variant="h4">
                      {stats.totalOrders || 0}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ShoppingCart sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Pending Orders
                    </Typography>
                    <Typography variant="h4">
                      {stats.pendingOrders || 0}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <People sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Users
                    </Typography>
                    <Typography variant="h4">
                      {stats.totalUsers || 0}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Science sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Lab Tests
                    </Typography>
                    <Typography variant="h4">
                      {stats.totalTests || 0}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocalPharmacy sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Medicines
                    </Typography>
                    <Typography variant="h4">
                      {stats.totalMedicines || 0}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Orders Table */}
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              All Orders ({orders.length})
            </Typography>
            
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Payment</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {order.orderId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getOrderTypeIcon(order)}
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {getOrderType(order)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {order.shippingAddress?.name || 'N/A'}
                          {order.shippingAddress?.phone && (
                            <Typography variant="body2" color="textSecondary">
                              {order.shippingAddress.phone}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>₹{order.totalAmount}</TableCell>
                        <TableCell>
                          <Chip 
                            label={order.orderStatus} 
                            color={getStatusColor(order.orderStatus)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={order.paymentStatus} 
                            color={getPaymentColor(order.paymentStatus)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {order.orderStatus === 'pending' && (
                              <>
                                <Button 
                                  size="small" 
                                  variant="contained"
                                  color="success"
                                  startIcon={<CheckCircle />}
                                  onClick={() => openApproveDialog(order)}
                                >
                                  Approve
                                </Button>
                                <Button 
                                  size="small" 
                                  variant="outlined"
                                  color="error"
                                  startIcon={<Cancel />}
                                  onClick={() => handleRejectOrder(order)}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {/* View button removed */}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {orders.length === 0 && !loading && (
              <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                No orders found.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Container>

      {/* Approve Order Dialog */}
      <Dialog 
        open={approveDialogOpen} 
        onClose={closeApproveDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Approve Order #{selectedOrder?.orderId}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to approve this order?
          </Typography>
          
          {selectedOrder && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Order Details:</Typography>
              <Typography variant="body2">
                Customer: {selectedOrder.shippingAddress?.name}<br />
                Amount: ₹{selectedOrder.totalAmount}<br />
                Items: {selectedOrder.items.map(item => item.name).join(', ')}
              </Typography>
            </Box>
          )}

          <TextField
            fullWidth
            label="Approval Notes (Optional)"
            multiline
            rows={3}
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
            sx={{ mt: 2 }}
            placeholder="Add any notes about this approval..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeApproveDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            color="success"
            onClick={handleApproveOrder}
            startIcon={<CheckCircle />}
          >
            Confirm Approval
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
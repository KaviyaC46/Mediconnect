import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { AdminPanelSettings, Login } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminLogin = () => {
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_URL || '';

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Mock admin login - in real app, this would call your backend
      if (formData.email === 'admin@mediconnect.com' && formData.password === 'admin123') {
        const mockAdminUser = {
          id: 'admin-1',
          name: 'System Administrator',
          email: 'admin@mediconnect.com',
          role: 'admin'
        };
        
        // Save admin token and info
        localStorage.setItem('adminToken', 'mock-admin-token');
        localStorage.setItem('adminUser', JSON.stringify(mockAdminUser));
        
        // Redirect to admin dashboard
        navigate('/admin/dashboard');
      } else {
        setError('Invalid credentials. Use admin@mediconnect.com / admin123');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <AdminPanelSettings sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Typography component="h1" variant="h4">
            Admin Login
          </Typography>
        </Box>

        <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
          Access the admin dashboard to manage orders and users
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Admin Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
            placeholder="admin@mediconnect.com"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter admin password"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Login />}
          >
            {loading ? 'Signing In...' : 'Sign In as Admin'}
          </Button>
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            Default Admin Credentials:
          </Typography>
          <Typography variant="body2">
            Email: admin@mediconnect.com
          </Typography>
          <Typography variant="body2">
            Password: admin123
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminLogin;
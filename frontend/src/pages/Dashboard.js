import React from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      title: 'Find Doctors',
      description: 'Book appointments with top doctors near you',
      route: '/doctors',
      color: '#1976d2',
      icon: '👨‍⚕️',
    },
    {
      title: 'Pharmacy',
      description: 'Order medicines online with home delivery',
      route: '/pharmacy',
      color: '#2e7d32',
      icon: '💊',
    },
    {
      title: 'Lab Tests',
      description: 'Book diagnostic tests and health checkups',
      route: '/lab-tests',
      color: '#ed6c02',
      icon: '🧪',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Welcome to MediConnect
      </Typography>
      
      {user && (
        <Typography variant="h6" component="p" gutterBottom align="center" color="textSecondary">
          Hello, {user.name}! How can we help you today?
        </Typography>
      )}

      <Grid container spacing={4} sx={{ mt: 2 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Typography variant="h1" sx={{ mb: 2 }}>
                  {feature.icon}
                </Typography>
                <Typography variant="h5" component="h2" gutterBottom color={feature.color}>
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  {feature.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  fullWidth 
                  variant="contained" 
                  sx={{ backgroundColor: feature.color }}
                  onClick={() => navigate(feature.route)}
                  size="large"
                >
                  Get Started
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Stats */}
      <Box sx={{ mt: 6, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom align="center">
          Why Choose MediConnect?
        </Typography>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={3} textAlign="center">
            <Typography variant="h4" color="primary">1000+</Typography>
            <Typography variant="body1">Verified Doctors</Typography>
          </Grid>
          <Grid item xs={12} md={3} textAlign="center">
            <Typography variant="h4" color="primary">5000+</Typography>
            <Typography variant="body1">Medicines Available</Typography>
          </Grid>
          <Grid item xs={12} md={3} textAlign="center">
            <Typography variant="h4" color="primary">200+</Typography>
            <Typography variant="body1">Lab Tests</Typography>
          </Grid>
          <Grid item xs={12} md={3} textAlign="center">
            <Typography variant="h4" color="primary">24/7</Typography>
            <Typography variant="body1">Customer Support</Typography>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
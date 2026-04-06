import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  ShoppingCart,
  MedicalServices,
  LocalPharmacy,
  Science,
  CalendarMonth,
  Assignment,
  AdminPanelSettings, // ADD THIS IMPORT
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get cart item count
  const getCartItemCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    navigate('/login');
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
    handleProfileMenuClose();
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // Navigation items
  const navItems = [
    { label: 'Doctors', path: '/doctors', icon: <MedicalServices /> },
    { label: 'Pharmacy', path: '/pharmacy', icon: <LocalPharmacy /> },
    { label: 'Lab Tests', path: '/lab-tests', icon: <Science /> },
  ];

  const userNavItems = [
    { label: 'Appointments', path: '/appointments', icon: <CalendarMonth /> },
    { label: 'Medicine Orders', path: '/orders', icon: <Assignment /> },
    { label: 'Lab Orders', path: '/lab-orders', icon: <Science /> },
  ];

  return (
    <>
      <AppBar position="static" elevation={2}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo */}
            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: { xs: 1, md: 0 },
                mr: 4,
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1.5rem',
                background: 'linear-gradient(45deg, #1976d2, #00bcd4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
              onClick={() => navigate('/')}
            >
              MediConnect
            </Typography>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: 'flex', flexGrow: 1, gap: 1 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    color="inherit"
                    startIcon={item.icon}
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      borderBottom: isActiveRoute(item.path) ? '2px solid white' : 'none',
                      borderRadius: 0,
                      fontWeight: isActiveRoute(item.path) ? 'bold' : 'normal',
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            {/* Right side items */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Cart Icon */}
              <IconButton
                color="inherit"
                onClick={() => handleNavigation('/cart')}
                sx={{
                  backgroundColor: isActiveRoute('/cart') ? 'rgba(255,255,255,0.1)' : 'transparent',
                }}
              >
                <Badge badgeContent={getCartItemCount()} color="error">
                  <ShoppingCart />
                </Badge>
              </IconButton>

              {/* ADMIN BUTTON - ADD THIS */}
              <Button 
                color="inherit" 
                onClick={() => navigate('/admin/login')}
                startIcon={<AdminPanelSettings />}
                sx={{
                  borderBottom: isActiveRoute('/admin/login') || isActiveRoute('/admin/dashboard') ? '2px solid white' : 'none',
                  borderRadius: 0,
                  fontWeight: (isActiveRoute('/admin/login') || isActiveRoute('/admin/dashboard')) ? 'bold' : 'normal',
                }}
              >
                Admin
              </Button>

              {user ? (
                <>
                  {/* User menu for desktop */}
                  {!isMobile && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {/* User specific navigation */}
                      {userNavItems.map((item) => (
                        <Button
                          key={item.path}
                          color="inherit"
                          startIcon={item.icon}
                          onClick={() => handleNavigation(item.path)}
                          sx={{
                            borderBottom: isActiveRoute(item.path) ? '2px solid white' : 'none',
                            borderRadius: 0,
                            fontWeight: isActiveRoute(item.path) ? 'bold' : 'normal',
                            fontSize: '0.875rem',
                          }}
                        >
                          {item.label}
                        </Button>
                      ))}
                    </Box>
                  )}

                  {/* User profile menu */}
                  <IconButton
                    color="inherit"
                    onClick={handleProfileMenuOpen}
                    sx={{
                      backgroundColor: anchorEl ? 'rgba(255,255,255,0.1)' : 'transparent',
                    }}
                  >
                    <AccountCircle />
                  </IconButton>

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleProfileMenuClose}
                    PaperProps={{
                      sx: {
                        mt: 1.5,
                        minWidth: 200,
                      }
                    }}
                  >
                    <MenuItem disabled>
                      <Typography variant="subtitle2" color="textSecondary">
                        Welcome, {user.name}
                      </Typography>
                    </MenuItem>
                    <MenuItem onClick={() => handleNavigation('/appointments')}>
                      <ListItemIcon>
                        <CalendarMonth fontSize="small" />
                      </ListItemIcon>
                      My Appointments
                    </MenuItem>
                    <MenuItem onClick={() => handleNavigation('/orders')}>
                      <ListItemIcon>
                        <Assignment fontSize="small" />
                      </ListItemIcon>
                      Medicine Orders
                    </MenuItem>
                    <MenuItem onClick={() => handleNavigation('/lab-orders')}>
                      <ListItemIcon>
                        <Science fontSize="small" />
                      </ListItemIcon>
                      Lab Orders
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <AccountCircle fontSize="small" />
                      </ListItemIcon>
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                /* Login/Register buttons */
                !isMobile && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      color="inherit"
                      onClick={() => navigate('/login')}
                      sx={{
                        border: isActiveRoute('/login') ? '1px solid white' : 'none',
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={() => navigate('/register')}
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.1)',
                        },
                      }}
                    >
                      Register
                    </Button>
                  </Box>
                )
              )}

              {/* Mobile menu button */}
              {isMobile && (
                <IconButton
                  color="inherit"
                  onClick={handleMobileMenuToggle}
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleMobileMenuToggle}
        PaperProps={{
          sx: {
            width: 280,
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
            MediConnect
          </Typography>
          
          <List>
            {/* Main Navigation */}
            {navItems.map((item) => (
              <ListItem
                key={item.path}
                button
                onClick={() => handleNavigation(item.path)}
                selected={isActiveRoute(item.path)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}

            {/* Admin for mobile - ADD THIS */}
            <ListItem
              button
              onClick={() => handleNavigation('/admin/login')}
              selected={isActiveRoute('/admin/login') || isActiveRoute('/admin/dashboard')}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                <AdminPanelSettings />
              </ListItemIcon>
              <ListItemText primary="Admin" />
            </ListItem>

            {/* User Navigation (if logged in) */}
            {user && userNavItems.map((item) => (
              <ListItem
                key={item.path}
                button
                onClick={() => handleNavigation(item.path)}
                selected={isActiveRoute(item.path)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}

            {/* Cart for mobile */}
            <ListItem
              button
              onClick={() => handleNavigation('/cart')}
              selected={isActiveRoute('/cart')}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                <Badge badgeContent={getCartItemCount()} color="error">
                  <ShoppingCart />
                </Badge>
              </ListItemIcon>
              <ListItemText primary="Cart" />
            </ListItem>

            {/* Auth buttons for mobile */}
            {!user ? (
              <>
                <ListItem
                  button
                  onClick={() => handleNavigation('/login')}
                  selected={isActiveRoute('/login')}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit' }}>
                    <AccountCircle />
                  </ListItemIcon>
                  <ListItemText primary="Login" />
                </ListItem>
                <ListItem
                  button
                  onClick={() => handleNavigation('/register')}
                  selected={isActiveRoute('/register')}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit' }}>
                    <AccountCircle />
                  </ListItemIcon>
                  <ListItemText primary="Register" />
                </ListItem>
              </>
            ) : (
              <ListItem
                button
                onClick={handleLogout}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  color: 'error.main',
                }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>
                  <AccountCircle />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItem>
            )}
          </List>
          // In your Navbar component, ensure you have:
<Button onClick={() => navigate('/doctors')}>
  Book Appointment
</Button>

          {/* User info in mobile drawer */}
          {user && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Signed in as
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {user.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {user.email}
              </Typography>
            </Box>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
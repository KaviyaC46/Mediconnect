import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Import AuthProvider
import { AuthProvider } from './contexts/AuthContext';

// Import components from pages
import Navbar from './components/Navbar';
import Home from './pages/Dashboard';
import LabTests from './pages/LabTests';
import Pharmacy from './pages/Pharmacy';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';
import LabOrders from './pages/LabOrders';
import DoctorSearch from './pages/DoctorSearch';
import DoctorDetails from './pages/DoctorDetails';
import Appointments from './pages/Appointments';
import Checkout from './pages/Checkout';
import Doctors from './pages/Doctors'; // ✅ ADD THIS IMPORT

// Import Admin Components
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/pharmacy" element={<Pharmacy />} />
            <Route path="/lab-tests" element={<LabTests />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/lab-orders" element={<LabOrders />} />
            <Route path="/doctors" element={<Doctors />} /> {/* ✅ ADD THIS ROUTE */}
            <Route path="/doctor-search" element={<DoctorSearch />} />
            <Route path="/doctors/:id" element={<DoctorDetails />} />
            <Route path="/appointments" element={<Appointments />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
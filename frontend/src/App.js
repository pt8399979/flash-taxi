import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './services/authService';

// Components
import Login from './components/Login';
import OTPVerification from './components/OTPVerification';
import Home from './components/Home';
import RideBooking from './components/RideBooking';
import RideTracking from './components/RideTracking';
import Profile from './components/Profile';
import SupportChat from './components/SupportChat';
import ProtectedRoute from './utils/helpers';
import FlashLogo from './components/FlashLogo';

// Import flash logo image
import flashLogo from './image/FlashTaxiLogo.png';

// Styles
import './styles/main.css';
import './styles/flash-logo.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a2e',
              color: '#ffd700',
              border: '2px solid #e63946',
              boxShadow: '0 0 20px rgba(230, 57, 70, 0.5)',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#ffd700',
                secondary: '#1a1a2e',
              },
            },
          }}
        />
        
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<OTPVerification />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/book-ride" element={
            <ProtectedRoute>
              <RideBooking />
            </ProtectedRoute>
          } />
          <Route path="/track-ride/:rideId" element={
            <ProtectedRoute>
              <RideTracking />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/support" element={
            <ProtectedRoute>
              <SupportChat />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
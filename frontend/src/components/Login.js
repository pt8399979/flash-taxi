import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authService';
import { toast } from 'react-hot-toast';
import { FiMail, FiArrowRight } from 'react-icons/fi';
import '../styles/auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { sendOTP } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const response = await sendOTP(email);
      if (response.success) {
        toast.success('⚡ Lightning fast OTP sent!');
        navigate('/verify-otp', { state: { email } });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="lightning-bolt-1">⚡</div>
      <div className="lightning-bolt-2">⚡</div>
      
      <div className="auth-card">
        <div className="flash-logo">
          <span className="logo-left">⚡</span>
          <span className="logo-icon">⚡</span>
          <div className="logo-text">
            <span className="logo-flash">FLASH</span>
            <span className="logo-taxi">TAXI</span>
          </div>
          <span className="logo-right">⚡</span>
        </div>
        
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to continue your journey</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>EMAIL ADDRESS</label>
            <div className="input-wrapper">
              <FiMail className="input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
                autoFocus
              />
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              <div className="spinner"></div>
            ) : (
              <>
                CONTINUE
                <FiArrowRight className="button-icon" />
              </>
            )}
          </button>
        </form>

        <p className="auth-footer">
          By continuing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
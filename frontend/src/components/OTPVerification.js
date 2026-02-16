import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/authService';
import { toast } from 'react-hot-toast';
import '../styles/auth.css';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, resendOTP } = useAuth();
  
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOTP(email, otpString);
      if (response.success) {
        toast.success('Login successful!');
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await resendOTP(email);
      setTimer(300);
      setCanResend(false);
      toast.success('New OTP sent');
    } catch (error) {
      toast.error('Failed to resend OTP');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-container">
          <div className="logo-icon">⚡</div>
          <h1 className="logo-text">FLASH TAXI</h1>
        </div>
        
        <h2 className="auth-title">Verify OTP</h2>
        <p className="auth-subtitle">We've sent a 6-digit code to</p>
        <p className="email-highlight">{email}</p>

        <div className="otp-inputs">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="otp-input"
              disabled={loading}
            />
          ))}
        </div>

        <div className="timer">
          Code expires in <span className="timer-value">{formatTime(timer)}</span>
        </div>

        {canResend ? (
          <button onClick={handleResendOTP} className="resend-button">
            Resend OTP
          </button>
        ) : (
          <button 
            onClick={handleVerifyOTP}
            className="auth-button"
            disabled={loading || otp.join('').length !== 6}
          >
            {loading ? <div className="spinner"></div> : 'Verify & Continue'}
          </button>
        )}

        <button onClick={() => navigate('/login')} className="back-button">
          ← Back to login
        </button>
      </div>
    </div>
  );
};

export default OTPVerification;
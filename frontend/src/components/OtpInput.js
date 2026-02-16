import React, { useEffect, useRef } from 'react';
import '../styles/otp-input.css';

const OtpInput = ({ value, onChange, numInputs = 6, inputType = 'text', shouldAutoFocus = false }) => {
  const inputRefs = useRef([]);

  useEffect(() => {
    if (shouldAutoFocus) {
      inputRefs.current[0]?.focus();
    }
  }, [shouldAutoFocus]);

  const handleChange = (e, index) => {
    const newValue = e.target.value;
    if (newValue.match(/^[0-9]$/)) {
      const newOtp = value.split('');
      newOtp[index] = newValue;
      onChange(newOtp.join(''));

      if (index < numInputs - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      
      const newOtp = value.split('');
      
      if (value[index]) {
        newOtp[index] = '';
        onChange(newOtp.join(''));
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < numInputs - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, numInputs);
    
    if (pastedData.match(/^[0-9]+$/)) {
      onChange(pastedData);
      const focusIndex = Math.min(pastedData.length, numInputs - 1);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="otp-input-container">
      {Array.from({ length: numInputs }, (_, index) => (
        <input
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="otp-input"
        />
      ))}
    </div>
  );
};

export default OtpInput;
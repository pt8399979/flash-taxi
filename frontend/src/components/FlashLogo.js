import React from 'react';
import '../styles/flash-logo.css';

const FlashLogo = ({ size = 'medium' }) => {
  return (
    <div className={`flash-logo ${size}`}>
      <div className="lightning-container">
        <div className="lightning bolt-1">⚡</div>
        <div className="lightning bolt-2">⚡</div>
        <div className="lightning bolt-3">⚡</div>
      </div>
      <div className="logo-text">
        <span className="flash">FLASH</span>
        <span className="taxi">TAXI</span>
      </div>
      <div className="speed-lines"></div>
    </div>
  );
};

export default FlashLogo;
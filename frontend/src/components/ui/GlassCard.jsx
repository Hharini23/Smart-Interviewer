import React from 'react';
import './GlassCard.css';

const GlassCard = ({ children, className = '', variant = 'default', ...props }) => {
  return (
    <div className={`glass-card ${variant} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default GlassCard;

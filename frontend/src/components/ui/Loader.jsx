import React from 'react';
import './Loader.css';

const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="loader-container">
      <div className="loader">
        <div className="loader-circle"></div>
        <div className="loader-circle"></div>
        <div className="loader-circle"></div>
      </div>
      {text && <p className="loader-text text-gradient">{text}</p>}
    </div>
  );
};

export default Loader;

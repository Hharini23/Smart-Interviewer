import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrainCircuit, LogOut, LogIn } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <BrainCircuit className="logo-icon" size={28} />
          <span className="logo-text text-gradient">SmartQA</span>
        </Link>
        <div className="navbar-links">
          {user ? (
            <div className="flex items-center gap-4 nav-user-profile">
              <div className="nav-avatar-logo">
                {user.name ? user.name.charAt(0).toUpperCase() : 'G'}
              </div>
              <span className="text-muted nav-greeting">Hi, {user.name.split(' ')[0]}</span>
            </div>
          ) : (
            <Link to="/login">
              <button className="nav-profile-btn pl-wide" style={{ width: 'auto', padding: '0 1rem', borderRadius: '8px' }}>
                <LogIn size={18} style={{ marginRight: '0.5rem' }} /> Login
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

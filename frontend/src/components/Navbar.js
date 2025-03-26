import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';

function Navbar() {
  const { user, logout } = useAuth();

  const onLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">AnyMP3</Link>
      </div>
      <div className="navbar-nav">
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <a href="#!" onClick={onLogout}>Logout</a>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
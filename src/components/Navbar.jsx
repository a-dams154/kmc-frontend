import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LogOut, UserPlus, LogIn, Settings,
  ChevronDown, Search, Bell, Menu, X, PlusCircle
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsDropdownOpen(false);
  };

  const userInitial = user?.email?.charAt(0).toUpperCase() || 'S';

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.profile-section')) {
        setIsDropdownOpen(false);
      }
      if (isMobileMenuOpen && !event.target.closest('.nav-links') && !event.target.closest('.menu-toggle')) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isDropdownOpen, isMobileMenuOpen]);

  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Programs', path: '#' },
    { name: 'Students', path: '#' },
    { name: 'Events', path: '#' },
    { name: 'Resources', path: '#' },
    { name: 'Add Score', path: '/add-score', private: true },
  ];

  return (
    <nav className="navbar">
      <div className="flex items-center">
        <button
          className="menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <Link to="/" className="nav-brand" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="brand-logo">UA</div>
          <div className="brand-text">
            <h1>University Arts</h1>
            <p>Program Dashboard</p>
          </div>
        </Link>

        <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          {navLinks.map((link) => (
            (!link.private || user) && (
              <Link
                key={link.name}
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            )
          ))}
        </div>
      </div>

      <div className="nav-actions">
        <div className="nav-search hidden lg:flex">
          <Search size={16} className="text-text-muted" />
          <input type="text" placeholder="Search..." />
        </div>

        <button className="nav-icon-btn hidden sm:flex">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>

        <div className="relative">
          {user ? (
            <>
              <div className="profile-section" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <div className="profile-avatar">
                  <img src={`https://ui-avatars.com/api/?name=${user.email.split('@')[0]}&background=e2e8f0&color=64748b`} alt="Avatar" />
                </div>
                <div className="profile-info hidden sm:flex">
                  <span className="name">{user.email.split('@')[0]}</span>
                  <span className="role">Administrator</span>
                </div>
                <ChevronDown size={14} className={`text-text-muted transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {isDropdownOpen && (
                <div className="dropdown-content nav-dropdown" style={{ display: 'block' }}>
                  <Link to="/register" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                    <UserPlus size={18} />
                    Create User
                  </Link>
                  <Link to="/admin" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                    <Settings size={18} />
                    Manage Scores
                  </Link>
                  <Link to="/add-score" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                    <PlusCircle size={18} />
                    Add Score
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item w-full text-left text-error">
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link to="/login" className="btn-primary">
              <LogIn size={18} />
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

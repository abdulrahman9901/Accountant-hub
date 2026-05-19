import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, LayoutDashboard, LogOut, User as UserIcon, Menu, X } from 'lucide-react';
import '../styles/Header.css';

interface HeaderProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  activeTab: 'jobs' | 'dashboard';
  setActiveTab: (tab: 'jobs' | 'dashboard') => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuth, activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="glass-dark site-header">
      {/* Decorative Grid Overlay */}
      <div className="site-header-grid" />

      <div className="container header-container">
        {/* Brand Logo */}
        <div className="brand-logo-container" onClick={() => setActiveTab('jobs')}>
          <div className="brand-logo-badge">AH</div>
          <span className="brand-logo-text">
            Accountant<span className="brand-logo-highlight">Hub</span>
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav desktop-only">
          <button 
            onClick={() => setActiveTab('jobs')}
            className="nav-link-btn"
            style={{ color: activeTab === 'jobs' ? 'var(--primary)' : '#ffffff' }}
          >
            <Briefcase size={16} />
            Browse Jobs
          </button>
          
          {user && (
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="nav-link-btn"
              style={{ color: activeTab === 'dashboard' ? 'var(--primary)' : '#ffffff' }}
            >
              <LayoutDashboard size={16} />
              My Bids
            </button>
          )}
        </nav>

        {/* User Auth controls */}
        <div className="desktop-auth-container desktop-only">
          {user ? (
            <div className="user-profile-badge">
              <div className="user-profile-info">
                <div className="user-icon-wrapper">
                  <UserIcon size={16} />
                </div>
                <span className="username-label">
                  {user.name}
                </span>
              </div>
              <button onClick={logout} className="btn-logout">
                <LogOut size={14} />
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-button-group">
              <button onClick={() => onOpenAuth('login')} className="btn-signin">
                Sign In
              </button>
              <button onClick={() => onOpenAuth('register')} className="btn-register">
                Register
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-only mobile-menu-trigger-btn"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="glass-dark mobile-drawer">
          <button 
            onClick={() => { setActiveTab('jobs'); setMobileMenuOpen(false); }}
            className="mobile-nav-link"
            style={{ color: activeTab === 'jobs' ? 'var(--primary)' : '#ffffff' }}
          >
            <Briefcase size={18} />
            Browse Jobs
          </button>
          
          {user && (
            <button 
              onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
              className="mobile-nav-link"
              style={{ color: activeTab === 'dashboard' ? 'var(--primary)' : '#ffffff' }}
            >
              <LayoutDashboard size={18} />
              My Bids
            </button>
          )}

          <div className="mobile-divider" />

          {user ? (
            <div className="mobile-user-profile">
              <div className="mobile-user-info">
                <UserIcon size={16} style={{ color: 'var(--primary)' }} />
                <span className="mobile-username">{user.name}</span>
              </div>
              <button 
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="mobile-btn-logout"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <div className="mobile-auth-group">
              <button 
                onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }}
                className="mobile-btn-signin"
              >
                Sign In
              </button>
              <button 
                onClick={() => { onOpenAuth('register'); setMobileMenuOpen(false); }}
                className="mobile-btn-register"
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

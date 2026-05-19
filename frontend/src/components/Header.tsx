import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, LayoutDashboard, LogOut, User as UserIcon, Menu, X } from 'lucide-react';

interface HeaderProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  activeTab: 'jobs' | 'dashboard';
  setActiveTab: (tab: 'jobs' | 'dashboard') => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuth, activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="glass-dark" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      color: '#ffffff',
      boxShadow: 'var(--shadow-md)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      {/* Decorative Grid Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '100%',
        zIndex: -1,
        backgroundImage: 'radial-gradient(rgba(1, 154, 81, 0.15) 1px, transparent 0)',
        backgroundSize: '16px 16px',
        opacity: 0.8
      }} />

      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setActiveTab('jobs')}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'var(--primary)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '1.25rem',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(1, 154, 81, 0.3)'
          }}>AH</div>
          <span style={{ fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
            Accountant<span style={{ color: 'var(--primary)' }}>Hub</span>
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="desktop-only">
          <button 
            onClick={() => setActiveTab('jobs')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: activeTab === 'jobs' ? 'var(--primary)' : '#ffffff',
              transition: 'var(--transition)',
              cursor: 'pointer'
            }}
          >
            <Briefcase size={16} />
            Browse Jobs
          </button>
          
          {user && (
            <button 
              onClick={() => setActiveTab('dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: activeTab === 'dashboard' ? 'var(--primary)' : '#ffffff',
                transition: 'var(--transition)',
                cursor: 'pointer'
              }}
            >
              <LayoutDashboard size={16} />
              My Bids
            </button>
          )}
        </nav>

        {/* User Auth controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} className="desktop-only">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)'
                }}>
                  <UserIcon size={16} />
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>
                  {user.name}
                </span>
              </div>
              <button 
                onClick={logout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'var(--transition)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                onClick={() => onOpenAuth('login')}
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '8px 16px',
                  transition: 'var(--transition)'
                }}
              >
                Sign In
              </button>
              <button 
                onClick={() => onOpenAuth('register')}
                style={{
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(1, 154, 81, 0.2)',
                  transition: 'var(--transition)'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
              >
                Register
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ display: 'none', cursor: 'pointer', color: '#ffffff' }} 
          className="mobile-only"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="glass-dark" style={{
          position: 'absolute',
          top: '72px',
          left: 0,
          right: 0,
          padding: '24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          zIndex: 99
        }}>
          <button 
            onClick={() => { setActiveTab('jobs'); setMobileMenuOpen(false); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: 600,
              fontSize: '1rem',
              color: activeTab === 'jobs' ? 'var(--primary)' : '#ffffff',
              textAlign: 'left'
            }}
          >
            <Briefcase size={18} />
            Browse Jobs
          </button>
          
          {user && (
            <button 
              onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: 600,
                fontSize: '1rem',
                color: activeTab === 'dashboard' ? 'var(--primary)' : '#ffffff',
                textAlign: 'left'
              }}
            >
              <LayoutDashboard size={18} />
              My Bids
            </button>
          )}

          <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />

          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserIcon size={16} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{user.name}</span>
              </div>
              <button 
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  width: '100%',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.15)'
                }}
              >
                Sign In
              </button>
              <button 
                onClick={() => { onOpenAuth('register'); setMobileMenuOpen(false); }}
                style={{
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(1, 154, 81, 0.2)'
                }}
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

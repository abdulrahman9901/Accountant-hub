import React, { useState } from 'react';
import { request, ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User as UserIcon } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Form input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  
  // Status and error states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setValidationErrors({});

    try {
      if (mode === 'login') {
        const response = await request<{ token: string; user: { id: number; name: string; email: string } }>('/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        login(response.data.token, response.data.user);
        onClose();
        resetForm();
      } else {
        // Register flow
        const response = await request<{ token: string; user: { id: number; name: string; email: string } }>('/register', {
          method: 'POST',
          body: JSON.stringify({
            name,
            email,
            password,
            password_confirmation: passwordConfirmation,
          }),
        });
        login(response.data.token, response.data.user);
        onClose();
        resetForm();
      }
    } catch (err) {
      const apiErr = err as ApiError;
      setErrorMessage(apiErr.message || 'Authentication failed. Please check your credentials.');
      if (apiErr.errors) {
        setValidationErrors(apiErr.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setPasswordConfirmation('');
    setErrorMessage(null);
    setValidationErrors({});
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: '20px'
    }}>
      <div className="glass" style={{
        width: '100%',
        maxWidth: '440px',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            transition: 'var(--transition)'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = 'var(--black)'}
          onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <X size={20} />
        </button>

        {/* Tab Header Selector */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          backgroundColor: '#fafbfc'
        }}>
          <button 
            onClick={() => { setMode('login'); resetForm(); }}
            style={{
              flex: 1,
              padding: '18px 0',
              fontWeight: 600,
              fontSize: '0.95rem',
              color: mode === 'login' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: mode === 'login' ? '2px solid var(--primary)' : 'none',
              cursor: 'pointer',
              textAlign: 'center',
              backgroundColor: mode === 'login' ? '#ffffff' : 'transparent'
            }}
          >
            Sign In
          </button>
          <button 
            onClick={() => { setMode('register'); resetForm(); }}
            style={{
              flex: 1,
              padding: '18px 0',
              fontWeight: 600,
              fontSize: '0.95rem',
              color: mode === 'register' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: mode === 'register' ? '2px solid var(--primary)' : 'none',
              cursor: 'pointer',
              textAlign: 'center',
              backgroundColor: mode === 'register' ? '#ffffff' : 'transparent'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '6px' }}>
              {mode === 'login' ? 'Welcome back' : 'Join Accountant Hub'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {mode === 'login' ? 'Access your dashboard and apply to jobs' : 'Browse listings and submit competitive bids'}
            </p>
          </div>

          {errorMessage && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              color: '#991b1b',
              fontSize: '0.85rem',
              fontWeight: 500
            }}>
              {errorMessage}
            </div>
          )}

          {/* Form Fields */}
          {mode === 'register' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                <input 
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 38px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    fontSize: '0.9rem',
                    transition: 'var(--transition)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              {validationErrors.name && (
                <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 500 }}>{validationErrors.name[0]}</span>
              )}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input 
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 38px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  fontSize: '0.9rem',
                  transition: 'var(--transition)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            {validationErrors.email && (
              <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 500 }}>{validationErrors.email[0]}</span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input 
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 38px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  fontSize: '0.9rem',
                  transition: 'var(--transition)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            {validationErrors.password && (
              <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 500 }}>{validationErrors.password[0]}</span>
            )}
          </div>

          {mode === 'register' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 38px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    fontSize: '0.9rem',
                    transition: 'var(--transition)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>
          )}

          {/* Submit Trigger Button */}
          <button 
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              padding: '14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'var(--transition)',
              boxShadow: '0 4px 12px rgba(1, 154, 81, 0.2)',
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseOver={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--primary-hover)'; }}
            onMouseOut={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--primary)'; }}
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { request, type ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock } from 'lucide-react';
import '../styles/AuthModals.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSwitchToRegister }) => {
  const { login } = useAuth();
  
  // Transition closing states - adjusted during render to avoid cascading effect lints
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [render, setRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  // Form input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Status and error states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setRender(true);
      setIsClosing(false);
    } else {
      setIsClosing(true);
    }
  }

  useEffect(() => {
    if (isClosing) {
      const timer = setTimeout(() => {
        setRender(false);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isClosing]);

  if (!render) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setValidationErrors({});

    try {
      const response = await request<{ token: string; user: { id: number; name: string; email: string } }>('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      login(response.data.token, response.data.user);
      onClose();
      resetForm();
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
    setEmail('');
    setPassword('');
    setErrorMessage(null);
    setValidationErrors({});
  };

  return (
    <div className={`auth-backdrop ${isClosing ? 'is-closing' : ''}`}>
      {/* Backdrop click close */}
      <div onClick={onClose} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, cursor: 'pointer' }} />

      <div className={`glass auth-modal-card ${isClosing ? 'is-closing' : ''}`}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="auth-modal-close-btn"
        >
          <X size={20} />
        </button>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div>
            <h2 className="auth-title">
              Welcome back
            </h2>
            <p className="auth-subtitle">
              Access your dashboard and apply to accounting postings.
            </p>
          </div>

          {errorMessage && (
            <div className="auth-error-banner">
              {errorMessage}
            </div>
          )}

          {/* Email Field */}
          <div className="auth-field-group">
            <label className="auth-input-label">Email Address</label>
            <div className="auth-input-relative">
              <input 
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input-field"
              />
              <Mail size={16} className="auth-input-icon" />
            </div>
            {validationErrors.email && (
              <span className="auth-validation-error">{validationErrors.email[0]}</span>
            )}
          </div>

          {/* Password Field */}
          <div className="auth-field-group">
            <label className="auth-input-label">Password</label>
            <div className="auth-input-relative">
              <input 
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input-field"
              />
              <Lock size={16} className="auth-input-icon" />
            </div>
            {validationErrors.password && (
              <span className="auth-validation-error">{validationErrors.password[0]}</span>
            )}
          </div>

          {/* Submit Trigger Button */}
          <button 
            type="submit"
            disabled={loading}
            className="btn-auth-submit"
          >
            {loading ? 'Processing...' : 'Sign In'}
          </button>
        </form>

        {/* Modal Footer Link */}
        <div className="auth-footer">
          Don't have an account?{' '}
          <button 
            onClick={() => { resetForm(); onSwitchToRegister(); }}
            className="auth-footer-link-btn"
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;

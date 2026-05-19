import React, { useState } from 'react';
import { request, type ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User as UserIcon } from 'lucide-react';
import './AuthModals.css';



interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const { login } = useAuth();
  
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
    } catch (err) {
      const apiErr = err as ApiError;
      setErrorMessage(apiErr.message || 'Registration failed. Please check validation errors.');
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
    <div className="auth-backdrop">
      <div className="glass auth-modal-card">
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
              Create Account
            </h2>
            <p className="auth-subtitle">
              Join Accountant Hub to browse and submit bids on active postings.
            </p>
          </div>

          {errorMessage && (
            <div className="auth-error-banner">
              {errorMessage}
            </div>
          )}

          {/* Full Name Field */}
          <div className="auth-field-group">
            <label className="auth-input-label">Full Name</label>
            <div className="auth-input-relative">
              <input 
                type="text"
                required
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="auth-input-field"
              />
              <UserIcon size={16} className="auth-input-icon" />
            </div>
            {validationErrors.name && (
              <span className="auth-validation-error">{validationErrors.name[0]}</span>
            )}
          </div>

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

          {/* Confirm Password Field */}
          <div className="auth-field-group">
            <label className="auth-input-label">Confirm Password</label>
            <div className="auth-input-relative">
              <input 
                type="password"
                required
                placeholder="••••••••"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="auth-input-field"
              />
              <Lock size={16} className="auth-input-icon" />
            </div>
          </div>

          {/* Submit Trigger Button */}
          <button 
            type="submit"
            disabled={loading}
            className="btn-auth-submit"
          >
            {loading ? 'Processing...' : 'Create Account'}
          </button>
        </form>

        {/* Modal Footer Link */}
        <div className="auth-footer">
          Already have an account?{' '}
          <button 
            onClick={() => { resetForm(); onSwitchToLogin(); }}
            className="auth-footer-link-btn"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

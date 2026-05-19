import React, { useState, useEffect } from 'react';
import type { Job, Bid } from '../types';
import { request, type ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { X, DollarSign, Calendar, Paperclip, CheckCircle } from 'lucide-react';
import './JobDetails.css';

interface JobDetailsProps {
  job: Job | null;
  onClose: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onBidSuccess: () => void;
}

export const JobDetails: React.FC<JobDetailsProps> = ({ job, onClose, onOpenAuth, onBidSuccess }) => {
  const { token } = useAuth();
  
  // Form input states
  const [price, setPrice] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [experienceSummary, setExperienceSummary] = useState('');

  // Status states
  const [submitting, setSubmitting] = useState(false);
  const [alreadyBid, setAlreadyBid] = useState(false);
  const [success, setSuccess] = useState(false);

  // Errors parsing
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // Check if user already bid on this job
  useEffect(() => {
    let active = true;

    if (!job || !token) {
      return;
    }

    const checkExistingBids = async () => {
      try {
        const response = await request<Bid[]>('/user/bids');
        if (active) {
          const match = response.data.some((bid) => bid.job_id === job.id);
          setAlreadyBid(match);
        }
      } catch (err) {
        console.error('Failed checking existing bids', err);
      }
    };

    checkExistingBids();

    return () => {
      active = false;
    };
  }, [job, token, success]);

  if (!job) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    setValidationErrors({});

    try {
      await request<Bid>(`/jobs/${job.id}/bids`, {
        method: 'POST',
        body: JSON.stringify({
          proposed_price: parseFloat(price),
          estimated_delivery_days: parseInt(deliveryDays, 10),
          cover_letter: coverLetter,
          experience_summary: experienceSummary
        })
      });

      setSuccess(true);
      onBidSuccess();
    } catch (err) {
      const apiErr = err as ApiError;
      setErrorMessage(apiErr.message || 'Failed to submit proposal. Please review errors below.');
      if (apiErr.errors) {
        setValidationErrors(apiErr.errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Format budget range
  const formatBudget = () => {
    const min = parseFloat(job.budget_min.toString()).toLocaleString();
    const max = parseFloat(job.budget_max.toString()).toLocaleString();
    return `$${min} - $${max}`;
  };

  // Format date helper
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="details-backdrop">
      {/* Backdrop click close */}
      <div onClick={onClose} style={{ flex: 1, cursor: 'pointer' }} />

      {/* Details Slide Drawer */}
      <div className="glass details-drawer">
        {/* Drawer Header */}
        <div className="details-drawer-header">
          <div className="details-drawer-badges">
            <span className="badge badge-primary">{job.category?.name}</span>
            <span className="badge badge-dark">
              {job.status === 'open' ? 'Open' : 'Closed'}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="details-drawer-close-btn"
          >
            <X size={22} />
          </button>
        </div>

        {/* Scrollable content area */}
        <div className="details-drawer-content">
          {/* Job Overview */}
          <div className="details-job-header">
            <span className="details-job-company">
              {job.company_name}
            </span>
            <h2 className="details-job-title">
              {job.title}
            </h2>
          </div>

          {/* Job Meta details grid */}
          <div className="details-meta-grid">
            <div>
              <span className="details-meta-title">Est. Budget</span>
              <span className="details-meta-budget">
                <DollarSign size={16} />
                {formatBudget()}
              </span>
            </div>
            <div>
              <span className="details-meta-title">Deadline</span>
              <span className="details-meta-value">
                <Calendar size={16} />
                {formatDate(job.deadline)}
              </span>
            </div>
            <div>
              <span className="details-meta-title">Category Skills</span>
              <span className="details-meta-value" style={{ fontSize: '0.85rem' }}>
                {job.category?.name} Core
              </span>
            </div>
            <div>
              <span className="details-meta-title">Active Proposals</span>
              <span className="details-meta-value">
                {job.bids_count} submissions
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="details-section-title">Job Description</h4>
            <p className="details-section-text">
              {job.description}
            </p>
          </div>

          {/* Attachments Placeholders */}
          <div>
            <h4 className="details-section-title">Attachments</h4>
            <div className="details-attachments-empty">
              <Paperclip size={16} />
              No attachments provided by the client.
            </div>
          </div>

          {/* Proposal / Bid workflow */}
          <div className="details-proposal-section">
            {!token ? (
              /* User Guest Block */
              <div className="details-guest-card">
                <h4 className="details-guest-title">Interested in this project?</h4>
                <p className="details-guest-text">
                  Please log in or register as an accountant to submit a proposal for this job.
                </p>
                <button 
                  onClick={() => onOpenAuth('login')}
                  className="btn-details-guest-auth"
                >
                  Sign In to Bid
                </button>
              </div>
            ) : success ? (
              /* Success Toast Checkmark Alert */
              <div className="details-success-card">
                <CheckCircle size={44} style={{ strokeWidth: 2.5 }} />
                <h4 className="details-success-title">Proposal Submitted!</h4>
                <p className="details-success-text">
                  Your bid has been processed successfully. You can track this bid's status in your Bids Dashboard.
                </p>
              </div>
            ) : alreadyBid ? (
              /* Already Bid Block */
              <div className="details-locked-card">
                <h4 className="details-locked-title">Submission Locked</h4>
                <p className="details-locked-text">
                  You have already submitted a bid for this job.
                </p>
              </div>
            ) : job.status !== 'open' ? (
              /* Job Closed Block */
              <div className="details-closed-card">
                <p className="details-closed-text">
                  This job has been closed and is no longer accepting new bids.
                </p>
              </div>
            ) : (
              /* Proposal Submit Form */
              <form onSubmit={handleSubmit} className="details-proposal-form">
                <h3 className="details-form-title">Submit Professional Proposal</h3>

                {errorMessage && (
                  <div className="auth-error-banner" style={{ margin: 0 }}>
                    {errorMessage}
                  </div>
                )}

                <div className="details-form-grid">
                  <div className="details-form-group">
                    <label className="details-form-label">Proposed Price ($)</label>
                    <input 
                      type="number"
                      required
                      placeholder="e.g. 500"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="details-form-input"
                    />
                    {validationErrors.proposed_price && (
                      <span className="auth-validation-error">{validationErrors.proposed_price[0]}</span>
                    )}
                  </div>

                  <div className="details-form-group">
                    <label className="details-form-label">Est. Delivery (Days)</label>
                    <input 
                      type="number"
                      required
                      placeholder="e.g. 10"
                      value={deliveryDays}
                      onChange={(e) => setDeliveryDays(e.target.value)}
                      className="details-form-input"
                    />
                    {validationErrors.estimated_delivery_days && (
                      <span className="auth-validation-error">{validationErrors.estimated_delivery_days[0]}</span>
                    )}
                  </div>
                </div>

                <div className="details-form-group">
                  <label className="details-form-label">Cover Letter</label>
                  <textarea 
                    required
                    placeholder="Describe your plan to solve this client's request..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="details-form-textarea"
                    style={{ minHeight: '100px' }}
                  />
                  {validationErrors.cover_letter && (
                    <span className="auth-validation-error">{validationErrors.cover_letter[0]}</span>
                  )}
                </div>

                <div className="details-form-group">
                  <label className="details-form-label">Experience Summary</label>
                  <textarea 
                    required
                    placeholder="Summarize your credentials (e.g. CPA license, previous filings)..."
                    value={experienceSummary}
                    onChange={(e) => setExperienceSummary(e.target.value)}
                    className="details-form-textarea"
                  />
                  {validationErrors.experience_summary && (
                    <span className="auth-validation-error">{validationErrors.experience_summary[0]}</span>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  className="btn-details-submit"
                >
                  {submitting ? 'Submitting Bid...' : 'Submit Proposal'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

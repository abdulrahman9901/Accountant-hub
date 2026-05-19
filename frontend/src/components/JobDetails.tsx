import React, { useState, useEffect } from 'react';
import type { Job, Bid } from '../types';
import { request, type ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { X, DollarSign, Calendar, Paperclip, CheckCircle } from 'lucide-react';
import '../styles/JobDetails.css';

interface JobDetailsProps {
  job: Job | null;
  onClose: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onBidSuccess: () => void;
}

export const JobDetails: React.FC<JobDetailsProps> = ({ job, onClose, onOpenAuth, onBidSuccess }) => {
  const { token } = useAuth();

  // Transition closing states - adjusted during render to avoid cascading effect lints
  const [prevJob, setPrevJob] = useState<Job | null>(job);
  const [renderJob, setRenderJob] = useState<Job | null>(job);
  const [isClosing, setIsClosing] = useState(false);

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

  if (job !== prevJob) {
    setPrevJob(job);
    if (job) {
      setRenderJob(job);
      setIsClosing(false);
      // Reset input form states when a new job is selected
      setPrice('');
      setDeliveryDays('');
      setCoverLetter('');
      setExperienceSummary('');
      setSuccess(false);
      setErrorMessage(null);
    } else {
      setIsClosing(true);
    }
  }

  useEffect(() => {
    if (isClosing) {
      const timer = setTimeout(() => {
        setRenderJob(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isClosing]);

  // Check if user already bid on this job
  useEffect(() => {
    let active = true;

    if (!renderJob || !token) {
      return;
    }

    const checkExistingBids = async () => {
      try {
        const response = await request<Bid[]>('/user/bids');
        if (active) {
          const match = response.data.some((bid) => bid.job_id === renderJob.id);
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
  }, [renderJob, token, success]);

  if (!renderJob) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      await request<Bid>(`/jobs/${renderJob.id}/bids`, {
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
    } finally {
      setSubmitting(false);
    }
  };

  // Format budget range
  const formatBudget = () => {
    if (!renderJob) return '';
    const min = parseFloat(renderJob.budget_min.toString()).toLocaleString();
    const max = parseFloat(renderJob.budget_max.toString()).toLocaleString();
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
    <div className={`details-backdrop ${isClosing ? 'is-closing' : ''}`}>
      {/* Backdrop click close */}
      <div onClick={onClose} style={{ flex: 1, cursor: 'pointer' }} />

      {/* Details Slide Drawer */}
      <div className={`glass details-drawer ${isClosing ? 'is-closing' : ''}`}>
        {/* Drawer Header */}
        <div className="details-drawer-header">
          <div className="details-drawer-badges">
            <span className="badge badge-primary">{renderJob.category?.name}</span>
            <span className="badge badge-dark">
              {renderJob.status === 'open' ? 'Open' : 'Closed'}
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
              {renderJob.company_name}
            </span>
            <h2 className="details-job-title">
              {renderJob.title}
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
                {formatDate(renderJob.deadline)}
              </span>
            </div>
            <div>
              <span className="details-meta-title">Category Skills</span>
              <span className="details-meta-value" style={{ fontSize: '0.85rem' }}>
                {renderJob.category?.name} Core
              </span>
            </div>
            <div>
              <span className="details-meta-title">Active Proposals</span>
              <span className="details-meta-value">
                {renderJob.bids_count} submissions
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="details-section-title">Job Description</h4>
            <p className="details-section-text">
              {renderJob.description}
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
            ) : renderJob.status !== 'open' ? (
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
                  </div>
                  <div className="details-form-group">
                    <label className="details-form-label">Est. Delivery (Days)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 5"
                      value={deliveryDays}
                      onChange={(e) => setDeliveryDays(e.target.value)}
                      className="details-form-input"
                    />
                  </div>
                </div>

                <div className="details-form-group">
                  <label className="details-form-label">Cover Letter</label>
                  <textarea
                    required
                    placeholder="Describe how you can help this client with their accounting needs..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="details-form-textarea"
                  />
                </div>

                <div className="details-form-group">
                  <label className="details-form-label">Relevant Experience Summary</label>
                  <textarea
                    required
                    placeholder="Summarize your credentials, certifications, or past projects..."
                    value={experienceSummary}
                    onChange={(e) => setExperienceSummary(e.target.value)}
                    className="details-form-textarea"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-details-submit"
                >
                  {submitting ? 'Submitting Proposal...' : 'Submit Proposal'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;

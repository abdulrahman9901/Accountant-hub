import React, { useState, useEffect } from 'react';
import type { Job, Bid } from '../types';
import { request, type ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { X, DollarSign, Calendar, Paperclip, CheckCircle } from 'lucide-react';

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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      zIndex: 150,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      {/* Backdrop click close */}
      <div onClick={onClose} style={{ flex: 1, cursor: 'pointer' }} />

      {/* Details Slide Drawer */}
      <div className="glass" style={{
        width: '100%',
        maxWidth: '520px',
        backgroundColor: '#ffffff',
        height: '100%',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* Drawer Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: '#fafbfc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-primary">{job.category?.name}</span>
            <span className="badge badge-dark">
              {job.status === 'open' ? 'Open' : 'Closed'}
            </span>
          </div>
          <button 
            onClick={onClose}
            style={{
              cursor: 'pointer',
              color: 'var(--text-muted)',
              transition: 'var(--transition)',
              border: 'none',
              background: 'none',
              padding: 0
            }}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--black)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <X size={22} />
          </button>
        </div>

        {/* Scrollable content area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '28px'
        }}>
          {/* Job Overview */}
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              {job.company_name}
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {job.title}
            </h2>
          </div>

          {/* Job Meta details grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            backgroundColor: 'var(--light-bg)',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Est. Budget
              </span>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <DollarSign size={16} />
                {formatBudget()}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Deadline
              </span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={16} />
                {formatDate(job.deadline)}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Category Skills
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {job.category?.name} Core
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Active Proposals
              </span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                {job.bids_count} submissions
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Job Description
            </h4>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {job.description}
            </p>
          </div>

          {/* Attachments Placeholders */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Attachments
            </h4>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px dashed var(--border)',
              padding: '14px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              fontSize: '0.85rem'
            }}>
              <Paperclip size={16} />
              No attachments provided by the client.
            </div>
          </div>

          {/* Proposal / Bid workflow */}
          <div style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '28px',
            marginTop: '12px'
          }}>
            {!token ? (
              /* User Guest Block */
              <div style={{
                backgroundColor: 'var(--light-bg)',
                border: '1px solid var(--border)',
                padding: '24px',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>Interested in this project?</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Please log in or register as an accountant to submit a proposal for this job.
                </p>
                <button 
                  onClick={() => onOpenAuth('login')}
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(1, 154, 81, 0.2)',
                    transition: 'var(--transition)',
                    border: 'none'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
                >
                  Sign In to Bid
                </button>
              </div>
            ) : success ? (
              /* Success Toast Checkmark Alert */
              <div style={{
                backgroundColor: 'var(--primary-light)',
                border: '1px solid rgba(1, 154, 81, 0.2)',
                padding: '24px',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                color: 'var(--primary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                <CheckCircle size={44} style={{ strokeWidth: 2.5 }} />
                <h4 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Proposal Submitted!</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Your bid has been processed successfully. You can track this bid's status in your Bids Dashboard.
                </p>
              </div>
            ) : alreadyBid ? (
              /* Already Bid Block */
              <div style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fef3c7',
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                color: '#b45309',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Submission Locked</h4>
                <p style={{ fontSize: '0.85rem', color: '#78350f' }}>
                  You have already submitted a bid for this job.
                </p>
              </div>
            ) : job.status !== 'open' ? (
              /* Job Closed Block */
              <div style={{
                backgroundColor: 'rgba(0,0,0,0.06)',
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                color: 'var(--black)'
              }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  This job has been closed and is no longer accepting new bids.
                </p>
              </div>
            ) : (
              /* Proposal Submit Form */
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                  Submit Professional Proposal
                </h3>

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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Proposed Price ($)</label>
                    <input 
                      type="number"
                      required
                      placeholder="e.g. 500"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)',
                        fontSize: '0.85rem'
                      }}
                    />
                    {validationErrors.proposed_price && (
                      <span style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 500 }}>{validationErrors.proposed_price[0]}</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Est. Delivery (Days)</label>
                    <input 
                      type="number"
                      required
                      placeholder="e.g. 10"
                      value={deliveryDays}
                      onChange={(e) => setDeliveryDays(e.target.value)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)',
                        fontSize: '0.85rem'
                      }}
                    />
                    {validationErrors.estimated_delivery_days && (
                      <span style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 500 }}>{validationErrors.estimated_delivery_days[0]}</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Cover Letter</label>
                  <textarea 
                    required
                    placeholder="Describe your plan to solve this client's request..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      fontSize: '0.85rem',
                      minHeight: '100px',
                      resize: 'vertical'
                    }}
                  />
                  {validationErrors.cover_letter && (
                    <span style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 500 }}>{validationErrors.cover_letter[0]}</span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Experience Summary</label>
                  <textarea 
                    required
                    placeholder="Summarize your credentials (e.g. CPA license, previous filings)..."
                    value={experienceSummary}
                    onChange={(e) => setExperienceSummary(e.target.value)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      fontSize: '0.85rem',
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                  />
                  {validationErrors.experience_summary && (
                    <span style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 500 }}>{validationErrors.experience_summary[0]}</span>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    boxShadow: '0 4px 12px rgba(1, 154, 81, 0.2)',
                    marginTop: '8px',
                    textAlign: 'center',
                    border: 'none'
                  }}
                  onMouseOver={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = 'var(--primary-hover)'; }}
                  onMouseOut={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = 'var(--primary)'; }}
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

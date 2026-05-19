import React, { useEffect, useState } from 'react';
import type { Bid } from '../types';
import { request } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { FileText, DollarSign, Calendar, Clock, RefreshCw } from 'lucide-react';

interface BidDashboardProps {
  onSelectJobId: (jobId: number) => void;
}

export const BidDashboard: React.FC<BidDashboardProps> = ({ onSelectJobId }) => {
  const { token } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBids = async () => {
    setLoading(true);
    try {
      const response = await request<Bid[]>('/user/bids');
      setBids(response.data);
    } catch (err) {
      console.error('Failed to load user proposals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const loadBids = async () => {
      if (!token) {
        if (active) setLoading(false);
        return;
      }
      try {
        if (active) setLoading(true);
        const response = await request<Bid[]>('/user/bids');
        if (active) setBids(response.data);
      } catch (err) {
        console.error('Failed to load user proposals', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadBids();

    return () => {
      active = false;
    };
  }, [token]);

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'approved') {
      return (
        <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
          Approved
        </span>
      );
    } else if (s === 'rejected') {
      return (
        <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
          Rejected
        </span>
      );
    }
    return (
      <span className="badge" style={{ backgroundColor: '#fffbeb', color: '#b45309' }}>
        Pending
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', width: '100%' }}>
        <RefreshCw className="animate-spin" size={24} style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Title block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>My Submitted Proposals</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Track and monitor the status of all bids submitted to clients.
          </p>
        </div>
        <button 
          onClick={fetchBids}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {bids.length === 0 ? (
        /* Empty proposals fallback */
        <div className="glass" style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '60px 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileText size={28} />
          </div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>No Proposals Yet</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '360px', margin: '0 auto' }}>
              You haven't bid on any jobs yet. Visit the job board listings to submit your competitive offers!
            </p>
          </div>
        </div>
      ) : (
        /* List proposals */
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '16px'
        }}>
          {bids.map((bid) => {
            const hasJob = !!bid.job;
            return (
              <div 
                key={bid.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px 24px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                  transition: 'var(--transition)'
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '240px' }}>
                  {hasJob ? (
                    <button 
                      onClick={() => onSelectJobId(bid.job_id)}
                      style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: 'var(--black)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        letterSpacing: '-0.01em',
                        transition: 'var(--transition)',
                        background: 'none',
                        border: 'none',
                        padding: 0
                      }}
                      onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
                      onMouseOut={(e) => e.currentTarget.style.color = 'var(--black)'}
                    >
                      {bid.job?.title}
                    </button>
                  ) : (
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--black)' }}>
                      Deleted Job Listing
                    </span>
                  )}
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    Client: {bid.job?.company_name || 'Anonymous'}
                  </span>
                </div>

                {/* Parameters */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Proposed Offer
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
                      <DollarSign size={14} />
                      {parseFloat(bid.proposed_price.toString()).toLocaleString()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Delivery
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} />
                      {bid.estimated_delivery_days} {bid.estimated_delivery_days === 1 ? 'Day' : 'Days'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Submitted
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                      <Clock size={12} />
                      {formatDate(bid.created_at)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Bid Status
                    </span>
                    {getStatusBadge(bid.status)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import type { Bid } from '../types';
import { request } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { FileText, DollarSign, Calendar, Clock, RefreshCw } from 'lucide-react';
import './BidDashboard.css';

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
    <div className="dashboard-container">
      {/* Title block */}
      <div className="dashboard-header">
        <div className="dashboard-title-wrap">
          <h2>My Submitted Proposals</h2>
          <p>Track and monitor the status of all bids submitted to clients.</p>
        </div>
        <button 
          onClick={fetchBids}
          className="btn-dashboard-refresh"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {bids.length === 0 ? (
        /* Empty proposals fallback */
        <div className="glass dashboard-empty-card">
          <div className="dashboard-empty-icon-wrap">
            <FileText size={28} />
          </div>
          <div>
            <h3 className="dashboard-empty-title">No Proposals Yet</h3>
            <p className="dashboard-empty-text">
              You haven't bid on any jobs yet. Visit the job board listings to submit your competitive offers!
            </p>
          </div>
        </div>
      ) : (
        /* List proposals */
        <div className="dashboard-list-grid">
          {bids.map((bid) => {
            const hasJob = !!bid.job;
            return (
              <div 
                key={bid.id}
                className="dashboard-bid-card"
              >
                <div className="dashboard-bid-info">
                  {hasJob ? (
                    <button 
                      onClick={() => onSelectJobId(bid.job_id)}
                      className="btn-dashboard-job-link"
                    >
                      {bid.job?.title}
                    </button>
                  ) : (
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--black)' }}>
                      Deleted Job Listing
                    </span>
                  )}
                  <span className="dashboard-bid-client">
                    Client: {bid.job?.company_name || 'Anonymous'}
                  </span>
                </div>

                {/* Parameters */}
                <div className="dashboard-bid-params">
                  <div className="dashboard-param-block">
                    <span className="dashboard-param-label">Proposed Offer</span>
                    <span className="dashboard-param-value-budget">
                      <DollarSign size={14} />
                      {parseFloat(bid.proposed_price.toString()).toLocaleString()}
                    </span>
                  </div>

                  <div className="dashboard-param-block">
                    <span className="dashboard-param-label">Delivery</span>
                    <span className="dashboard-param-value">
                      <Calendar size={14} />
                      {bid.estimated_delivery_days} {bid.estimated_delivery_days === 1 ? 'Day' : 'Days'}
                    </span>
                  </div>

                  <div className="dashboard-param-block">
                    <span className="dashboard-param-label">Submitted</span>
                    <span className="dashboard-param-value-date">
                      <Clock size={12} />
                      {formatDate(bid.created_at)}
                    </span>
                  </div>

                  <div className="dashboard-param-block">
                    <span className="dashboard-param-label">Bid Status</span>
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

import React from 'react';
import { Job } from '../types';
import { Briefcase, Calendar, DollarSign, MessageSquare, Clock } from 'lucide-react';

interface JobCardProps {
  job: Job;
  onClick: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onClick }) => {
  const isOpen = job.status === 'open';

  // Format budget representation
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
    <article 
      onClick={onClick}
      style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '24px',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-sm)',
        transition: 'var(--transition)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        position: 'relative',
        overflow: 'hidden'
      }}
      className="job-card-hover"
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.borderColor = 'var(--primary)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      {/* Dynamic left color ribbon */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '5px',
        backgroundColor: isOpen ? 'var(--primary)' : 'var(--black)'
      }} />

      {/* Header section (Company, Title, Status badge) */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            {job.company_name}
          </span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--black)', letterSpacing: '-0.02em' }}>
            {job.title}
          </h3>
        </div>
        <span 
          className={`badge ${isOpen ? 'badge-primary' : 'badge-dark'}`}
          style={{
            backgroundColor: isOpen ? 'var(--primary-light)' : 'rgba(0,0,0,0.06)',
            color: isOpen ? 'var(--primary)' : 'var(--black)',
            fontWeight: 700,
            flexShrink: 0
          }}
        >
          {isOpen ? 'Open' : 'Closed'}
        </span>
      </div>

      {/* Short description */}
      <p style={{
        fontSize: '0.9rem',
        color: 'var(--text-muted)',
        lineHeight: 1.6,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {job.description}
      </p>

      {/* Tags section */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {job.category && (
          <span className="badge badge-dark" style={{ textTransform: 'capitalize' }}>
            <Briefcase size={12} />
            {job.category.name}
          </span>
        )}
        <span className="badge badge-dark">
          <DollarSign size={12} />
          {formatBudget()}
        </span>
        <span className="badge badge-dark">
          <MessageSquare size={12} />
          {job.bids_count} {job.bids_count === 1 ? 'Bid' : 'Bids'}
        </span>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: 'var(--border)' }} />

      {/* Footer Meta: Deadline and Posted date */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        fontWeight: 500
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={14} style={{ color: 'var(--primary)' }} />
          Deadline: {formatDate(job.deadline)}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={14} />
          Posted: {formatDate(job.posted_date)}
        </span>
      </div>
    </article>
  );
};

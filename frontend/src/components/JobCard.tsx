import React from 'react';
import type { Job } from '../types';
import { Briefcase, Calendar, DollarSign, MessageSquare, Clock } from 'lucide-react';
import '../styles/Jobs.css';

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
      className="job-card"
    >
      {/* Dynamic left color ribbon */}
      <div className={`job-card-ribbon ${isOpen ? 'job-card-ribbon-open' : 'job-card-ribbon-closed'}`} />

      {/* Header section (Company, Title, Status badge) */}
      <div className="job-card-header">
        <div>
          <span className="job-card-company">
            {job.company_name}
          </span>
          <h3 className="job-card-title">
            {job.title}
          </h3>
        </div>
        <span className={`badge job-card-badge ${isOpen ? 'job-card-badge-open' : 'job-card-badge-closed'}`}>
          {isOpen ? 'Open' : 'Closed'}
        </span>
      </div>

      {/* Short description */}
      <p className="job-card-description">
        {job.description}
      </p>

      {/* Tags section */}
      <div className="job-card-tags">
        {job.category && (
          <span className="badge badge-dark job-card-tag-badge">
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
      <div className="job-card-divider" />

      {/* Footer Meta: Deadline and Posted date */}
      <div className="job-card-footer">
        <span className="job-card-footer-item">
          <Calendar size={14} className="job-card-footer-icon" />
          Deadline: {formatDate(job.deadline)}
        </span>
        <span className="job-card-footer-item">
          <Clock size={14} />
          Posted: {formatDate(job.posted_date)}
        </span>
      </div>
    </article>
  );
};

import React from 'react';
import { FilterState } from './FilterSidebar';
import { X } from 'lucide-react';

interface ActiveFiltersProps {
  filters: FilterState;
  onClearFilter: (key: keyof FilterState) => void;
  onClearAll: () => void;
}

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({ filters, onClearFilter, onClearAll }) => {
  const hasActiveFilters = 
    filters.search || 
    filters.category || 
    filters.min_budget || 
    filters.max_budget;

  if (!hasActiveFilters) return null;

  return (
    <div className="glass" style={{
      padding: '12px 24px',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px',
      backgroundColor: '#ffffff',
      marginTop: '-24px',
      marginBottom: '24px',
      zIndex: 10,
      position: 'relative'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Active:
        </span>

        {/* 1. Keyword search chip */}
        {filters.search && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            padding: '4px 8px 4px 10px',
            borderRadius: '4px',
            fontSize: '0.8rem',
            fontWeight: 600
          }}>
            Search: "{filters.search}"
            <button 
              onClick={() => onClearFilter('search')}
              style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'var(--primary)' }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* 2. Category chip */}
        {filters.category && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            padding: '4px 8px 4px 10px',
            borderRadius: '4px',
            fontSize: '0.8rem',
            fontWeight: 600,
            textTransform: 'capitalize'
          }}>
            Category: {filters.category.replace('-', ' ')}
            <button 
              onClick={() => onClearFilter('category')}
              style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'var(--primary)' }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* 3. Min budget chip */}
        {filters.min_budget && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            padding: '4px 8px 4px 10px',
            borderRadius: '4px',
            fontSize: '0.8rem',
            fontWeight: 600
          }}>
            Min: ${filters.min_budget}
            <button 
              onClick={() => onClearFilter('min_budget')}
              style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'var(--primary)' }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* 4. Max budget chip */}
        {filters.max_budget && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            padding: '4px 8px 4px 10px',
            borderRadius: '4px',
            fontSize: '0.8rem',
            fontWeight: 600
          }}>
            Max: ${filters.max_budget}
            <button 
              onClick={() => onClearFilter('max_budget')}
              style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'var(--primary)' }}
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Clear Trigger */}
      <button 
        onClick={onClearAll}
        style={{
          fontSize: '0.8rem',
          fontWeight: 700,
          color: 'var(--primary)',
          cursor: 'pointer'
        }}
      >
        Clear All
      </button>
    </div>
  );
};

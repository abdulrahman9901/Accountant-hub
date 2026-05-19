import React from 'react';
import type { FilterState } from './FilterSidebar';
import { X } from 'lucide-react';
import '../styles/ActiveFilters.css';

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
    <div className="glass active-filters-container">
      <div className="active-filters-list">
        <span className="active-filters-title">
          Active:
        </span>

        {/* 1. Keyword search chip */}
        {filters.search && (
          <div className="active-filter-chip">
            Search: "{filters.search}"
            <button
              onClick={() => onClearFilter('search')}
              className="chip-dismiss-btn"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* 2. Category chip */}
        {filters.category && (
          <div className="active-filter-chip" style={{ textTransform: 'capitalize' }}>
            Category: {filters.category.replace('-', ' ')}
            <button
              onClick={() => onClearFilter('category')}
              className="chip-dismiss-btn"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* 3. Min budget chip */}
        {filters.min_budget && (
          <div className="active-filter-chip">
            Min: ${filters.min_budget}
            <button
              onClick={() => onClearFilter('min_budget')}
              className="chip-dismiss-btn"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* 4. Max budget chip */}
        {filters.max_budget && (
          <div className="active-filter-chip">
            Max: ${filters.max_budget}
            <button
              onClick={() => onClearFilter('max_budget')}
              className="chip-dismiss-btn"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Clear Trigger */}
      <button
        onClick={onClearAll}
        className="active-filters-clear-btn"
      >
        Clear All
      </button>
    </div>
  );
};

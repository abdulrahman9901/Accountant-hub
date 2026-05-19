import React, { useEffect, useState } from 'react';
import { request } from '../api/client';
import type { Category } from '../types';
import { Search, Sliders, ChevronDown } from 'lucide-react';
import '../styles/FilterSidebar.css';


export interface FilterState {
  search: string;
  category: string;
  min_budget: string;
  max_budget: string;
  sort_by: string;
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, onChange }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchVal, setSearchVal] = useState(filters.search);
  const [minVal, setMinVal] = useState(filters.min_budget);
  const [maxVal, setMaxVal] = useState(filters.max_budget);

  // Load categories for filter listing
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const response = await request<Category[]>('/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCats();
  }, []);

  // Sync internal states when parent state is modified (e.g. active chips cleared or reset) using standard render-time adjustments
  const [prevSearch, setPrevSearch] = useState(filters.search);
  if (filters.search !== prevSearch) {
    setPrevSearch(filters.search);
    setSearchVal(filters.search);
  }

  const [prevMin, setPrevMin] = useState(filters.min_budget);
  if (filters.min_budget !== prevMin) {
    setPrevMin(filters.min_budget);
    setMinVal(filters.min_budget);
  }

  const [prevMax, setPrevMax] = useState(filters.max_budget);
  if (filters.max_budget !== prevMax) {
    setPrevMax(filters.max_budget);
    setMaxVal(filters.max_budget);
  }

  // Keep a mutable ref of the parent filters to bypass debouncing dependency race conditions
  const filtersRef = React.useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Debounce search input changes
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchVal !== filtersRef.current.search) {
        onChange({ ...filtersRef.current, search: searchVal });
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchVal, onChange]);

  // Debounce min budget input changes
  useEffect(() => {
    const handler = setTimeout(() => {
      if (minVal !== filtersRef.current.min_budget) {
        onChange({ ...filtersRef.current, min_budget: minVal });
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [minVal, onChange]);

  // Debounce max budget input changes
  useEffect(() => {
    const handler = setTimeout(() => {
      if (maxVal !== filtersRef.current.max_budget) {
        onChange({ ...filtersRef.current, max_budget: maxVal });
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [maxVal, onChange]);

  const handleCategorySelect = (slug: string) => {
    const selected = filters.category === slug ? '' : slug;
    onChange({ ...filtersRef.current, category: selected });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filtersRef.current, sort_by: e.target.value });
  };

  const handleReset = () => {
    setSearchVal('');
    setMinVal('');
    setMaxVal('');
    onChange({
      search: '',
      category: '',
      min_budget: '',
      max_budget: '',
      sort_by: 'newest'
    });
  };

  return (
    <aside className="desktop-only filter-sidebar-aside">
      {/* Header filter title */}
      <div className="filter-sidebar-header">
        <div className="filter-sidebar-title">
          <Sliders size={18} style={{ color: 'var(--primary)' }} />
          Filters
        </div>
        <button 
          onClick={handleReset}
          className="filter-sidebar-reset-btn"
        >
          Reset All
        </button>
      </div>

      {/* 1. Search Box */}
      <div className="filter-group">
        <label className="filter-label">Search Jobs</label>
        <div className="filter-input-relative">
          <Search size={16} className="filter-search-icon" />
          <input 
            type="text"
            placeholder="Title or keywords..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="filter-search-input"
          />
        </div>
      </div>

      {/* 2. Sorting */}
      <div className="filter-group">
        <label className="filter-label">Sort Listings</label>
        <div className="filter-input-relative">
          <select 
            value={filters.sort_by}
            onChange={handleSortChange}
            className="filter-select"
          >
            <option value="newest">Newest Posted</option>
            <option value="highest_budget">Highest Budget</option>
            <option value="deadline">Closest Deadline</option>
          </select>
          <ChevronDown size={16} className="filter-select-arrow" />
        </div>
      </div>

      {/* 3. Categories list */}
      <div className="filter-group">
        <label className="filter-label" style={{ marginBottom: '2px' }}>Categories</label>
        <div className="filter-categories-list">
          {categories.map((cat) => {
            const isChecked = filters.category === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.slug)}
                className="category-filter-btn"
                style={{
                  fontWeight: isChecked ? 600 : 400,
                  color: isChecked ? 'var(--primary)' : 'var(--text-muted)'
                }}
              >
                <div 
                  className="category-filter-checkbox"
                  style={{
                    border: isChecked ? '2px solid var(--primary)' : '1px solid var(--border)',
                    backgroundColor: isChecked ? 'var(--primary)' : '#ffffff'
                  }}
                >
                  {isChecked && '✓'}
                </div>
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Budgets range */}
      <div className="filter-group">
        <label className="filter-label">Budget Range ($)</label>
        <div className="budget-range-row">
          <input 
            type="number"
            placeholder="Min"
            value={minVal}
            onChange={(e) => setMinVal(e.target.value)}
            className="budget-input"
          />
          <span className="budget-separator">-</span>
          <input 
            type="number"
            placeholder="Max"
            value={maxVal}
            onChange={(e) => setMaxVal(e.target.value)}
            className="budget-input"
          />
        </div>
      </div>
    </aside>
  );
};


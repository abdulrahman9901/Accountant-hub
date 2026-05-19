import React, { useEffect, useState } from 'react';
import { request } from '../api/client';
import { Category } from '../types';
import { Search, Sliders, ChevronDown } from 'lucide-react';

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

  // Debounce search input changes
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchVal !== filters.search) {
        onChange({ ...filters, search: searchVal });
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchVal, filters, onChange]);

  const handleCategorySelect = (slug: string) => {
    const selected = filters.category === slug ? '' : slug;
    onChange({ ...filters, category: selected });
  };

  const handleBudgetChange = (field: 'min_budget' | 'max_budget', val: string) => {
    onChange({ ...filters, [field]: val });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, sort_by: e.target.value });
  };

  const handleReset = () => {
    setSearchVal('');
    onChange({
      search: '',
      category: '',
      min_budget: '',
      max_budget: '',
      sort_by: 'newest'
    });
  };

  return (
    <aside style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      width: '100%',
      maxWidth: '300px'
    }} className="desktop-only">
      {/* Header filter title */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
          <Sliders size={18} style={{ color: 'var(--primary)' }} />
          Filters
        </div>
        <button 
          onClick={handleReset}
          style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--primary)',
            cursor: 'pointer'
          }}
        >
          Reset All
        </button>
      </div>

      {/* 1. Search Box */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Search Jobs</label>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            placeholder="Title or keywords..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              fontSize: '0.85rem',
              backgroundColor: '#ffffff',
              transition: 'var(--transition)'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
      </div>

      {/* 2. Sorting */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sort Listings</label>
        <div style={{ position: 'relative' }}>
          <select 
            value={filters.sort_by}
            onChange={handleSortChange}
            style={{
              width: '100%',
              padding: '10px 32px 10px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              fontSize: '0.85rem',
              backgroundColor: '#ffffff',
              appearance: 'none',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            <option value="newest">Newest Posted</option>
            <option value="highest_budget">Highest Budget</option>
            <option value="deadline">Closest Deadline</option>
          </select>
          <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '13px', pointerEvents: 'none', color: 'var(--text-muted)' }} />
        </div>
      </div>

      {/* 3. Categories list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Categories</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {categories.map((cat) => {
            const isChecked = filters.category === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.slug)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textAlign: 'left',
                  fontSize: '0.85rem',
                  fontWeight: isChecked ? 600 : 400,
                  color: isChecked ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px 0',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '3px',
                  border: isChecked ? '2px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: isChecked ? 'var(--primary)' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '0.6rem',
                  fontWeight: 'bold',
                  transition: 'var(--transition)'
                }}>
                  {isChecked && '✓'}
                </div>
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Budgets range */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Budget Range ($)</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input 
            type="number"
            placeholder="Min"
            value={filters.min_budget}
            onChange={(e) => handleBudgetChange('min_budget', e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              fontSize: '0.85rem',
              textAlign: 'center'
            }}
          />
          <span style={{ color: 'var(--text-muted)' }}>-</span>
          <input 
            type="number"
            placeholder="Max"
            value={filters.max_budget}
            onChange={(e) => handleBudgetChange('max_budget', e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              fontSize: '0.85rem',
              textAlign: 'center'
            }}
          />
        </div>
      </div>
    </aside>
  );
};

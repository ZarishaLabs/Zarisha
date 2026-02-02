'use client';

import { useState, useEffect } from 'react';

interface SearchFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export interface FilterState {
  type?: string;
  year?: string;
  sort?: string;
}

const ANIME_TYPES = ['All', 'TV', 'Movie', 'OVA', 'ONA', 'Special', 'Music'];
const SORT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'title', label: 'Title (A-Z)' },
  { value: 'title-desc', label: 'Title (Z-A)' },
  { value: 'year', label: 'Year (Newest)' },
  { value: 'year-asc', label: 'Year (Oldest)' },
  { value: 'score', label: 'Score (Highest)' },
  { value: 'score-asc', label: 'Score (Lowest)' },
];

const YEARS = ['All', ...Array.from({ length: new Date().getFullYear() - 1959 }, (_, i) => String(new Date().getFullYear() - i))];

export default function SearchFilters({ onFilterChange, initialFilters = {} }: SearchFiltersProps) {
  const [type, setType] = useState(initialFilters.type || 'All');
  const [year, setYear] = useState(initialFilters.year || 'All');
  const [sort, setSort] = useState(initialFilters.sort || '');

  useEffect(() => {
    setType(initialFilters.type || 'All');
    setYear(initialFilters.year || 'All');
    setSort(initialFilters.sort || '');
  }, [initialFilters.type, initialFilters.year, initialFilters.sort]);

  const notifyChange = (newType: string, newYear: string, newSort: string) => {
    const filters: FilterState = {};
    if (newType !== 'All') filters.type = newType;
    if (newYear !== 'All') filters.year = newYear;
    if (newSort) filters.sort = newSort;
    onFilterChange(filters);
  };

  const handleTypeChange = (newType: string) => {
    setType(newType);
    notifyChange(newType, year, sort);
  };

  const handleYearChange = (newYear: string) => {
    setYear(newYear);
    notifyChange(type, newYear, sort);
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    notifyChange(type, year, newSort);
  };

  const resetFilters = () => {
    setType('All');
    setYear('All');
    setSort('');
    onFilterChange({});
  };

  const hasActiveFilters = type !== 'All' || year !== 'All' || sort !== '';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm uppercase tracking-[1.5px] text-text-secondary">Filters</h4>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="px-3 py-1.5 text-xs uppercase tracking-[1.2px] text-text-secondary hover:text-error border border-divider hover:border-error/50 rounded-card transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Type Filter */}
        <div>
          <label className="block text-xs uppercase tracking-[1.2px] text-text-secondary mb-2">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="w-full bg-surface border border-divider rounded-card px-3 py-2 text-sm text-accent focus:border-accent outline-none transition-colors cursor-pointer"
          >
            {ANIME_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div>
          <label className="block text-xs uppercase tracking-[1.2px] text-text-secondary mb-2">
            Year
          </label>
          <select
            value={year}
            onChange={(e) => handleYearChange(e.target.value)}
            className="w-full bg-surface border border-divider rounded-card px-3 py-2 text-sm text-accent focus:border-accent outline-none transition-colors cursor-pointer"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Filter */}
        <div>
          <label className="block text-xs uppercase tracking-[1.2px] text-text-secondary mb-2">
            Sort By
          </label>
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full bg-surface border border-divider rounded-card px-3 py-2 text-sm text-accent focus:border-accent outline-none transition-colors cursor-pointer"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2">
          {type !== 'All' && (
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/30 rounded-full text-xs">
              Type: {type}
              <button onClick={() => handleTypeChange('All')} className="hover:text-error transition-colors">×</button>
            </span>
          )}
          {year !== 'All' && (
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-warning/10 border border-warning/30 rounded-full text-xs">
              Year: {year}
              <button onClick={() => handleYearChange('All')} className="hover:text-error transition-colors">×</button>
            </span>
          )}
          {sort && (
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-success/10 border border-success/30 rounded-full text-xs">
              Sort: {SORT_OPTIONS.find(s => s.value === sort)?.label}
              <button onClick={() => handleSortChange('')} className="hover:text-error transition-colors">×</button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
  submitOnly?: boolean;
}

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export default function SearchBar({ onSearch, initialQuery = '', submitOnly = false }: SearchBarProps) {
  const [value, setValue] = useState(initialQuery);

  useEffect(() => {
    setValue(initialQuery);
  }, [initialQuery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (!submitOnly) onSearch(newValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Search anime titles..."
        className="w-full bg-surface border border-divider rounded-card px-4 py-3 pl-12 text-accent placeholder-text-secondary focus:border-accent outline-none transition-colors"
      />
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
        <SearchIcon />
      </div>
    </form>
  );
}
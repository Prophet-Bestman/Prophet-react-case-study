import React, { useState, useEffect } from 'react';
import { useIssueStore } from '../../store/issueStore';
import './SearchBar.css';

export const SearchBar: React.FC = () => {
  const { filters, setFilters } = useIssueStore();
  const [localSearch, setLocalSearch] = useState(filters.searchTerm);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ searchTerm: localSearch });
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [localSearch, setFilters]);

  return (
    <div className="search-bar">
      <input
        type="text"
        className="search-bar__input"
        placeholder="Search by title or tags..."
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
      />
      {localSearch && (
        <button
          className="search-bar__clear"
          onClick={() => setLocalSearch('')}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
};

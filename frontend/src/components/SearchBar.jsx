import React, { useState, useEffect } from 'react';
import { Search, X, FileText, Mail } from 'lucide-react';
import './SearchBar.css';

export default function SearchBar({ onSearch, pstInfo }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        onSearch(searchTerm);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div className="search-bar-container">
      <div className="search-bar-header">
        <div className="pst-info">
          <FileText size={20} />
          <div className="pst-info-text">
            <span className="pst-filename">{pstInfo?.fileName || 'No file loaded'}</span>
            {pstInfo && (
              <span className="pst-stats">
                <Mail size={14} />
                {pstInfo.totalEmails} emails · {pstInfo.totalFolders} folders
              </span>
            )}
          </div>
        </div>
      </div>

      <form
        className={`search-bar ${isFocused ? 'focused' : ''}`}
        onSubmit={handleSubmit}
      >
        <Search className="search-icon" size={20} />
        <input
          type="text"
          placeholder="Search emails by subject, sender, or content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="search-input"
        />
        {searchTerm && (
          <button
            type="button"
            className="search-clear"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </form>
    </div>
  );
}

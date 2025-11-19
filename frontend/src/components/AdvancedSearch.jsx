import React, { useState } from 'react';
import { Search, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import './AdvancedSearch.css';

export default function AdvancedSearch({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    subject: '',
    body: '',
    hasAttachments: ''
  });

  const handleSimpleSearch = (e) => {
    e.preventDefault();
    onSearch({ query: searchQuery, filters: {} });
  };

  const handleAdvancedSearch = (e) => {
    e.preventDefault();

    // Build advanced query
    const activeFilters = {};
    if (filters.from) activeFilters.from = filters.from;
    if (filters.to) activeFilters.to = filters.to;
    if (filters.subject) activeFilters.subject = filters.subject;
    if (filters.body) activeFilters.body = filters.body;
    if (filters.hasAttachments) activeFilters.hasAttachments = filters.hasAttachments === 'yes';

    onSearch({ query: searchQuery, filters: activeFilters });
  };

  const handleClear = () => {
    setSearchQuery('');
    setFilters({
      from: '',
      to: '',
      subject: '',
      body: '',
      hasAttachments: ''
    });
    onSearch({ query: '', filters: {} });
  };

  const parseAdvancedQuery = (query) => {
    // Parse queries like "from:john subject:meeting"
    const parts = query.match(/(\w+):([^\s]+)|([^\s:]+)/g) || [];
    const newFilters = { ...filters };
    let remainingQuery = '';

    parts.forEach(part => {
      if (part.includes(':')) {
        const [key, value] = part.split(':');
        if (key === 'from') newFilters.from = value;
        else if (key === 'to') newFilters.to = value;
        else if (key === 'subject') newFilters.subject = value;
        else if (key === 'body' || key === 'content') newFilters.body = value;
        else if (key === 'has' && value === 'attachments') newFilters.hasAttachments = 'yes';
      } else {
        remainingQuery += part + ' ';
      }
    });

    setFilters(newFilters);
    setSearchQuery(remainingQuery.trim());
  };

  const handleQueryChange = (value) => {
    setSearchQuery(value);
    // Auto-parse if contains colons
    if (value.includes(':')) {
      parseAdvancedQuery(value);
    }
  };

  return (
    <div className="advanced-search">
      <form onSubmit={showAdvanced ? handleAdvancedSearch : handleSimpleSearch} className="search-form">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search or use filters (e.g., from:john subject:report)"
            value={searchQuery}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="search-input"
          />
          {(searchQuery || Object.values(filters).some(v => v)) && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={handleClear}
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
          <button
            type="button"
            className="search-toggle-btn"
            onClick={() => setShowAdvanced(!showAdvanced)}
            aria-label="Toggle advanced search"
          >
            <Filter size={18} />
            {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </form>

      {showAdvanced && (
        <div className="advanced-filters">
          <div className="filter-grid">
            <div className="filter-item">
              <label htmlFor="filter-from">From:</label>
              <input
                id="filter-from"
                type="text"
                placeholder="Sender name or email"
                value={filters.from}
                onChange={(e) => setFilters({ ...filters, from: e.target.value })}
              />
            </div>

            <div className="filter-item">
              <label htmlFor="filter-to">To:</label>
              <input
                id="filter-to"
                type="text"
                placeholder="Recipient name or email"
                value={filters.to}
                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
              />
            </div>

            <div className="filter-item">
              <label htmlFor="filter-subject">Subject:</label>
              <input
                id="filter-subject"
                type="text"
                placeholder="Email subject"
                value={filters.subject}
                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
              />
            </div>

            <div className="filter-item">
              <label htmlFor="filter-body">Body:</label>
              <input
                id="filter-body"
                type="text"
                placeholder="Email body content"
                value={filters.body}
                onChange={(e) => setFilters({ ...filters, body: e.target.value })}
              />
            </div>

            <div className="filter-item">
              <label htmlFor="filter-attachments">Has Attachments:</label>
              <select
                id="filter-attachments"
                value={filters.hasAttachments}
                onChange={(e) => setFilters({ ...filters, hasAttachments: e.target.value })}
              >
                <option value="">Any</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          <div className="filter-actions">
            <button type="button" className="btn-secondary" onClick={handleClear}>
              Clear All
            </button>
            <button type="button" className="btn-primary" onClick={handleAdvancedSearch}>
              Apply Filters
            </button>
          </div>

          <div className="filter-help">
            <p><strong>Quick filters:</strong></p>
            <p>
              <code>from:john</code> <code>to:jane</code> <code>subject:meeting</code>{' '}
              <code>body:report</code> <code>has:attachments</code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

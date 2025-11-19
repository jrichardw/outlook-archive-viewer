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

  const handleSearch = (e) => {
    e.preventDefault();

    // Parse query for filter syntax if contains colons
    let finalQuery = searchQuery;
    let finalFilters = { ...filters };

    if (searchQuery.includes(':')) {
      const parsed = parseAdvancedQueryForSearch(searchQuery);
      finalQuery = parsed.query;
      finalFilters = { ...finalFilters, ...parsed.filters };
    }

    // Build active filters
    const activeFilters = {};
    if (finalFilters.from) activeFilters.from = finalFilters.from;
    if (finalFilters.to) activeFilters.to = finalFilters.to;
    if (finalFilters.subject) activeFilters.subject = finalFilters.subject;
    if (finalFilters.body) activeFilters.body = finalFilters.body;
    if (finalFilters.hasAttachments) activeFilters.hasAttachments = finalFilters.hasAttachments === 'yes';

    onSearch({ query: finalQuery, filters: activeFilters });
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

  const parseAdvancedQueryForSearch = (query) => {
    // Parse queries like "from:john subject:meeting"
    const parts = query.match(/(\w+):([^\s]+)|([^\s:]+)/g) || [];
    const parsedFilters = {};
    let remainingQuery = '';

    parts.forEach(part => {
      if (part.includes(':')) {
        const [key, value] = part.split(':');
        if (key === 'from') parsedFilters.from = value;
        else if (key === 'to') parsedFilters.to = value;
        else if (key === 'subject') parsedFilters.subject = value;
        else if (key === 'body' || key === 'content') parsedFilters.body = value;
        else if (key === 'has' && value === 'attachments') parsedFilters.hasAttachments = 'yes';
      } else {
        remainingQuery += part + ' ';
      }
    });

    return {
      filters: parsedFilters,
      query: remainingQuery.trim()
    };
  };

  return (
    <div className="advanced-search">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search or use filters (e.g., from:john subject:report)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
            <button type="button" className="btn-primary" onClick={(e) => handleSearch(e)}>
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

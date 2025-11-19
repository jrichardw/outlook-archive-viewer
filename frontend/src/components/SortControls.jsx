import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import './SortControls.css';

export default function SortControls({ sortBy, sortDirection, onSortChange }) {
  const sortOptions = [
    { value: 'date', label: 'Date', directions: ['newest', 'oldest'] },
    { value: 'from', label: 'From', directions: ['asc', 'desc'] },
    { value: 'size', label: 'Size', directions: ['largest', 'smallest'] },
    { value: 'importance', label: 'Importance', directions: ['high', 'low'] },
    { value: 'subject', label: 'Subject', directions: ['asc', 'desc'] }
  ];

  const getDirectionLabel = (option, direction) => {
    if (option.value === 'date') {
      return direction === 'newest' ? 'Newest on Top' : 'Oldest on Top';
    } else if (option.value === 'from' || option.value === 'subject') {
      return direction === 'asc' ? 'A on Top' : 'Z on Top';
    } else if (option.value === 'size') {
      return direction === 'largest' ? 'Largest on Top' : 'Smallest on Top';
    } else if (option.value === 'importance') {
      return direction === 'high' ? 'High on Top' : 'Low on Top';
    }
    return direction;
  };

  const handleSortByChange = (e) => {
    const newSortBy = e.target.value;
    const option = sortOptions.find(opt => opt.value === newSortBy);

    // Default to first direction (descending equivalent)
    const defaultDirection = option ? option.directions[0] : 'desc';
    onSortChange(newSortBy, defaultDirection);
  };

  const handleDirectionChange = (e) => {
    onSortChange(sortBy, e.target.value);
  };

  const currentOption = sortOptions.find(opt => opt.value === sortBy);

  return (
    <div className="sort-controls">
      <div className="sort-icon">
        <ArrowUpDown size={18} />
      </div>

      <div className="sort-selector">
        <label htmlFor="sort-by">Sort by:</label>
        <select
          id="sort-by"
          value={sortBy}
          onChange={handleSortByChange}
          className="sort-select"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="sort-direction">
        <select
          id="sort-direction"
          value={sortDirection}
          onChange={handleDirectionChange}
          className="sort-select"
        >
          {currentOption && currentOption.directions.map(dir => (
            <option key={dir} value={dir}>
              {getDirectionLabel(currentOption, dir)}
            </option>
          ))}
        </select>
      </div>

      <div className="sort-indicator">
        {sortDirection === 'asc' || sortDirection === 'oldest' || sortDirection === 'smallest' || sortDirection === 'low' ? (
          <ArrowUp size={16} />
        ) : (
          <ArrowDown size={16} />
        )}
      </div>
    </div>
  );
}

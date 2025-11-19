import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

export default function Pagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  loading
}) {
  const { page, totalPages, total, limit } = pagination;

  const pageSizeOptions = [50, 100, 500];

  const handlePrevious = () => {
    if (page > 1) {
      onPageChange(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      onPageChange(page + 1);
    }
  };

  const handlePageSizeChange = (e) => {
    const newLimit = parseInt(e.target.value);
    onPageSizeChange(newLimit);
  };

  if (total === 0) return null;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="pagination">
      <div className="pagination-info">
        <span className="pagination-count">
          Showing {startItem}-{endItem} of {total} emails
        </span>
      </div>

      <div className="pagination-controls">
        <div className="page-size-selector">
          <label htmlFor="pageSize">Show:</label>
          <select
            id="pageSize"
            value={limit}
            onChange={handlePageSizeChange}
            disabled={loading}
            className="page-size-select"
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        <div className="page-navigation">
          <button
            onClick={handlePrevious}
            disabled={page === 1 || loading}
            className="pagination-btn"
            aria-label="Previous page"
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          <span className="page-indicator">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={handleNext}
            disabled={page === totalPages || loading}
            className="pagination-btn"
            aria-label="Next page"
          >
            Next
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

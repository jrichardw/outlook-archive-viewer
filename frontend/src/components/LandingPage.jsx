import React, { useState } from 'react';
import { Archive, FileText, Upload, Search, SortAsc, FolderOpen, CheckCircle, ArrowRight } from 'lucide-react';
import './LandingPage.css';

export default function LandingPage({ onOpenPST, onOpenMSG, onGoToExistingPST, uploading, progress, hasSavedPST }) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);

  const handlePSTFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.name.toLowerCase().endsWith('.pst')) {
      onOpenPST(file);
    } else {
      alert('Please select a valid PST file');
    }
  };

  const handleMSGFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.name.toLowerCase().endsWith('.msg')) {
      onOpenMSG(file);
    } else {
      alert('Please select a valid MSG file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.pst')) {
      onOpenPST(file);
    } else if (fileName.endsWith('.msg')) {
      onOpenMSG(file);
    } else {
      alert('Please drop a valid PST or MSG file');
    }
  };

  if (uploading) {
    return (
      <div className="landing-page">
        <div className="upload-progress-overlay">
          <div className="upload-progress-content">
            <Archive size={64} className="upload-icon" />
            <h2>
              {progress < 100 ? 'Uploading file...' : 'Processing archive...'}
            </h2>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="progress-text">{Math.round(progress)}%</p>
            <p className="progress-hint">
              {progress < 100
                ? 'Please wait while your file is being uploaded'
                : 'Parsing PST file structure and extracting emails...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-icon">
            <Archive size={72} />
          </div>
          <h1 className="hero-title">Outlook Archive Viewer</h1>
          <p className="hero-subtitle">
            View and search your Outlook PST archives and MSG files with ease
          </p>
          <p className="hero-description">
            A modern, powerful tool for browsing Outlook data files without needing Outlook installed.
            Open PST archives to explore thousands of emails, or quickly view individual MSG files.
          </p>
        </div>

        {/* Features Grid */}
        <div className="features-grid">
          <div className="feature-card">
            <Search size={32} />
            <h3>Advanced Search</h3>
            <p>Search across all emails with powerful filters for sender, subject, body, and more</p>
          </div>
          <div className="feature-card">
            <SortAsc size={32} />
            <h3>Smart Sorting</h3>
            <p>Sort by date, sender, size, importance, or subject with flexible options</p>
          </div>
          <div className="feature-card">
            <FolderOpen size={32} />
            <h3>Folder Navigation</h3>
            <p>Browse your email folder structure just like in Outlook</p>
          </div>
          <div className="feature-card">
            <FileText size={32} />
            <h3>Rich Email Viewer</h3>
            <p>View emails with full formatting, attachments, and metadata</p>
          </div>
        </div>
      </div>

      {/* Action Section */}
      <div
        className={`action-section ${dragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <h2 className="action-title">Get Started</h2>
        <p className="action-subtitle">Choose how you want to open your Outlook data</p>

        <div className="action-cards">
          {/* PST Archive Card */}
          <div className="action-card">
            <div className="action-card-icon">
              <Archive size={48} />
            </div>
            <h3>Open PST Archive</h3>
            <p>Browse complete Outlook data archives with full folder structure and search capabilities</p>
            <ul className="action-card-features">
              <li><CheckCircle size={16} /> Browse thousands of emails</li>
              <li><CheckCircle size={16} /> Navigate folder structure</li>
              <li><CheckCircle size={16} /> Advanced search & filters</li>
              <li><CheckCircle size={16} /> Persistent state across refreshes</li>
            </ul>
            {hasSavedPST ? (
              <button className="action-button action-button-primary" onClick={onGoToExistingPST}>
                <ArrowRight size={20} />
                Go to PST Archive
              </button>
            ) : (
              <label className="action-button action-button-primary">
                <Upload size={20} />
                Select PST File
                <input
                  type="file"
                  accept=".pst"
                  onChange={handlePSTFileSelect}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>

          {/* MSG File Card */}
          <div className="action-card">
            <div className="action-card-icon">
              <FileText size={48} />
            </div>
            <h3>View MSG File</h3>
            <p>Quickly open and view individual Outlook message files</p>
            <ul className="action-card-features">
              <li><CheckCircle size={16} /> View single email messages</li>
              <li><CheckCircle size={16} /> See full email formatting</li>
              <li><CheckCircle size={16} /> Access attachments</li>
              <li><CheckCircle size={16} /> Quick and lightweight</li>
            </ul>
            <label className="action-button action-button-secondary">
              <Upload size={20} />
              Select MSG File
              <input
                type="file"
                accept=".msg"
                onChange={handleMSGFileSelect}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        {dragOver && (
          <div className="drag-overlay">
            <Upload size={64} />
            <p>Drop your PST or MSG file here</p>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useRef, useState } from 'react';
import { Upload, File, AlertCircle } from 'lucide-react';
import './FileUpload.css';

export default function FileUpload({ onUpload, uploading, progress }) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError('');

    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleChange = (e) => {
    e.preventDefault();
    setError('');

    const files = e.target.files;
    handleFiles(files);
  };

  const handleFiles = (files) => {
    if (files && files.length > 0) {
      const file = files[0];

      // Validate file type
      if (!file.name.toLowerCase().endsWith('.pst')) {
        setError('Please select a valid .pst file');
        return;
      }

      // Validate file size (max 500MB)
      const maxSize = 500 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('File size exceeds 500MB limit');
        return;
      }

      onUpload(file);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-upload-container">
      <div className="file-upload-card">
        <div className="upload-header">
          <div className="upload-icon">
            <File size={48} />
          </div>
          <h1>Outlook Archive Viewer</h1>
          <p className="upload-subtitle">
            Upload your Outlook PST file to view emails and folders
          </p>
        </div>

        <form
          className={`upload-form ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pst"
            onChange={handleChange}
            style={{ display: 'none' }}
            disabled={uploading}
          />

          {!uploading ? (
            <div className="upload-area">
              <Upload className="upload-icon-large" size={64} />
              <p className="upload-text">
                Drag and drop your PST file here
              </p>
              <p className="upload-or">or</p>
              <button
                type="button"
                className="btn-primary"
                onClick={onButtonClick}
              >
                Choose File
              </button>
              <p className="upload-hint">Maximum file size: 500MB</p>
            </div>
          ) : (
            <div className="upload-progress">
              <div className="spinner"></div>
              <p className="progress-text">Uploading and processing...</p>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="progress-percentage">{progress}%</p>
            </div>
          )}
        </form>

        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <div className="upload-info">
          <h3>Supported Features:</h3>
          <ul>
            <li>Browse folder structure</li>
            <li>View email messages with attachments</li>
            <li>Search across all emails</li>
            <li>Filter by folder</li>
            <li>Modern, responsive interface</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

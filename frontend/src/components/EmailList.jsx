import React from 'react';
import { Mail, Paperclip, Star, Clock } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import './EmailList.css';

function EmailItem({ email, isSelected, onClick }) {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return '';
      const now = new Date();
      const emailDate = new Date(date);

      // If today, show time
      if (emailDate.toDateString() === now.toDateString()) {
        return format(emailDate, 'h:mm a');
      }
      // If this year, show month and day
      if (emailDate.getFullYear() === now.getFullYear()) {
        return format(emailDate, 'MMM d');
      }
      // Otherwise show full date
      return format(emailDate, 'MMM d, yyyy');
    } catch {
      return '';
    }
  };

  const getPreview = (body) => {
    if (!body) return 'No preview available';
    // Strip HTML tags and get first 100 characters
    const text = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.substring(0, 100) + (text.length > 100 ? '...' : '');
  };

  const displayDate = formatDate(email.receivedTime || email.sentTime);
  const isImportant = email.importance === 2;

  return (
    <div
      className={`email-item ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="email-item-header">
        <div className="email-from">
          <div className="email-avatar">
            {email.senderName ? email.senderName.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="email-sender">
            <span className="sender-name">{email.senderName || 'Unknown'}</span>
            {isImportant && <Star size={14} className="importance-icon" />}
          </div>
        </div>
        <div className="email-date">
          <Clock size={14} />
          {displayDate}
        </div>
      </div>

      <div className="email-subject">
        {email.hasAttachments && (
          <Paperclip size={14} className="attachment-icon" />
        )}
        {email.subject || '(No Subject)'}
      </div>

      <div className="email-preview">
        {getPreview(email.body || email.bodyHTML)}
      </div>

      {email.folderName && (
        <div className="email-folder-badge">
          {email.folderName}
        </div>
      )}
    </div>
  );
}

export default function EmailList({
  emails,
  selectedEmailId,
  onSelectEmail,
  loading,
  currentFolder
}) {
  if (loading) {
    return (
      <div className="email-list-loading">
        <div className="spinner"></div>
        <p>Loading emails...</p>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="email-list-empty">
        <Mail size={64} />
        <h3>No emails found</h3>
        <p>
          {currentFolder
            ? `No emails in "${currentFolder}"`
            : 'Try uploading a PST file or adjusting your search'}
        </p>
      </div>
    );
  }

  return (
    <div className="email-list">
      <div className="email-list-header">
        <h2>
          {currentFolder || 'All Emails'}
        </h2>
        <span className="email-count">{emails.length} emails</span>
      </div>

      <div className="email-list-content">
        {emails.map((email) => (
          <EmailItem
            key={email.id}
            email={email}
            isSelected={selectedEmailId === email.id}
            onClick={() => onSelectEmail(email)}
          />
        ))}
      </div>
    </div>
  );
}

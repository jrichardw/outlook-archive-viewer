import React, { useMemo } from 'react';
import { X, Mail, Calendar, User, Paperclip, Download, Clock } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import './EmailViewer.css';

export default function EmailViewer({ email, onClose }) {
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return 'Unknown';
      return format(date, 'PPpp'); // e.g., "Apr 29, 2023, 9:30:00 AM"
    } catch {
      return 'Unknown';
    }
  };

  const sanitizeHTML = (html) => {
    if (!html) return '';
    // Basic sanitization - in production, use DOMPurify
    return html;
  };

  const emailBody = useMemo(() => {
    if (email.bodyHTML) {
      return sanitizeHTML(email.bodyHTML);
    }
    if (email.body) {
      // Convert plain text to HTML
      return email.body
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
    }
    return '<p>No content available</p>';
  }, [email]);

  if (!email) {
    return (
      <div className="email-viewer-empty">
        <Mail size={64} />
        <h3>No email selected</h3>
        <p>Select an email from the list to view its contents</p>
      </div>
    );
  }

  return (
    <div className="email-viewer">
      <div className="email-viewer-header">
        <div className="email-header-content">
          <h1 className="email-subject">{email.subject || '(No Subject)'}</h1>

          <div className="email-meta">
            <div className="email-meta-item">
              <User size={16} />
              <div>
                <strong>{email.senderName || 'Unknown'}</strong>
                {email.senderEmail && (
                  <span className="email-address">&lt;{email.senderEmail}&gt;</span>
                )}
              </div>
            </div>

            {email.recipients && (
              <div className="email-meta-item">
                <Mail size={16} />
                <span><strong>To:</strong> {email.recipients}</span>
              </div>
            )}

            <div className="email-meta-item">
              <Calendar size={16} />
              <span>{formatDateTime(email.receivedTime || email.sentTime)}</span>
            </div>

            {email.folderPath && (
              <div className="email-meta-item">
                <span className="folder-path-label">Folder:</span>
                <span className="folder-path">{email.folderPath}</span>
              </div>
            )}
          </div>

          {email.hasAttachments && email.attachments && email.attachments.length > 0 && (
            <div className="email-attachments">
              <div className="attachments-header">
                <Paperclip size={16} />
                <span>{email.attachments.length} Attachment{email.attachments.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="attachments-list">
                {email.attachments.map((attachment, index) => (
                  <div key={index} className="attachment-item">
                    <div className="attachment-info">
                      <span className="attachment-name">{attachment.filename}</span>
                      <span className="attachment-size">
                        {(attachment.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button className="btn-close" onClick={onClose} aria-label="Close email">
          <X size={20} />
        </button>
      </div>

      <div className="email-viewer-body">
        <div
          className="email-content"
          dangerouslySetInnerHTML={{ __html: emailBody }}
        />
      </div>
    </div>
  );
}

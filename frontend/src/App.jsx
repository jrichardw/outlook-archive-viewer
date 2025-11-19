import React, { useState } from 'react';
import { usePST } from './hooks/usePST';
import FileUpload from './components/FileUpload';
import SearchBar from './components/SearchBar';
import FolderTree from './components/FolderTree';
import EmailList from './components/EmailList';
import EmailViewer from './components/EmailViewer';
import Pagination from './components/Pagination';
import { AlertCircle, X } from 'lucide-react';
import './App.css';

function App() {
  const {
    fileId,
    pstInfo,
    folders,
    emails,
    currentEmail,
    loading,
    uploading,
    uploadProgress,
    error,
    pagination,
    uploadPST,
    searchEmails,
    filterByFolder,
    loadEmailById,
    loadEmails,
    changePage,
    changePageSize,
    clearError,
    setCurrentEmail
  } = usePST();

  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [selectedFolderName, setSelectedFolderName] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmailViewer, setShowEmailViewer] = useState(false);

  const handleUpload = async (file) => {
    try {
      await uploadPST(file);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.trim()) {
      searchEmails(term, selectedFolderId);
    } else {
      // If search is cleared, reload based on current folder
      if (selectedFolderId) {
        filterByFolder(selectedFolderId);
      } else {
        loadEmails();
      }
    }
  };

  const handleSelectFolder = (folderId, folderName) => {
    setSelectedFolderId(folderId);
    setSelectedFolderName(folderName);
    setSearchTerm('');
    filterByFolder(folderId);
    setCurrentEmail(null);
    setShowEmailViewer(false);
  };

  const handleShowAllEmails = () => {
    setSelectedFolderId(null);
    setSelectedFolderName(null);
    setSearchTerm('');
    loadEmails();
    setCurrentEmail(null);
    setShowEmailViewer(false);
  };

  const handleSelectEmail = (email) => {
    setCurrentEmail(email);
    setShowEmailViewer(true);
  };

  const handleCloseEmailViewer = () => {
    setShowEmailViewer(false);
    setCurrentEmail(null);
  };

  // Show upload screen if no file is loaded
  if (!fileId) {
    return (
      <FileUpload
        onUpload={handleUpload}
        uploading={uploading}
        progress={uploadProgress}
      />
    );
  }

  return (
    <div className="app">
      {/* Error notification */}
      {error && (
        <div className="error-notification">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button
            className="error-close"
            onClick={clearError}
            aria-label="Dismiss error"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Main layout */}
      <div className="app-layout">
        {/* Sidebar with folder tree */}
        <aside className="app-sidebar">
          <FolderTree
            folders={folders}
            selectedFolderId={selectedFolderId}
            onSelectFolder={handleSelectFolder}
            onShowAll={handleShowAllEmails}
          />
        </aside>

        {/* Main content area */}
        <main className="app-main">
          {/* Search bar */}
          <SearchBar
            onSearch={handleSearch}
            pstInfo={pstInfo}
          />

          {/* Content area with email list and viewer */}
          <div className="app-content">
            {/* Email list */}
            <div className={`email-list-panel ${showEmailViewer ? 'with-viewer' : ''}`}>
              <EmailList
                emails={emails}
                selectedEmailId={currentEmail?.id}
                onSelectEmail={handleSelectEmail}
                loading={loading}
                currentFolder={selectedFolderName}
              />

              {/* Pagination controls */}
              {emails.length > 0 && (
                <Pagination
                  pagination={pagination}
                  onPageChange={changePage}
                  onPageSizeChange={changePageSize}
                  loading={loading}
                />
              )}
            </div>

            {/* Email viewer */}
            {showEmailViewer && (
              <div className="email-viewer-panel">
                <EmailViewer
                  email={currentEmail}
                  onClose={handleCloseEmailViewer}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;

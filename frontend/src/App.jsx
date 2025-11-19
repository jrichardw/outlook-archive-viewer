import React, { useState, useEffect } from 'react';
import { usePST } from './hooks/usePST';
import LandingPage from './components/LandingPage';
import AdvancedSearch from './components/AdvancedSearch';
import SortControls from './components/SortControls';
import FolderTree from './components/FolderTree';
import EmailList from './components/EmailList';
import EmailViewer from './components/EmailViewer';
import Pagination from './components/Pagination';
import { msgApi } from './services/api';
import { AlertCircle, X, FileText, Mail, ArrowLeft } from 'lucide-react';
import './App.css';

function App() {
  const [msgEmail, setMsgEmail] = useState(null);
  const [msgLoading, setMsgLoading] = useState(false);
  const [msgProgress, setMsgProgress] = useState(0);
  const [hasSavedPST, setHasSavedPST] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(false);
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
    currentSort,
    uploadPST,
    searchEmails,
    filterByFolder,
    loadEmailById,
    loadEmails,
    changePage,
    changePageSize,
    changeSort,
    clearError,
    setCurrentEmail,
    closePST
  } = usePST();

  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [selectedFolderName, setSelectedFolderName] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmailViewer, setShowEmailViewer] = useState(false);

  // Check if there's a saved PST in localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('outlook-archive-viewer-pst-state');
    setHasSavedPST(!!savedState);
  }, [fileId]);

  const handleUpload = async (file) => {
    try {
      await uploadPST(file);
      setShowLandingPage(false); // Navigate to PST viewer after upload
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleSearch = (searchParams) => {
    searchEmails(searchParams);
  };

  const handleSelectFolder = (folderId, folderName) => {
    setSelectedFolderId(folderId);
    setSelectedFolderName(folderName);
    filterByFolder(folderId);
    setCurrentEmail(null);
    setShowEmailViewer(false);
  };

  const handleShowAllEmails = () => {
    setSelectedFolderId(null);
    setSelectedFolderName(null);
    loadEmails();
    setCurrentEmail(null);
    setShowEmailViewer(false);
  };

  const handleSortChange = (sortBy, sortDirection) => {
    changeSort(sortBy, sortDirection);
  };

  const handleSelectEmail = (email) => {
    setCurrentEmail(email);
    setShowEmailViewer(true);
  };

  const handleCloseEmailViewer = () => {
    setShowEmailViewer(false);
    setCurrentEmail(null);
  };

  const handleOpenMSG = async (file) => {
    try {
      setMsgLoading(true);
      setMsgProgress(0);

      const result = await msgApi.uploadMSG(file, (progress) => {
        setMsgProgress(progress);
      });

      setMsgEmail(result.email);
      setMsgLoading(false);
    } catch (err) {
      console.error('Failed to open MSG file:', err);
      alert(`Failed to open MSG file: ${err.response?.data?.error || err.message}`);
      setMsgLoading(false);
      setMsgEmail(null);
    }
  };

  const handleCloseMSG = () => {
    setMsgEmail(null);
  };

  const handleReturnHome = () => {
    // Just go back to landing page, keep PST loaded
    setShowLandingPage(true);
    setMsgEmail(null);
  };

  const handleClosePST = () => {
    // Actually close/unload the PST
    closePST();
    setMsgEmail(null);
    setHasSavedPST(false);
    setShowLandingPage(true);
  };

  const handleGoToExistingPST = () => {
    // PST is already loaded in state, just navigate to it
    setShowLandingPage(false);
  };

  // Show MSG viewer if MSG file is loaded
  if (msgEmail) {
    return (
      <div className="app">
        <div className="msg-viewer-container">
          <div className="msg-viewer-header">
            <button className="btn-home" onClick={handleReturnHome}>
              <ArrowLeft size={20} />
              Return Home
            </button>
            <h2>MSG File Viewer</h2>
          </div>
          <EmailViewer email={msgEmail} onClose={handleCloseMSG} />
        </div>
      </div>
    );
  }

  // Show landing page if no PST is loaded OR if user clicked "Return Home"
  if (!fileId || showLandingPage) {
    return (
      <LandingPage
        onOpenPST={handleUpload}
        onOpenMSG={handleOpenMSG}
        onGoToExistingPST={handleGoToExistingPST}
        uploading={uploading || msgLoading}
        progress={uploading ? uploadProgress : msgProgress}
        hasSavedPST={fileId ? true : hasSavedPST}
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
          {/* PST Info header */}
          <div className="pst-info-header">
            <div className="pst-info-left">
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
            <div className="pst-header-actions">
              <button className="btn-return-home" onClick={handleReturnHome} title="Return to home page">
                <ArrowLeft size={18} />
                Return Home
              </button>
              <button className="btn-close-archive" onClick={handleClosePST} title="Close archive and clear from storage">
                <X size={18} />
                Close Archive
              </button>
            </div>
          </div>

          {/* Advanced Search */}
          <AdvancedSearch onSearch={handleSearch} />

          {/* Sort Controls */}
          <SortControls
            sortBy={currentSort.sortBy}
            sortDirection={currentSort.sortDirection}
            onSortChange={handleSortChange}
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

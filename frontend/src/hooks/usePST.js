import { useState, useCallback } from 'react';
import { pstApi } from '../services/api';

export function usePST() {
  const [fileId, setFileId] = useState(null);
  const [pstInfo, setPstInfo] = useState(null);
  const [folders, setFolders] = useState([]);
  const [emails, setEmails] = useState([]);
  const [currentEmail, setCurrentEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [currentFilters, setCurrentFilters] = useState({
    folderId: null,
    search: ''
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0
  });

  const uploadPST = useCallback(async (file) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);

      const result = await pstApi.uploadPST(file, (progress) => {
        setUploadProgress(progress);
      });

      setFileId(result.fileId);
      setPstInfo({
        fileName: result.fileName,
        totalEmails: result.totalEmails,
        totalFolders: result.totalFolders
      });

      // Load folders and emails
      const foldersData = await pstApi.getFolders(result.fileId);
      setFolders(foldersData.folders);

      const emailsData = await pstApi.getEmails(result.fileId, { page: 1, limit: 50 });
      setEmails(emailsData.emails);
      setPagination(emailsData.pagination);

      setUploading(false);
      return result;
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to upload PST file');
      setUploading(false);
      throw err;
    }
  }, []);

  const loadEmails = useCallback(async (params = {}) => {
    if (!fileId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await pstApi.getEmails(fileId, params);
      setEmails(data.emails);
      setPagination(data.pagination);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load emails');
      setLoading(false);
    }
  }, [fileId]);

  const loadEmailById = useCallback(async (emailId) => {
    if (!fileId) return;

    try {
      setLoading(true);
      setError(null);

      const email = await pstApi.getEmailById(fileId, emailId);
      setCurrentEmail(email);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load email');
      setLoading(false);
    }
  }, [fileId]);

  const searchEmails = useCallback(async (searchTerm, folderId = null) => {
    if (!fileId) return;

    try {
      setLoading(true);
      setError(null);

      const params = { search: searchTerm, page: 1, limit: pagination.limit };
      if (folderId) params.folderId = folderId;

      setCurrentFilters({ search: searchTerm, folderId });

      const data = await pstApi.getEmails(fileId, params);
      setEmails(data.emails);
      setPagination(data.pagination);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to search emails');
      setLoading(false);
    }
  }, [fileId, pagination.limit]);

  const filterByFolder = useCallback(async (folderId) => {
    if (!fileId) return;

    try {
      setLoading(true);
      setError(null);

      setCurrentFilters({ folderId, search: '' });

      const data = await pstApi.getEmails(fileId, { folderId, page: 1, limit: pagination.limit });
      setEmails(data.emails);
      setPagination(data.pagination);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to filter emails');
      setLoading(false);
    }
  }, [fileId, pagination.limit]);

  const changePage = useCallback(async (newPage) => {
    if (!fileId) return;

    try {
      setLoading(true);
      setError(null);

      const params = {
        page: newPage,
        limit: pagination.limit
      };

      if (currentFilters.folderId) {
        params.folderId = currentFilters.folderId;
      }

      if (currentFilters.search) {
        params.search = currentFilters.search;
      }

      const data = await pstApi.getEmails(fileId, params);
      setEmails(data.emails);
      setPagination(data.pagination);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load emails');
      setLoading(false);
    }
  }, [fileId, pagination.limit, currentFilters]);

  const changePageSize = useCallback(async (newLimit) => {
    if (!fileId) return;

    try {
      setLoading(true);
      setError(null);

      const params = {
        page: 1, // Reset to first page when changing page size
        limit: newLimit
      };

      if (currentFilters.folderId) {
        params.folderId = currentFilters.folderId;
      }

      if (currentFilters.search) {
        params.search = currentFilters.search;
      }

      const data = await pstApi.getEmails(fileId, params);
      setEmails(data.emails);
      setPagination(data.pagination);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load emails');
      setLoading(false);
    }
  }, [fileId, currentFilters]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
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
    loadEmails,
    loadEmailById,
    searchEmails,
    filterByFolder,
    changePage,
    changePageSize,
    clearError,
    setCurrentEmail
  };
}

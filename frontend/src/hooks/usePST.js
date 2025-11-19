import { useState, useCallback, useEffect } from 'react';
import { pstApi } from '../services/api';

const PST_STORAGE_KEY = 'outlook-archive-viewer-pst-state';

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
    search: '',
    from: '',
    to: '',
    subject: '',
    body: '',
    hasAttachments: null
  });
  const [currentSort, setCurrentSort] = useState({
    sortBy: 'date',
    sortDirection: 'newest'
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0
  });

  // Restore state from localStorage on mount
  useEffect(() => {
    const restoreState = async () => {
      try {
        const savedState = localStorage.getItem(PST_STORAGE_KEY);
        if (!savedState) return;

        const state = JSON.parse(savedState);

        // Verify the PST file is still available on the backend
        if (state.fileId) {
          try {
            const foldersData = await pstApi.getFolders(state.fileId);

            // Successfully retrieved folders, restore full state
            setFileId(state.fileId);
            setPstInfo(state.pstInfo);
            setFolders(foldersData.folders);
            setCurrentFilters(state.currentFilters || {
              folderId: null,
              search: '',
              from: '',
              to: '',
              subject: '',
              body: '',
              hasAttachments: null
            });
            setCurrentSort(state.currentSort || {
              sortBy: 'date',
              sortDirection: 'newest'
            });
            setPagination(state.pagination || {
              total: 0,
              page: 1,
              limit: 50,
              totalPages: 0
            });

            // Load emails with restored filters
            const params = {
              page: state.pagination?.page || 1,
              limit: state.pagination?.limit || 50,
              sortBy: state.currentSort?.sortBy || 'date',
              sortDirection: state.currentSort?.sortDirection || 'newest'
            };

            if (state.currentFilters?.folderId) params.folderId = state.currentFilters.folderId;
            if (state.currentFilters?.search) params.search = state.currentFilters.search;
            if (state.currentFilters?.from) params.from = state.currentFilters.from;
            if (state.currentFilters?.to) params.to = state.currentFilters.to;
            if (state.currentFilters?.subject) params.subject = state.currentFilters.subject;
            if (state.currentFilters?.body) params.body = state.currentFilters.body;
            if (state.currentFilters?.hasAttachments !== null) {
              params.hasAttachments = state.currentFilters.hasAttachments;
            }

            const emailsData = await pstApi.getEmails(state.fileId, params);
            setEmails(emailsData.emails);
            setPagination(emailsData.pagination);
          } catch (err) {
            // PST file no longer available on backend, clear storage
            console.log('Saved PST file no longer available, clearing storage');
            localStorage.removeItem(PST_STORAGE_KEY);
          }
        }
      } catch (err) {
        console.error('Failed to restore PST state:', err);
        localStorage.removeItem(PST_STORAGE_KEY);
      }
    };

    restoreState();
  }, []);

  // Save state to localStorage whenever key state changes
  useEffect(() => {
    if (fileId && pstInfo) {
      const state = {
        fileId,
        pstInfo,
        currentFilters,
        currentSort,
        pagination
      };
      localStorage.setItem(PST_STORAGE_KEY, JSON.stringify(state));
    }
  }, [fileId, pstInfo, currentFilters, currentSort, pagination]);

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

  const searchEmails = useCallback(async (searchParams) => {
    if (!fileId) return;

    try {
      setLoading(true);
      setError(null);

      const params = {
        page: 1,
        limit: pagination.limit,
        sortBy: currentSort.sortBy,
        sortDirection: currentSort.sortDirection
      };

      // Add search query
      if (searchParams.query) {
        params.search = searchParams.query;
      }

      // Add advanced filters
      if (searchParams.filters) {
        if (searchParams.filters.from) params.from = searchParams.filters.from;
        if (searchParams.filters.to) params.to = searchParams.filters.to;
        if (searchParams.filters.subject) params.subject = searchParams.filters.subject;
        if (searchParams.filters.body) params.body = searchParams.filters.body;
        if (searchParams.filters.hasAttachments !== undefined) {
          params.hasAttachments = searchParams.filters.hasAttachments;
        }
      }

      // Add folder filter if active
      if (currentFilters.folderId) {
        params.folderId = currentFilters.folderId;
      }

      setCurrentFilters({
        ...currentFilters,
        search: searchParams.query || '',
        from: searchParams.filters?.from || '',
        to: searchParams.filters?.to || '',
        subject: searchParams.filters?.subject || '',
        body: searchParams.filters?.body || '',
        hasAttachments: searchParams.filters?.hasAttachments
      });

      const data = await pstApi.getEmails(fileId, params);
      setEmails(data.emails);
      setPagination(data.pagination);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to search emails');
      setLoading(false);
    }
  }, [fileId, pagination.limit, currentSort, currentFilters]);

  const filterByFolder = useCallback(async (folderId) => {
    if (!fileId) return;

    try {
      setLoading(true);
      setError(null);

      setCurrentFilters({
        folderId,
        search: '',
        from: '',
        to: '',
        subject: '',
        body: '',
        hasAttachments: null
      });

      const data = await pstApi.getEmails(fileId, {
        folderId,
        page: 1,
        limit: pagination.limit,
        sortBy: currentSort.sortBy,
        sortDirection: currentSort.sortDirection
      });
      setEmails(data.emails);
      setPagination(data.pagination);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to filter emails');
      setLoading(false);
    }
  }, [fileId, pagination.limit, currentSort]);

  const changePage = useCallback(async (newPage) => {
    if (!fileId) return;

    try {
      setLoading(true);
      setError(null);

      const params = {
        page: newPage,
        limit: pagination.limit,
        sortBy: currentSort.sortBy,
        sortDirection: currentSort.sortDirection
      };

      // Apply all active filters
      if (currentFilters.folderId) params.folderId = currentFilters.folderId;
      if (currentFilters.search) params.search = currentFilters.search;
      if (currentFilters.from) params.from = currentFilters.from;
      if (currentFilters.to) params.to = currentFilters.to;
      if (currentFilters.subject) params.subject = currentFilters.subject;
      if (currentFilters.body) params.body = currentFilters.body;
      if (currentFilters.hasAttachments !== null) params.hasAttachments = currentFilters.hasAttachments;

      const data = await pstApi.getEmails(fileId, params);
      setEmails(data.emails);
      setPagination(data.pagination);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load emails');
      setLoading(false);
    }
  }, [fileId, pagination.limit, currentFilters, currentSort]);

  const changePageSize = useCallback(async (newLimit) => {
    if (!fileId) return;

    try {
      setLoading(true);
      setError(null);

      const params = {
        page: 1, // Reset to first page when changing page size
        limit: newLimit,
        sortBy: currentSort.sortBy,
        sortDirection: currentSort.sortDirection
      };

      // Apply all active filters
      if (currentFilters.folderId) params.folderId = currentFilters.folderId;
      if (currentFilters.search) params.search = currentFilters.search;
      if (currentFilters.from) params.from = currentFilters.from;
      if (currentFilters.to) params.to = currentFilters.to;
      if (currentFilters.subject) params.subject = currentFilters.subject;
      if (currentFilters.body) params.body = currentFilters.body;
      if (currentFilters.hasAttachments !== null) params.hasAttachments = currentFilters.hasAttachments;

      const data = await pstApi.getEmails(fileId, params);
      setEmails(data.emails);
      setPagination(data.pagination);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load emails');
      setLoading(false);
    }
  }, [fileId, currentFilters, currentSort]);

  const changeSort = useCallback(async (sortBy, sortDirection) => {
    if (!fileId) return;

    try {
      setLoading(true);
      setError(null);

      setCurrentSort({ sortBy, sortDirection });

      const params = {
        page: 1, // Reset to first page when changing sort
        limit: pagination.limit,
        sortBy,
        sortDirection
      };

      // Apply all active filters
      if (currentFilters.folderId) params.folderId = currentFilters.folderId;
      if (currentFilters.search) params.search = currentFilters.search;
      if (currentFilters.from) params.from = currentFilters.from;
      if (currentFilters.to) params.to = currentFilters.to;
      if (currentFilters.subject) params.subject = currentFilters.subject;
      if (currentFilters.body) params.body = currentFilters.body;
      if (currentFilters.hasAttachments !== null) params.hasAttachments = currentFilters.hasAttachments;

      const data = await pstApi.getEmails(fileId, params);
      setEmails(data.emails);
      setPagination(data.pagination);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to sort emails');
      setLoading(false);
    }
  }, [fileId, pagination.limit, currentFilters]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const closePST = useCallback(() => {
    setFileId(null);
    setPstInfo(null);
    setFolders([]);
    setEmails([]);
    setCurrentEmail(null);
    setCurrentFilters({
      folderId: null,
      search: '',
      from: '',
      to: '',
      subject: '',
      body: '',
      hasAttachments: null
    });
    setCurrentSort({
      sortBy: 'date',
      sortDirection: 'newest'
    });
    setPagination({
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0
    });
    localStorage.removeItem(PST_STORAGE_KEY);
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
    currentSort,
    uploadPST,
    loadEmails,
    loadEmailById,
    searchEmails,
    filterByFolder,
    changePage,
    changePageSize,
    changeSort,
    clearError,
    setCurrentEmail,
    closePST
  };
}

import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 1800000 // 30 minute timeout for large file processing
});

export const pstApi = {
  /**
   * Upload PST file
   */
  uploadPST: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('pstFile', file);

    const response = await api.post('/pst/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 1800000, // 30 minute timeout for large files
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      }
    });

    return response.data;
  },

  /**
   * Get PST file info
   */
  getPSTInfo: async (fileId) => {
    const response = await api.get(`/pst/${fileId}/info`);
    return response.data;
  },

  /**
   * Get folder structure
   */
  getFolders: async (fileId) => {
    const response = await api.get(`/pst/${fileId}/folders`);
    return response.data;
  },

  /**
   * Get emails with optional filters
   */
  getEmails: async (fileId, params = {}) => {
    const response = await api.get(`/pst/${fileId}/emails`, { params });
    return response.data;
  },

  /**
   * Get specific email by ID
   */
  getEmailById: async (fileId, emailId) => {
    const response = await api.get(`/pst/${fileId}/emails/${emailId}`);
    return response.data;
  }
};

export default api;

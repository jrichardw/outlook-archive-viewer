export default {
  port: process.env.PORT || 3001,
  maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB) || 0, // 0 = unlimited
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  corsOrigin: process.env.CORS_ORIGIN || '*'
};

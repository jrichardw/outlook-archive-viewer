import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = join(__dirname, '../../uploads');
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = uuidv4();
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

// File filter for PST files
const pstFileFilter = (req, file, cb) => {
  if (file.originalname.toLowerCase().endsWith('.pst')) {
    cb(null, true);
  } else {
    cb(new Error('Only .pst files are allowed'), false);
  }
};

// File filter for MSG files
const msgFileFilter = (req, file, cb) => {
  if (file.originalname.toLowerCase().endsWith('.msg')) {
    cb(null, true);
  } else {
    cb(new Error('Only .msg files are allowed'), false);
  }
};

// Calculate file size limit (0 = unlimited)
const fileSizeLimit = config.maxFileSizeMB === 0
  ? Infinity
  : config.maxFileSizeMB * 1024 * 1024;

// Configure multer for PST files
const pstUpload = multer({
  storage: storage,
  fileFilter: pstFileFilter,
  limits: {
    fileSize: fileSizeLimit
  }
});

// Configure multer for MSG files (smaller size limit)
const msgUpload = multer({
  storage: storage,
  fileFilter: msgFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit for MSG files
  }
});

// Default export for PST (backward compatibility)
export default pstUpload;

// Named exports
export { pstUpload, msgUpload };

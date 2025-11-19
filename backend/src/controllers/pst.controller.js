import { parsePSTFile, deletePSTFile } from '../utils/pst.parser.js';

// In-memory storage for parsed PST data (in production, use a database)
const pstCache = new Map();

/**
 * Upload and parse PST file
 */
export async function uploadPST(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileId = req.file.filename;

    console.log(`📥 Processing PST file: ${req.file.originalname}`);
    console.log(`   Size: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);

    // Parse the PST file
    const parsedData = await parsePSTFile(filePath);

    // Store in cache
    pstCache.set(fileId, {
      ...parsedData,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      uploadedAt: new Date().toISOString()
    });

    // Delete the uploaded file to save space
    deletePSTFile(filePath);

    console.log(`✅ Successfully parsed: ${parsedData.totalEmails} emails in ${parsedData.totalFolders} folders`);

    res.json({
      success: true,
      fileId: fileId,
      fileName: req.file.originalname,
      totalEmails: parsedData.totalEmails,
      totalFolders: parsedData.totalFolders
    });

  } catch (error) {
    console.error('Error processing PST file:', error);

    // Clean up file if it exists
    if (req.file) {
      deletePSTFile(req.file.path);
    }

    next(error);
  }
}

/**
 * Get folder structure
 */
export function getFolders(req, res) {
  const { fileId } = req.params;

  const data = pstCache.get(fileId);
  if (!data) {
    return res.status(404).json({ error: 'PST file not found. Please upload again.' });
  }

  res.json({
    folders: data.folders,
    totalFolders: data.totalFolders
  });
}

/**
 * Get emails from specific folder or all emails
 */
export function getEmails(req, res) {
  const { fileId } = req.params;
  const { folderId, search, page = 1, limit = 50 } = req.query;

  const data = pstCache.get(fileId);
  if (!data) {
    return res.status(404).json({ error: 'PST file not found. Please upload again.' });
  }

  let emails = data.emails;

  // Filter by folder if specified
  if (folderId) {
    emails = emails.filter(email => email.folderId == folderId);
  }

  // Search functionality
  if (search) {
    const searchLower = search.toLowerCase();
    emails = emails.filter(email =>
      email.subject.toLowerCase().includes(searchLower) ||
      email.senderName.toLowerCase().includes(searchLower) ||
      email.senderEmail.toLowerCase().includes(searchLower) ||
      email.body.toLowerCase().includes(searchLower)
    );
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedEmails = emails.slice(startIndex, endIndex);

  res.json({
    emails: paginatedEmails,
    pagination: {
      total: emails.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(emails.length / limit)
    }
  });
}

/**
 * Get single email details
 */
export function getEmailById(req, res) {
  const { fileId, emailId } = req.params;

  const data = pstCache.get(fileId);
  if (!data) {
    return res.status(404).json({ error: 'PST file not found. Please upload again.' });
  }

  const email = data.emails.find(e => e.id == emailId);
  if (!email) {
    return res.status(404).json({ error: 'Email not found' });
  }

  res.json(email);
}

/**
 * Get PST file info
 */
export function getPSTInfo(req, res) {
  const { fileId } = req.params;

  const data = pstCache.get(fileId);
  if (!data) {
    return res.status(404).json({ error: 'PST file not found. Please upload again.' });
  }

  res.json({
    fileName: data.fileName,
    fileSize: data.fileSize,
    uploadedAt: data.uploadedAt,
    totalEmails: data.totalEmails,
    totalFolders: data.totalFolders
  });
}

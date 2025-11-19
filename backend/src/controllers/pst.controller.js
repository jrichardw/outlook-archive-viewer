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
    console.log(`   Path: ${filePath}`);
    console.log(`⏳ Starting PST parsing... (this may take several minutes for large files)`);

    const startTime = Date.now();

    // Parse the PST file
    const parsedData = await parsePSTFile(filePath);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`⏱️  Parsing completed in ${duration} seconds`);

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
    console.error('❌ Error processing PST file:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      file: req.file ? req.file.originalname : 'unknown'
    });

    // Clean up file if it exists
    if (req.file) {
      deletePSTFile(req.file.path);
    }

    // Send more detailed error response
    res.status(500).json({
      error: `Failed to process PST file: ${error.message}`,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
  const {
    fileId
  } = req.params;
  const {
    folderId,
    search,
    // Advanced search filters
    from,
    to,
    subject,
    body,
    hasAttachments,
    // Sorting
    sortBy = 'date',
    sortDirection = 'newest',
    // Pagination
    page = 1,
    limit = 50
  } = req.query;

  const data = pstCache.get(fileId);
  if (!data) {
    return res.status(404).json({
      error: 'PST file not found. Please upload again.'
    });
  }

  let emails = data.emails;

  // Filter by folder if specified
  if (folderId) {
    emails = emails.filter(email => email.folderId == folderId);
  }

  // Advanced search filters
  if (from) {
    const fromLower = from.toLowerCase();
    emails = emails.filter(email =>
      email.senderName.toLowerCase().includes(fromLower) ||
      email.senderEmail.toLowerCase().includes(fromLower)
    );
  }

  if (to) {
    const toLower = to.toLowerCase();
    emails = emails.filter(email =>
      email.recipients.toLowerCase().includes(toLower)
    );
  }

  if (subject) {
    const subjectLower = subject.toLowerCase();
    emails = emails.filter(email =>
      email.subject.toLowerCase().includes(subjectLower)
    );
  }

  if (body) {
    const bodyLower = body.toLowerCase();
    emails = emails.filter(email =>
      email.body.toLowerCase().includes(bodyLower) ||
      email.bodyHTML.toLowerCase().includes(bodyLower)
    );
  }

  if (hasAttachments !== undefined) {
    const wantsAttachments = hasAttachments === 'true';
    emails = emails.filter(email => email.hasAttachments === wantsAttachments);
  }

  // Basic search (searches all fields if no advanced filters)
  if (search && !from && !to && !subject && !body) {
    const searchLower = search.toLowerCase();
    emails = emails.filter(email =>
      email.subject.toLowerCase().includes(searchLower) ||
      email.senderName.toLowerCase().includes(searchLower) ||
      email.senderEmail.toLowerCase().includes(searchLower) ||
      email.recipients.toLowerCase().includes(searchLower) ||
      email.body.toLowerCase().includes(searchLower)
    );
  }

  // Sorting
  emails = [...emails]; // Create copy to avoid mutating original

  switch (sortBy) {
    case 'date':
      emails.sort((a, b) => {
        const dateA = new Date(a.receivedTime || a.sentTime || 0);
        const dateB = new Date(b.receivedTime || b.sentTime || 0);
        return sortDirection === 'newest' ? dateB - dateA : dateA - dateB;
      });
      break;

    case 'from':
      emails.sort((a, b) => {
        const comparison = a.senderName.localeCompare(b.senderName);
        return sortDirection === 'asc' ? comparison : -comparison;
      });
      break;

    case 'subject':
      emails.sort((a, b) => {
        const comparison = a.subject.localeCompare(b.subject);
        return sortDirection === 'asc' ? comparison : -comparison;
      });
      break;

    case 'size':
      emails.sort((a, b) => {
        return sortDirection === 'largest' ? (b.size || 0) - (a.size || 0) : (a.size || 0) - (b.size || 0);
      });
      break;

    case 'importance':
      emails.sort((a, b) => {
        return sortDirection === 'high' ? (b.importance || 0) - (a.importance || 0) : (a.importance || 0) - (b.importance || 0);
      });
      break;

    default:
      // Default to date sort
      emails.sort((a, b) => {
        const dateA = new Date(a.receivedTime || a.sentTime || 0);
        const dateB = new Date(b.receivedTime || b.sentTime || 0);
        return dateB - dateA;
      });
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

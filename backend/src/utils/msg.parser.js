import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const MsgReader = require('@kenjiuno/msgreader').default;

/**
 * Parse an MSG file buffer and extract email data
 * @param {Buffer} fileBuffer - The MSG file buffer
 * @returns {Object} Parsed email data
 */
export function parseMSGFile(fileBuffer) {
  try {
    const msgReader = new MsgReader(fileBuffer);
    const fileData = msgReader.getFileData();

    // Extract email properties
    const email = {
      subject: fileData.subject || '(No Subject)',
      senderName: fileData.senderName || 'Unknown',
      senderEmail: fileData.senderEmail || '',
      recipients: formatRecipients(fileData.recipients),
      recipientsList: fileData.recipients || [],
      sentTime: fileData.creationTime || fileData.clientSubmitTime || new Date().toISOString(),
      receivedTime: fileData.messageDeliveryTime || fileData.creationTime || new Date().toISOString(),
      body: fileData.body || '',
      bodyHTML: fileData.bodyHTML || '',
      hasAttachments: (fileData.attachments && fileData.attachments.length > 0) || false,
      attachments: formatAttachments(fileData.attachments),
      importance: getImportance(fileData.importance),
      size: fileBuffer.length,
      headers: fileData.headers || {}
    };

    return email;
  } catch (error) {
    console.error('Error parsing MSG file:', error);
    throw new Error(`Failed to parse MSG file: ${error.message}`);
  }
}

/**
 * Format recipients into a readable string
 * @param {Array} recipients - Array of recipient objects
 * @returns {string} Formatted recipients string
 */
function formatRecipients(recipients) {
  if (!recipients || recipients.length === 0) {
    return 'Unknown';
  }

  return recipients
    .map(recipient => {
      if (recipient.name && recipient.email) {
        return `${recipient.name} <${recipient.email}>`;
      }
      return recipient.name || recipient.email || 'Unknown';
    })
    .join('; ');
}

/**
 * Format attachments data
 * @param {Array} attachments - Array of attachment objects
 * @returns {Array} Formatted attachments array
 */
function formatAttachments(attachments) {
  if (!attachments || attachments.length === 0) {
    return [];
  }

  return attachments.map(attachment => ({
    filename: attachment.fileName || attachment.name || 'Unnamed',
    size: attachment.dataLength || attachment.contentLength || 0,
    contentType: attachment.mimeType || 'application/octet-stream',
    content: attachment.content // Binary content
  }));
}

/**
 * Get importance level
 * @param {number} importance - Importance flag
 * @returns {string} Importance level
 */
function getImportance(importance) {
  if (importance === 2) return 'High';
  if (importance === 0) return 'Low';
  return 'Normal';
}

/**
 * Validate if a file is an MSG file
 * @param {Buffer} fileBuffer - File buffer to validate
 * @returns {boolean} True if valid MSG file
 */
export function isMSGFile(fileBuffer) {
  try {
    // MSG files start with specific magic bytes (CFB header)
    // Check for compound file binary format signature
    const signature = fileBuffer.slice(0, 8);
    const expected = Buffer.from([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]);

    return signature.equals(expected);
  } catch (error) {
    return false;
  }
}

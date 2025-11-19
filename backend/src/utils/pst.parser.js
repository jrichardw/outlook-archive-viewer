import PSTFile from 'pst-extractor';
import fs from 'fs';

/**
 * Extract folder structure and emails from PST file
 */
export async function parsePSTFile(filePath) {
  return new Promise((resolve, reject) => {
    try {
      const pstFile = new PSTFile(filePath);
      const folders = [];
      const emails = [];
      let emailId = 0;

      // Recursive function to process folders
      function processFolder(folder, parentPath = '') {
        const folderPath = parentPath ? `${parentPath}/${folder.displayName}` : folder.displayName;

        const folderData = {
          id: folder.descriptorNodeId || folders.length,
          name: folder.displayName,
          path: folderPath,
          contentCount: folder.contentCount || 0,
          hasSubfolders: folder.hasSubfolders || false,
          children: []
        };

        folders.push(folderData);

        // Process emails in this folder
        if (folder.contentCount > 0) {
          try {
            let email = folder.getNextChild();
            while (email) {
              try {
                const emailData = {
                  id: emailId++,
                  folderId: folderData.id,
                  folderName: folder.displayName,
                  folderPath: folderPath,
                  subject: email.subject || '(No Subject)',
                  senderName: email.senderName || email.sentRepresentingName || 'Unknown',
                  senderEmail: email.senderEmailAddress || email.sentRepresentingEmailAddress || '',
                  recipients: email.displayTo || '',
                  receivedTime: email.messageDeliveryTime ? email.messageDeliveryTime.toISOString() : null,
                  sentTime: email.clientSubmitTime ? email.clientSubmitTime.toISOString() : null,
                  hasAttachments: email.hasAttachments || false,
                  attachmentCount: email.numberOfAttachments || 0,
                  importance: email.importance || 1,
                  messageClass: email.messageClass || '',
                  body: email.body || '',
                  bodyHTML: email.bodyHTML || '',
                  size: email.messageSize || 0,
                  conversationTopic: email.conversationTopic || '',
                  internetMessageId: email.internetMessageId || '',
                  // Attachment details
                  attachments: []
                };

                // Extract attachments if present
                if (email.hasAttachments && email.numberOfAttachments > 0) {
                  try {
                    for (let i = 0; i < email.numberOfAttachments; i++) {
                      const attachment = email.getAttachment(i);
                      if (attachment) {
                        emailData.attachments.push({
                          filename: attachment.longFilename || attachment.filename || `attachment_${i}`,
                          size: attachment.size || 0,
                          mimeType: attachment.mimeTag || 'application/octet-stream'
                        });
                      }
                    }
                  } catch (attachErr) {
                    console.warn('Error extracting attachments:', attachErr.message);
                  }
                }

                emails.push(emailData);
              } catch (emailErr) {
                console.warn('Error processing email:', emailErr.message);
              }

              email = folder.getNextChild();
            }
          } catch (childErr) {
            console.warn('Error reading folder children:', childErr.message);
          }
        }

        // Process subfolders recursively
        if (folder.hasSubfolders) {
          try {
            let subFolder = folder.getNextSubFolder();
            while (subFolder) {
              const childData = processFolder(subFolder, folderPath);
              folderData.children.push(childData);
              subFolder = folder.getNextSubFolder();
            }
          } catch (subErr) {
            console.warn('Error processing subfolders:', subErr.message);
          }
        }

        return folderData;
      }

      // Start processing from root folder
      const rootFolder = pstFile.getRootFolder();
      const rootData = processFolder(rootFolder);

      resolve({
        folders: [rootData],
        emails: emails,
        totalEmails: emails.length,
        totalFolders: folders.length
      });

    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Delete PST file after processing
 */
export function deletePSTFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted PST file: ${filePath}`);
    }
  } catch (error) {
    console.error('Error deleting PST file:', error);
  }
}

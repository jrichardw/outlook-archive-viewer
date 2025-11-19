import express from 'express';
import upload from '../middleware/upload.js';
import * as pstController from '../controllers/pst.controller.js';

const router = express.Router();

// Upload PST file
router.post('/upload', upload.single('pstFile'), pstController.uploadPST);

// Get PST file info
router.get('/:fileId/info', pstController.getPSTInfo);

// Get folder structure
router.get('/:fileId/folders', pstController.getFolders);

// Get emails
router.get('/:fileId/emails', pstController.getEmails);

// Get specific email
router.get('/:fileId/emails/:emailId', pstController.getEmailById);

export default router;

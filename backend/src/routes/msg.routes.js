import express from 'express';
import { uploadMSG } from '../controllers/msg.controller.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Upload and parse MSG file
router.post('/upload', upload.single('file'), uploadMSG);

export default router;

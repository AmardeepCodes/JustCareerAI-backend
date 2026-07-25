import express from 'express';
import multer from 'multer';
import { verifyToken } from '../middlewares/verifyToken.js';
import { analyzeResumeOnly } from '../controllers/resumeAnalysisController.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post('/analyze', verifyToken, upload.single('resume'), analyzeResumeOnly);

export default router;
 
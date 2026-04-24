import express from 'express';
import { generateQuestions, evaluateAnswer, getInterviewResult } from '../controllers/interviewController.js';

const router = express.Router();

router.post('/generate', generateQuestions);
router.post('/evaluate', evaluateAnswer);
router.get('/:id', getInterviewResult);

export default router;

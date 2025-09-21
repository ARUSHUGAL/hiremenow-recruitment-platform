import { Router } from 'express';
import { body, param } from 'express-validator';
import { authMiddleware, requireAnyRole, AuthenticatedRequest } from '../middleware/auth';
import { validateRequest } from '../utils/validation';
import { ResponseHandler } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';
import { firestore } from '../config/firebase';
import { VideoCall } from '../types';
import { AIService } from '../services/aiService';
import { NotificationService } from '../services/notificationService';
import multer from 'multer';

const router = Router();

// Configure multer for audio uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
});

// Apply authentication to all routes
router.use(authMiddleware);

/**
 * POST /api/calls/:callId/transcript
 * Upload audio and generate transcript
 */
router.post('/:callId/transcript', requireAnyRole, [
  param('callId').isString().withMessage('Call ID must be a string'),
], validateRequest, upload.single('audio'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.file) {
      ResponseHandler.error(res, 'No audio file provided', 400);
      return;
    }

    const callDoc = await firestore.collection('calls').doc(req.params.callId).get();
    if (!callDoc.exists) {
      ResponseHandler.notFound(res, 'Call not found');
      return;
    }

    const callData = callDoc.data() as VideoCall;
    
    // Verify user is part of this call
    if (callData.candidateId !== req.user!.uid && callData.recruiterId !== req.user!.uid) {
      ResponseHandler.forbidden(res, 'Access denied');
      return;
    }

    // Generate transcript using Whisper
    const transcript = await AIService.transcribeAudio(req.file.buffer);
    
    // Update call with transcript
    await firestore.collection('calls').doc(req.params.callId).update({
      transcript,
      updatedAt: new Date(),
    });

    ResponseHandler.success(res, { transcript }, 'Transcript generated successfully');
  } catch (error) {
    console.error('Error generating transcript:', error);
    ResponseHandler.error(res, 'Failed to generate transcript', 500);
  }
}));

/**
 * POST /api/calls/:callId/summary
 * Generate AI summary from transcript
 */
router.post('/:callId/summary', requireAnyRole, [
  param('callId').isString().withMessage('Call ID must be a string'),
], validateRequest, asyncHandler(async (req: AuthenticatedRequest, res) => {
  try {
    const callDoc = await firestore.collection('calls').doc(req.params.callId).get();
    if (!callDoc.exists) {
      ResponseHandler.notFound(res, 'Call not found');
      return;
    }

    const callData = callDoc.data() as VideoCall;
    
    // Verify user is part of this call
    if (callData.candidateId !== req.user!.uid && callData.recruiterId !== req.user!.uid) {
      ResponseHandler.forbidden(res, 'Access denied');
      return;
    }

    if (!callData.transcript) {
      ResponseHandler.error(res, 'No transcript available for this call', 400);
      return;
    }

    // Generate AI summary
    const summary = await AIService.generateCallSummary(callData.transcript);
    
    // Update call with summary
    await firestore.collection('calls').doc(req.params.callId).update({
      aiSummary: summary,
      updatedAt: new Date(),
    });

    // Send summary to recruiter if they're not the one requesting
    if (req.user!.uid !== callData.recruiterId) {
      await NotificationService.sendCallSummaryToRecruiter(callData, summary);
    }

    ResponseHandler.success(res, summary, 'Summary generated successfully');
  } catch (error) {
    console.error('Error generating summary:', error);
    ResponseHandler.error(res, 'Failed to generate summary', 500);
  }
}));

/**
 * GET /api/calls/:callId/transcript
 * Get call transcript
 */
router.get('/:callId/transcript', requireAnyRole, [
  param('callId').isString().withMessage('Call ID must be a string'),
], validateRequest, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const callDoc = await firestore.collection('calls').doc(req.params.callId).get();
  if (!callDoc.exists) {
    ResponseHandler.notFound(res, 'Call not found');
    return;
  }

  const callData = callDoc.data() as VideoCall;
  
  // Verify user is part of this call
  if (callData.candidateId !== req.user!.uid && callData.recruiterId !== req.user!.uid) {
    ResponseHandler.forbidden(res, 'Access denied');
    return;
  }

  ResponseHandler.success(res, { transcript: callData.transcript }, 'Transcript retrieved successfully');
}));

/**
 * GET /api/calls/:callId/summary
 * Get call AI summary
 */
router.get('/:callId/summary', requireAnyRole, [
  param('callId').isString().withMessage('Call ID must be a string'),
], validateRequest, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const callDoc = await firestore.collection('calls').doc(req.params.callId).get();
  if (!callDoc.exists) {
    ResponseHandler.notFound(res, 'Call not found');
    return;
  }

  const callData = callDoc.data() as VideoCall;
  
  // Verify user is part of this call
  if (callData.candidateId !== req.user!.uid && callData.recruiterId !== req.user!.uid) {
    ResponseHandler.forbidden(res, 'Access denied');
    return;
  }

  ResponseHandler.success(res, { summary: callData.aiSummary }, 'Summary retrieved successfully');
}));

/**
 * GET /api/calls/:callId/details
 * Get complete call details
 */
router.get('/:callId/details', requireAnyRole, [
  param('callId').isString().withMessage('Call ID must be a string'),
], validateRequest, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const callDoc = await firestore.collection('calls').doc(req.params.callId).get();
  if (!callDoc.exists) {
    ResponseHandler.notFound(res, 'Call not found');
    return;
  }

  const callData = callDoc.data() as VideoCall;
  
  // Verify user is part of this call
  if (callData.candidateId !== req.user!.uid && callData.recruiterId !== req.user!.uid) {
    ResponseHandler.forbidden(res, 'Access denied');
    return;
  }

  // Get participant details
  const [candidateDoc, recruiterDoc] = await Promise.all([
    firestore.collection('candidates').doc(callData.candidateId).get(),
    firestore.collection('recruiters').doc(callData.recruiterId).get(),
  ]);

  const candidate = candidateDoc.exists ? candidateDoc.data() : null;
  const recruiter = recruiterDoc.exists ? recruiterDoc.data() : null;

  const response = {
    id: callDoc.id,
    ...callData,
    candidate: candidate ? {
      id: candidate.id,
      displayName: candidate.displayName,
      skills: candidate.skills,
      experience: candidate.experience,
      location: candidate.location,
      photoURL: candidate.photoURL,
    } : null,
    recruiter: recruiter ? {
      id: recruiter.id,
      displayName: recruiter.displayName,
      company: recruiter.company,
      photoURL: recruiter.photoURL,
    } : null,
  };

  ResponseHandler.success(res, response, 'Call details retrieved successfully');
}));

/**
 * PUT /api/calls/:callId/status
 * Update call status
 */
router.put('/:callId/status', requireAnyRole, [
  param('callId').isString().withMessage('Call ID must be a string'),
  body('status').isIn(['waiting', 'active', 'ended', 'expired']).withMessage('Invalid status'),
], validateRequest, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const callDoc = await firestore.collection('calls').doc(req.params.callId).get();
  if (!callDoc.exists) {
    ResponseHandler.notFound(res, 'Call not found');
    return;
  }

  const callData = callDoc.data() as VideoCall;
  
  // Verify user is part of this call
  if (callData.candidateId !== req.user!.uid && callData.recruiterId !== req.user!.uid) {
    ResponseHandler.forbidden(res, 'Access denied');
    return;
  }

  const updateData: any = {
    status: req.body.status,
    updatedAt: new Date(),
  };

  // Set timestamps based on status
  if (req.body.status === 'active' && !callData.startTime) {
    updateData.startTime = new Date();
  } else if (req.body.status === 'ended' && callData.startTime) {
    updateData.endTime = new Date();
    updateData.duration = Math.floor((new Date().getTime() - callData.startTime.getTime()) / 1000);
  }

  await firestore.collection('calls').doc(req.params.callId).update(updateData);

  ResponseHandler.success(res, { status: req.body.status }, 'Call status updated successfully');
}));

/**
 * POST /api/calls/:callId/feedback
 * Add feedback to call (for candidates)
 */
router.post('/:callId/feedback', requireAnyRole, [
  param('callId').isString().withMessage('Call ID must be a string'),
  body('feedback').isString().withMessage('Feedback must be a string'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
], validateRequest, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const callDoc = await firestore.collection('calls').doc(req.params.callId).get();
  if (!callDoc.exists) {
    ResponseHandler.notFound(res, 'Call not found');
    return;
  }

  const callData = callDoc.data() as VideoCall;
  
  // Verify user is part of this call
  if (callData.candidateId !== req.user!.uid && callData.recruiterId !== req.user!.uid) {
    ResponseHandler.forbidden(res, 'Access denied');
    return;
  }

  const feedback = {
    userId: req.user!.uid,
    userRole: req.user!.role,
    feedback: req.body.feedback,
    rating: req.body.rating,
    timestamp: new Date(),
  };

  await firestore.collection('calls').doc(req.params.callId).update({
    feedback: feedback,
    updatedAt: new Date(),
  });

  ResponseHandler.success(res, feedback, 'Feedback added successfully');
}));

export default router;

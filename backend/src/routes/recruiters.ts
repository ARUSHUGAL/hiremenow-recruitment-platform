import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authMiddleware, requireRecruiter, AuthenticatedRequest } from '../middleware/auth';
import { validateRequest, validatePagination } from '../utils/validation';
import { ResponseHandler } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';
import { firestore } from '../config/firebase';
import { RecruiterProfile, MatchingConstraints } from '../types';
import { MatchingService } from '@/services/matchingService';

const router = Router();

// Apply authentication to all routes
router.use(authMiddleware);

/**
 * GET /api/recruiters/profile
 * Get current recruiter's profile
 */
router.get('/profile', requireRecruiter, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const recruiterDoc = await firestore.collection('recruiters').doc(req.user!.uid).get();
  
  if (!recruiterDoc.exists) {
    ResponseHandler.notFound(res, 'Recruiter profile not found');
    return;
  }

  const recruiterData = recruiterDoc.data() as RecruiterProfile;
  ResponseHandler.success(res, recruiterData, 'Profile retrieved successfully');
}));

/**
 * PUT /api/recruiters/profile
 * Update recruiter's profile
 */
router.put('/profile', requireRecruiter, [
  body('company').isString().withMessage('Company must be a string'),
  body('position').isString().withMessage('Position must be a string'),
  body('bio').optional().isString().withMessage('Bio must be a string'),
  body('companySize').isIn(['startup', 'small', 'medium', 'large', 'enterprise']).withMessage('Invalid company size'),
  body('industry').isString().withMessage('Industry must be a string'),
], validateRequest, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const updateData = {
    ...req.body,
    updatedAt: new Date(),
  };

  await firestore.collection('recruiters').doc(req.user!.uid).update(updateData);
  
  ResponseHandler.success(res, updateData, 'Profile updated successfully');
}));

/**
 * POST /api/recruiters/profile
 * Create recruiter's profile
 */
router.post('/profile', requireRecruiter, [
  body('company').isString().withMessage('Company must be a string'),
  body('position').isString().withMessage('Position must be a string'),
  body('bio').optional().isString().withMessage('Bio must be a string'),
  body('companySize').isIn(['startup', 'small', 'medium', 'large', 'enterprise']).withMessage('Invalid company size'),
  body('industry').isString().withMessage('Industry must be a string'),
], validateRequest, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const recruiterData = {
    ...req.body,
    uid: req.user!.uid,
    email: req.user!.email,
    role: 'recruiter',
    isOnline: true,
    lastSeen: new Date(),
    matchingConstraints: MatchingService.createDefaultConstraints(),
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await firestore.collection('recruiters').doc(req.user!.uid).set(recruiterData);
  
  ResponseHandler.success(res, recruiterData, 'Profile created successfully', 201);
}));

/**
 * PUT /api/recruiters/constraints
 * Update matching constraints
 */
router.put('/constraints', requireRecruiter, [
  body('hardConstraints').isArray().withMessage('Hard constraints must be an array'),
  body('softConstraints').isArray().withMessage('Soft constraints must be an array'),
  body('softConstraintThreshold').isNumeric().withMessage('Soft constraint threshold must be a number'),
  body('softConstraintThreshold').isFloat({ min: 0, max: 1 }).withMessage('Threshold must be between 0 and 1'),
], validateRequest, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const constraints: MatchingConstraints = {
    hardConstraints: req.body.hardConstraints,
    softConstraints: req.body.softConstraints,
    softConstraintThreshold: req.body.softConstraintThreshold,
  };

  await MatchingService.updateRecruiterConstraints(req.user!.uid, constraints);
  
  ResponseHandler.success(res, constraints, 'Matching constraints updated successfully');
}));

/**
 * GET /api/recruiters/constraints
 * Get current matching constraints
 */
router.get('/constraints', requireRecruiter, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const recruiterDoc = await firestore.collection('recruiters').doc(req.user!.uid).get();
  
  if (!recruiterDoc.exists) {
    ResponseHandler.notFound(res, 'Recruiter profile not found');
    return;
  }

  const recruiterData = recruiterDoc.data() as RecruiterProfile;
  ResponseHandler.success(res, recruiterData.matchingConstraints, 'Constraints retrieved successfully');
}));

/**
 * PUT /api/recruiters/active
 * Toggle recruiter active status
 */
router.put('/active', requireRecruiter, [
  body('isActive').isBoolean().withMessage('isActive must be a boolean'),
], validateRequest, asyncHandler(async (req: AuthenticatedRequest, res) => {
  await firestore.collection('recruiters').doc(req.user!.uid).update({
    isActive: req.body.isActive,
    updatedAt: new Date(),
  });

  ResponseHandler.success(res, { isActive: req.body.isActive }, 'Active status updated successfully');
}));

/**
 * GET /api/recruiters/calls
 * Get recruiter's call history
 */
router.get('/calls', requireRecruiter, validatePagination, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  const callsSnapshot = await firestore
    .collection('calls')
    .where('recruiterId', '==', req.user!.uid)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .offset(offset)
    .get();

  const calls = [];
  callsSnapshot.forEach(doc => {
    calls.push({ id: doc.id, ...doc.data() });
  });

  // Get total count
  const totalSnapshot = await firestore
    .collection('calls')
    .where('recruiterId', '==', req.user!.uid)
    .get();

  ResponseHandler.success(res, {
    calls,
    pagination: {
      page,
      limit,
      total: totalSnapshot.size,
      pages: Math.ceil(totalSnapshot.size / limit),
    },
  }, 'Call history retrieved successfully');
}));

/**
 * GET /api/recruiters/calls/:callId
 * Get specific call details
 */
router.get('/calls/:callId', requireRecruiter, [
  param('callId').isString().withMessage('Call ID must be a string'),
], validateRequest, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const callDoc = await firestore.collection('calls').doc(req.params.callId).get();
  
  if (!callDoc.exists) {
    ResponseHandler.notFound(res, 'Call not found');
    return;
  }

  const callData = callDoc.data();
  
  // Verify recruiter owns this call
  if (callData?.recruiterId !== req.user!.uid) {
    ResponseHandler.forbidden(res, 'Access denied');
    return;
  }

  ResponseHandler.success(res, { id: callDoc.id, ...callData }, 'Call details retrieved successfully');
}));

/**
 * POST /api/recruiters/calls/:callId/decision
 * Make a decision on a candidate
 */
router.post('/calls/:callId/decision', requireRecruiter, [
  param('callId').isString().withMessage('Call ID must be a string'),
  body('decision').isIn(['YES', 'NO', 'MAYBE']).withMessage('Decision must be YES, NO, or MAYBE'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
  body('priority').optional().isIn(['high', 'medium', 'low']).withMessage('Priority must be high, medium, or low'),
], validateRequest, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const callDoc = await firestore.collection('calls').doc(req.params.callId).get();
  
  if (!callDoc.exists) {
    ResponseHandler.notFound(res, 'Call not found');
    return;
  }

  const callData = callDoc.data();
  
  // Verify recruiter owns this call
  if (callData?.recruiterId !== req.user!.uid) {
    ResponseHandler.forbidden(res, 'Access denied');
    return;
  }

  // Check if call has ended
  if (callData?.status !== 'ended') {
    ResponseHandler.error(res, 'Can only make decisions on completed calls', 400);
    return;
  }

  const decision = {
    decision: req.body.decision,
    notes: req.body.notes,
    priority: req.body.priority,
    timestamp: new Date(),
  };

  await firestore.collection('calls').doc(req.params.callId).update({
    recruiterDecision: decision,
  });

  // Send notification to candidate
  const { NotificationService } = await import('@/services/notificationService');
  await NotificationService.sendDecisionNotification(callData, req.body.decision, req.body.notes);

  ResponseHandler.success(res, decision, 'Decision saved successfully');
}));

/**
 * GET /api/recruiters/stats
 * Get recruiter statistics
 */
router.get('/stats', requireRecruiter, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const callsSnapshot = await firestore
    .collection('calls')
    .where('recruiterId', '==', req.user!.uid)
    .get();

  const calls = [];
  callsSnapshot.forEach(doc => {
    calls.push(doc.data());
  });

  const stats = {
    totalCalls: calls.length,
    completedCalls: calls.filter(call => call.status === 'ended').length,
    pendingCalls: calls.filter(call => call.status === 'waiting' || call.status === 'active').length,
    yesDecisions: calls.filter(call => call.recruiterDecision?.decision === 'YES').length,
    noDecisions: calls.filter(call => call.recruiterDecision?.decision === 'NO').length,
    maybeDecisions: calls.filter(call => call.recruiterDecision?.decision === 'MAYBE').length,
    averageCallDuration: calls
      .filter(call => call.duration)
      .reduce((sum, call) => sum + call.duration, 0) / calls.filter(call => call.duration).length || 0,
    averageMatchScore: calls
      .filter(call => call.matchScore)
      .reduce((sum, call) => sum + call.matchScore, 0) / calls.filter(call => call.matchScore).length || 0,
  };

  ResponseHandler.success(res, stats, 'Statistics retrieved successfully');
}));

export default router;

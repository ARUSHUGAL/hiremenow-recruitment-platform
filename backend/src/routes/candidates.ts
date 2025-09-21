import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authMiddleware, requireCandidate, AuthenticatedRequest } from '../middleware/auth';
import { validateRequest, validatePagination } from '../utils/validation';
import { ResponseHandler } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';
import { firestore } from '../config/firebase';
import { Candidate, SearchParams } from '../types';

const router = Router();

// Apply authentication to all routes
router.use(authMiddleware);

/**
 * GET /api/candidates/profile
 * Get current candidate's profile
 */
router.get('/profile', requireCandidate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const candidateDoc = await firestore.collection('candidates').doc(req.user!.uid).get();
  
  if (!candidateDoc.exists) {
    ResponseHandler.notFound(res, 'Candidate profile not found');
    return;
  }

  const candidateData = candidateDoc.data() as Candidate;
  ResponseHandler.success(res, candidateData, 'Profile retrieved successfully');
}));

/**
 * PUT /api/candidates/profile
 * Update candidate's profile
 */
router.put('/profile', requireCandidate, [
  body('skills').isArray().withMessage('Skills must be an array'),
  body('skills.*').isString().withMessage('Each skill must be a string'),
  body('experience').isNumeric().withMessage('Experience must be a number'),
  body('location').isString().withMessage('Location must be a string'),
  body('bio').optional().isString().withMessage('Bio must be a string'),
  body('expectedSalary').optional().isNumeric().withMessage('Expected salary must be a number'),
  body('preferredJobTypes').isArray().withMessage('Preferred job types must be an array'),
  body('preferredJobTypes.*').isString().withMessage('Each job type must be a string'),
  body('availability').isIn(['available', 'busy', 'unavailable']).withMessage('Invalid availability status'),
], validateRequest, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const updateData = {
    ...req.body,
    updatedAt: new Date(),
  };

  await firestore.collection('candidates').doc(req.user!.uid).update(updateData);
  
  ResponseHandler.success(res, updateData, 'Profile updated successfully');
}));

/**
 * POST /api/candidates/profile
 * Create candidate's profile
 */
router.post('/profile', requireCandidate, [
  body('skills').isArray().withMessage('Skills must be an array'),
  body('skills.*').isString().withMessage('Each skill must be a string'),
  body('experience').isNumeric().withMessage('Experience must be a number'),
  body('location').isString().withMessage('Location must be a string'),
  body('bio').optional().isString().withMessage('Bio must be a string'),
  body('expectedSalary').optional().isNumeric().withMessage('Expected salary must be a number'),
  body('preferredJobTypes').isArray().withMessage('Preferred job types must be an array'),
  body('preferredJobTypes.*').isString().withMessage('Each job type must be a string'),
  body('availability').isIn(['available', 'busy', 'unavailable']).withMessage('Invalid availability status'),
], validateRequest, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const candidateData = {
    ...req.body,
    uid: req.user!.uid,
    email: req.user!.email,
    role: 'candidate',
    isOnline: true,
    lastSeen: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await firestore.collection('candidates').doc(req.user!.uid).set(candidateData);
  
  ResponseHandler.success(res, candidateData, 'Profile created successfully', 201);
}));

/**
 * GET /api/candidates/calls
 * Get candidate's call history
 */
router.get('/calls', requireCandidate, validatePagination, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  const callsSnapshot = await firestore
    .collection('calls')
    .where('candidateId', '==', req.user!.uid)
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
    .where('candidateId', '==', req.user!.uid)
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
 * GET /api/candidates/calls/:callId
 * Get specific call details
 */
router.get('/calls/:callId', requireCandidate, [
  param('callId').isString().withMessage('Call ID must be a string'),
], validateRequest, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const callDoc = await firestore.collection('calls').doc(req.params.callId).get();
  
  if (!callDoc.exists) {
    ResponseHandler.notFound(res, 'Call not found');
    return;
  }

  const callData = callDoc.data();
  
  // Verify candidate owns this call
  if (callData?.candidateId !== req.user!.uid) {
    ResponseHandler.forbidden(res, 'Access denied');
    return;
  }

  ResponseHandler.success(res, { id: callDoc.id, ...callData }, 'Call details retrieved successfully');
}));

/**
 * PUT /api/candidates/availability
 * Update availability status
 */
router.put('/availability', requireCandidate, [
  body('availability').isIn(['available', 'busy', 'unavailable']).withMessage('Invalid availability status'),
], validateRequest, asyncHandler(async (req: AuthenticatedRequest, res) => {
  await firestore.collection('candidates').doc(req.user!.uid).update({
    availability: req.body.availability,
    updatedAt: new Date(),
  });

  ResponseHandler.success(res, { availability: req.body.availability }, 'Availability updated successfully');
}));

/**
 * GET /api/candidates/stats
 * Get candidate statistics
 */
router.get('/stats', requireCandidate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const callsSnapshot = await firestore
    .collection('calls')
    .where('candidateId', '==', req.user!.uid)
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
  };

  ResponseHandler.success(res, stats, 'Statistics retrieved successfully');
}));

export default router;

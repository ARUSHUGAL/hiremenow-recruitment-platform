import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authMiddleware, requireRecruiter, AuthenticatedRequest } from '../middleware/auth';
import { validateRequest, validatePagination } from '../utils/validation';
import { ResponseHandler } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';
import { firestore } from '../config/firebase';
import { MatchingService } from '../services/matchingService';
import { Candidate, RecruiterProfile } from '../types';

const router = Router();

// Apply authentication to all routes
router.use(authMiddleware);

/**
 * POST /api/matching/find-candidate
 * Find the best candidate match for a recruiter
 */
router.post('/find-candidate', requireRecruiter, asyncHandler(async (req: AuthenticatedRequest, res) => {
  try {
    const matchResult = await MatchingService.findBestMatch(req.user!.uid);
    
    if (!matchResult) {
      ResponseHandler.success(res, null, 'No suitable candidates found at the moment');
      return;
    }

    ResponseHandler.success(res, {
      candidate: {
        id: matchResult.candidate.id,
        displayName: matchResult.candidate.displayName,
        email: matchResult.candidate.email,
        skills: matchResult.candidate.skills,
        experience: matchResult.candidate.experience,
        location: matchResult.candidate.location,
        bio: matchResult.candidate.bio,
        photoURL: matchResult.candidate.photoURL,
      },
      matchScore: matchResult.score,
      softConstraintScore: matchResult.softConstraintScore,
      reasons: matchResult.reasons,
    }, 'Best match found successfully');
  } catch (error) {
    console.error('Error finding candidate:', error);
    ResponseHandler.error(res, 'Failed to find candidate match', 500);
  }
}));

/**
 * GET /api/matching/candidates
 * Get available candidates with filtering
 */
router.get('/candidates', requireRecruiter, [
  query('skills').optional().isString().withMessage('Skills filter must be a string'),
  query('location').optional().isString().withMessage('Location filter must be a string'),
  query('minExperience').optional().isNumeric().withMessage('Min experience must be a number'),
  query('maxExperience').optional().isNumeric().withMessage('Max experience must be a number'),
  query('availability').optional().isIn(['available', 'busy', 'unavailable']).withMessage('Invalid availability'),
], validateRequest, validatePagination, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  let query = firestore.collection('candidates');

  // Apply filters
  if (req.query.availability) {
    query = query.where('availability', '==', req.query.availability);
  } else {
    query = query.where('availability', '==', 'available');
  }

  if (req.query.location) {
    query = query.where('location', '==', req.query.location);
  }

  if (req.query.minExperience) {
    query = query.where('experience', '>=', parseInt(req.query.minExperience as string));
  }

  if (req.query.maxExperience) {
    query = query.where('experience', '<=', parseInt(req.query.maxExperience as string));
  }

  // Get candidates
  const candidatesSnapshot = await query
    .orderBy('lastSeen', 'desc')
    .limit(limit)
    .offset(offset)
    .get();

  let candidates: Candidate[] = [];
  candidatesSnapshot.forEach(doc => {
    candidates.push({ id: doc.id, ...doc.data() } as Candidate);
  });

  // Filter by skills if provided
  if (req.query.skills) {
    const requiredSkills = (req.query.skills as string).split(',').map(s => s.trim().toLowerCase());
    candidates = candidates.filter(candidate => 
      candidate.skills.some(skill => 
        requiredSkills.some(reqSkill => 
          skill.toLowerCase().includes(reqSkill)
        )
      )
    );
  }

  // Get total count for pagination
  const totalSnapshot = await firestore
    .collection('candidates')
    .where('availability', '==', 'available')
    .get();

  ResponseHandler.success(res, {
    candidates: candidates.map(candidate => ({
      id: candidate.id,
      displayName: candidate.displayName,
      skills: candidate.skills,
      experience: candidate.experience,
      location: candidate.location,
      bio: candidate.bio,
      photoURL: candidate.photoURL,
      lastSeen: candidate.lastSeen,
    })),
    pagination: {
      page,
      limit,
      total: totalSnapshot.size,
      pages: Math.ceil(totalSnapshot.size / limit),
    },
  }, 'Candidates retrieved successfully');
}));

/**
 * GET /api/matching/candidates/:candidateId
 * Get specific candidate details
 */
router.get('/candidates/:candidateId', requireRecruiter, [
  param('candidateId').isString().withMessage('Candidate ID must be a string'),
], validateRequest, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const candidateDoc = await firestore.collection('candidates').doc(req.params.candidateId).get();
  
  if (!candidateDoc.exists) {
    ResponseHandler.notFound(res, 'Candidate not found');
    return;
  }

  const candidateData = candidateDoc.data() as Candidate;
  
  ResponseHandler.success(res, {
    id: candidateData.id,
    displayName: candidateData.displayName,
    email: candidateData.email,
    skills: candidateData.skills,
    experience: candidateData.experience,
    location: candidateData.location,
    bio: candidateData.bio,
    photoURL: candidateData.photoURL,
    availability: candidateData.availability,
    expectedSalary: candidateData.expectedSalary,
    preferredJobTypes: candidateData.preferredJobTypes,
    lastSeen: candidateData.lastSeen,
  }, 'Candidate details retrieved successfully');
}));

/**
 * POST /api/matching/evaluate-candidate
 * Evaluate a specific candidate against recruiter's constraints
 */
router.post('/evaluate-candidate', requireRecruiter, [
  body('candidateId').isString().withMessage('Candidate ID must be a string'),
], validateRequest, asyncHandler(async (req: AuthenticatedRequest, res) => {
  try {
    // Get candidate
    const candidateDoc = await firestore.collection('candidates').doc(req.body.candidateId).get();
    if (!candidateDoc.exists) {
      ResponseHandler.notFound(res, 'Candidate not found');
      return;
    }

    const candidate = { id: candidateDoc.id, ...candidateDoc.data() } as Candidate;

    // Get recruiter constraints
    const recruiterDoc = await firestore.collection('recruiters').doc(req.user!.uid).get();
    if (!recruiterDoc.exists) {
      ResponseHandler.notFound(res, 'Recruiter profile not found');
      return;
    }

    const recruiterData = recruiterDoc.data() as RecruiterProfile;
    if (!recruiterData.matchingConstraints) {
      ResponseHandler.error(res, 'No matching constraints set', 400);
      return;
    }

    // Evaluate candidate
    const matchResult = MatchingService['evaluateCandidate'](candidate, recruiterData.matchingConstraints);

    ResponseHandler.success(res, {
      candidate: {
        id: candidate.id,
        displayName: candidate.displayName,
        skills: candidate.skills,
        experience: candidate.experience,
        location: candidate.location,
      },
      matchScore: matchResult.score,
      passedHardConstraints: matchResult.passedHardConstraints,
      softConstraintScore: matchResult.softConstraintScore,
      reasons: matchResult.reasons,
    }, 'Candidate evaluation completed');
  } catch (error) {
    console.error('Error evaluating candidate:', error);
    ResponseHandler.error(res, 'Failed to evaluate candidate', 500);
  }
}));

/**
 * GET /api/matching/constraints-template
 * Get a template for setting up matching constraints
 */
router.get('/constraints-template', requireRecruiter, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const template = {
    hardConstraints: [
      {
        field: 'availability',
        operator: 'equals',
        value: 'available',
        description: 'Candidate must be available for calls',
      },
      {
        field: 'isOnline',
        operator: 'equals',
        value: true,
        description: 'Candidate must be currently online',
      },
    ],
    softConstraints: [
      {
        field: 'skills',
        operator: 'contains',
        value: 'JavaScript',
        weight: 0.3,
        description: 'Prefer candidates with JavaScript skills',
      },
      {
        field: 'experience',
        operator: 'greater_than',
        value: 2,
        weight: 0.2,
        description: 'Prefer candidates with more than 2 years experience',
      },
      {
        field: 'location',
        operator: 'contains',
        value: 'Remote',
        weight: 0.1,
        description: 'Prefer remote candidates',
      },
    ],
    softConstraintThreshold: 0.3,
    availableFields: [
      'skills',
      'experience',
      'location',
      'availability',
      'isOnline',
      'expectedSalary',
      'preferredJobTypes',
    ],
    availableOperators: [
      'equals',
      'contains',
      'greater_than',
      'less_than',
      'in',
      'not_in',
    ],
  };

  ResponseHandler.success(res, template, 'Constraints template retrieved successfully');
}));

/**
 * GET /api/matching/stats
 * Get matching statistics for recruiter
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
    totalMatches: calls.length,
    successfulMatches: calls.filter(call => call.status === 'ended').length,
    averageMatchScore: calls
      .filter(call => call.matchScore)
      .reduce((sum, call) => sum + call.matchScore, 0) / calls.filter(call => call.matchScore).length || 0,
    topSkills: calls
      .map(call => call.candidateSkills || [])
      .flat()
      .reduce((acc: any, skill: string) => {
        acc[skill] = (acc[skill] || 0) + 1;
        return acc;
      }, {}),
  };

  ResponseHandler.success(res, stats, 'Matching statistics retrieved successfully');
}));

export default router;

import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { createSuccessResponse, createErrorResponse } from '../utils/response';
import { authMiddleware } from '../middleware/auth';
import twilio from 'twilio';

const router = Router();

// Generate Twilio Video access token
router.post('/token', 
  authMiddleware,
  [
    body('roomName').notEmpty().withMessage('Room name is required'),
    body('identity').notEmpty().withMessage('Identity is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(createErrorResponse('Validation failed', errors.array()));
      }

      const { roomName, identity } = req.body;
      const userId = req.user?.uid;

      if (!userId) {
        return res.status(401).json(createErrorResponse('User not authenticated'));
      }

      // Initialize Twilio client
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID || 'demo-account-sid',
        process.env.TWILIO_AUTH_TOKEN || 'demo-auth-token'
      );

      // Generate access token
      const token = new twilio.jwt.AccessToken(
        process.env.TWILIO_ACCOUNT_SID || 'demo-account-sid',
        process.env.TWILIO_API_KEY_SID || 'demo-api-key-sid',
        process.env.TWILIO_API_KEY_SECRET || 'demo-api-key-secret',
        { identity }
      );

      const videoGrant = new twilio.jwt.AccessToken.VideoGrant({
        room: roomName,
      });

      token.addGrant(videoGrant);

      const tokenData = {
        token: token.toJwt(),
        roomName: roomName,
        identity: identity,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        capabilities: {
          video: true,
          audio: true,
          screenShare: true
        }
      };

      res.json(createSuccessResponse('Access token generated', tokenData));
    } catch (error) {
      console.error('Error generating video token:', error);
      res.status(500).json(createErrorResponse('Failed to generate access token'));
    }
  }
);

// Create a new video room
router.post('/room',
  authMiddleware,
  [
    body('roomName').notEmpty().withMessage('Room name is required'),
    body('maxParticipants').optional().isInt({ min: 2, max: 50 }).withMessage('Max participants must be between 2 and 50'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(createErrorResponse('Validation failed', errors.array()));
      }

      const { roomName, maxParticipants = 10 } = req.body;
      const userId = req.user?.uid;

      if (!userId) {
        return res.status(401).json(createErrorResponse('User not authenticated'));
      }

      // In production, you would:
      // 1. Create room using Twilio Video API
      // 2. Store room metadata in database
      // 3. Set up room configuration

      const mockRoom = {
        sid: `RM${Date.now()}`,
        name: roomName,
        maxParticipants: maxParticipants,
        status: 'in-progress',
        createdAt: new Date(),
        createdBy: userId,
        participants: []
      };

      res.json(createSuccessResponse('Room created successfully', mockRoom));
    } catch (error) {
      console.error('Error creating video room:', error);
      res.status(500).json(createErrorResponse('Failed to create video room'));
    }
  }
);

// Get room information
router.get('/room/:roomName',
  authMiddleware,
  async (req, res) => {
    try {
      const { roomName } = req.params;
      const userId = req.user?.uid;

      if (!userId) {
        return res.status(401).json(createErrorResponse('User not authenticated'));
      }

      // In production, you would:
      // 1. Fetch room from Twilio Video API
      // 2. Get participant list
      // 3. Return room status and metadata

      const mockRoomInfo = {
        sid: `RM${Date.now()}`,
        name: roomName,
        status: 'in-progress',
        participants: [
          {
            identity: 'recruiter-123',
            sid: 'PA123',
            status: 'connected',
            joinedAt: new Date(Date.now() - 30000)
          },
          {
            identity: 'candidate-456',
            sid: 'PA456',
            status: 'connected',
            joinedAt: new Date(Date.now() - 15000)
          }
        ],
        createdAt: new Date(Date.now() - 60000),
        duration: 60
      };

      res.json(createSuccessResponse('Room information retrieved', mockRoomInfo));
    } catch (error) {
      console.error('Error fetching room info:', error);
      res.status(500).json(createErrorResponse('Failed to fetch room information'));
    }
  }
);

// End video call and generate summary
router.post('/room/:roomName/end',
  authMiddleware,
  async (req, res) => {
    try {
      const { roomName } = req.params;
      const userId = req.user?.uid;

      if (!userId) {
        return res.status(401).json(createErrorResponse('User not authenticated'));
      }

      // In production, you would:
      // 1. End the Twilio Video room
      // 2. Process recorded media (if enabled)
      // 3. Generate AI summary using transcription
      // 4. Send notifications to participants

      const mockCallSummary = {
        roomName: roomName,
        duration: 300, // 5 minutes
        participants: ['recruiter-123', 'candidate-456'],
        transcript: 'Mock transcript of the interview conversation...',
        aiSummary: {
          keyPoints: [
            'Candidate has strong React and Node.js experience',
            'Good communication skills and technical depth',
            'Experience with testing frameworks and debugging'
          ],
          skillsMentioned: ['React', 'Node.js', 'JavaScript', 'Testing', 'Debugging'],
          sentiment: 'positive',
          confidence: 0.87,
          recommendation: 'Proceed to next round'
        },
        endedAt: new Date(),
        endedBy: userId
      };

      res.json(createSuccessResponse('Call ended successfully', mockCallSummary));
    } catch (error) {
      console.error('Error ending video call:', error);
      res.status(500).json(createErrorResponse('Failed to end video call'));
    }
  }
);

export default router;

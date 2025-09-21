import { Router } from 'express';
import { body, param } from 'express-validator';
import { authMiddleware, requireAnyRole, AuthenticatedRequest } from '../middleware/auth';
import { validateRequest } from '../utils/validation';
import { ResponseHandler } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';
import { NotificationService } from '../services/notificationService';

const router = Router();

// Apply authentication to all routes
router.use(authMiddleware);

/**
 * POST /api/notifications/welcome
 * Send welcome email to user
 */
router.post('/welcome', requireAnyRole, [
  body('email').isEmail().withMessage('Valid email is required'),
  body('name').isString().withMessage('Name is required'),
], validateRequest, asyncHandler(async (req: AuthenticatedRequest, res) => {
  try {
    await NotificationService.sendWelcomeEmail(
      req.body.email,
      req.body.name,
      req.user!.role
    );

    ResponseHandler.success(res, null, 'Welcome email sent successfully');
  } catch (error) {
    console.error('Error sending welcome email:', error);
    ResponseHandler.error(res, 'Failed to send welcome email', 500);
  }
}));

/**
 * POST /api/notifications/test-email
 * Send test email (for development/testing)
 */
router.post('/test-email', requireAnyRole, [
  body('email').isEmail().withMessage('Valid email is required'),
  body('subject').isString().withMessage('Subject is required'),
  body('message').isString().withMessage('Message is required'),
], validateRequest, asyncHandler(async (req: AuthenticatedRequest, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      ResponseHandler.error(res, 'Test emails not allowed in production', 403);
      return;
    }

    // This would be a simple test email implementation
    // For now, we'll just return success
    ResponseHandler.success(res, {
      email: req.body.email,
      subject: req.body.subject,
      message: req.body.message,
    }, 'Test email would be sent successfully');
  } catch (error) {
    console.error('Error sending test email:', error);
    ResponseHandler.error(res, 'Failed to send test email', 500);
  }
}));

/**
 * GET /api/notifications/status
 * Get notification service status
 */
router.get('/status', requireAnyRole, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const status = {
    service: 'Brevo Email Service',
    configured: !!process.env.BREVO_API_KEY,
    fromEmail: process.env.FROM_EMAIL || 'noreply@hiremenow.com',
    environment: process.env.NODE_ENV || 'development',
    features: {
      welcomeEmails: true,
      decisionNotifications: true,
      callSummaries: true,
      testEmails: process.env.NODE_ENV !== 'production',
    },
  };

  ResponseHandler.success(res, status, 'Notification service status retrieved');
}));

export default router;

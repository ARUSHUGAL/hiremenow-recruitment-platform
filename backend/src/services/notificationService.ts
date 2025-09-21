import { SibApiV3Sdk } from 'brevo';
import { VideoCall, CallSummary } from '../types';
import { firestore } from '../config/firebase';
import { AIService } from './aiService';

export class NotificationService {
  private static brevoApi: SibApiV3Sdk.TransactionalEmailsApi;

  static initialize(): void {
    if (!process.env.BREVO_API_KEY) {
      throw new Error('Brevo API key not configured');
    }

    this.brevoApi = new SibApiV3Sdk.TransactionalEmailsApi();
    this.brevoApi.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
  }

  /**
   * Send decision notification email to candidate
   */
  static async sendDecisionNotification(
    callData: VideoCall,
    decision: 'YES' | 'NO' | 'MAYBE',
    notes?: string
  ): Promise<void> {
    try {
      if (!this.brevoApi) {
        this.initialize();
      }

      // Get candidate and recruiter data
      const [candidateDoc, recruiterDoc] = await Promise.all([
        firestore.collection('candidates').doc(callData.candidateId).get(),
        firestore.collection('recruiters').doc(callData.recruiterId).get(),
      ]);

      if (!candidateDoc.exists || !recruiterDoc.exists) {
        throw new Error('Candidate or recruiter not found');
      }

      const candidate = candidateDoc.data();
      const recruiter = recruiterDoc.data();

      // Generate AI email content
      const emailContent = await AIService.generateEmailContent(
        decision,
        candidate?.displayName || candidate?.email || 'Candidate',
        recruiter?.company || 'Our Company',
        callData.aiSummary
      );

      // Prepare email
      const emailData = {
        sender: {
          name: recruiter?.company || 'HireMeNow',
          email: process.env.FROM_EMAIL || 'noreply@hiremenow.com',
        },
        to: [
          {
            email: candidate?.email,
            name: candidate?.displayName || candidate?.email,
          },
        ],
        subject: emailContent.subject,
        htmlContent: this.formatEmailBody(emailContent.body, decision, notes),
        textContent: emailContent.body,
      };

      // Send email
      await this.brevoApi.sendTransacEmail(emailData);
      
      console.log(`Decision email sent to ${candidate?.email} for ${decision} decision`);

    } catch (error) {
      console.error('Error sending decision notification:', error);
      throw error;
    }
  }

  /**
   * Send call summary to recruiter
   */
  static async sendCallSummaryToRecruiter(
    callData: VideoCall,
    summary: CallSummary
  ): Promise<void> {
    try {
      if (!this.brevoApi) {
        this.initialize();
      }

      // Get recruiter data
      const recruiterDoc = await firestore.collection('recruiters').doc(callData.recruiterId).get();
      if (!recruiterDoc.exists) {
        throw new Error('Recruiter not found');
      }

      const recruiter = recruiterDoc.data();

      // Get candidate data for context
      const candidateDoc = await firestore.collection('candidates').doc(callData.candidateId).get();
      const candidate = candidateDoc.exists ? candidateDoc.data() : null;

      const emailData = {
        sender: {
          name: 'HireMeNow AI',
          email: process.env.FROM_EMAIL || 'noreply@hiremenow.com',
        },
        to: [
          {
            email: recruiter?.email,
            name: recruiter?.displayName || recruiter?.email,
          },
        ],
        subject: `Interview Summary: ${candidate?.displayName || 'Candidate'} - ${recruiter?.company}`,
        htmlContent: this.formatSummaryEmail(summary, candidate, recruiter),
        textContent: this.formatSummaryEmailText(summary, candidate, recruiter),
      };

      await this.brevoApi.sendTransacEmail(emailData);
      
      console.log(`Call summary sent to recruiter ${recruiter?.email}`);

    } catch (error) {
      console.error('Error sending call summary:', error);
      throw error;
    }
  }

  /**
   * Send welcome email to new users
   */
  static async sendWelcomeEmail(
    email: string,
    name: string,
    role: 'candidate' | 'recruiter'
  ): Promise<void> {
    try {
      if (!this.brevoApi) {
        this.initialize();
      }

      const emailData = {
        sender: {
          name: 'HireMeNow Team',
          email: process.env.FROM_EMAIL || 'noreply@hiremenow.com',
        },
        to: [
          {
            email,
            name,
          },
        ],
        subject: `Welcome to HireMeNow, ${name}!`,
        htmlContent: this.formatWelcomeEmail(name, role),
        textContent: this.formatWelcomeEmailText(name, role),
      };

      await this.brevoApi.sendTransacEmail(emailData);
      
      console.log(`Welcome email sent to ${email}`);

    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }

  /**
   * Format email body with HTML
   */
  private static formatEmailBody(body: string, decision: string, notes?: string): string {
    const color = decision === 'YES' ? '#28a745' : decision === 'NO' ? '#dc3545' : '#ffc107';
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: ${color}; color: white; padding: 20px; text-align: center;">
          <h1>HireMeNow</h1>
        </div>
        <div style="padding: 20px;">
          ${body.replace(/\n/g, '<br>')}
          ${notes ? `<br><br><strong>Additional Notes:</strong><br>${notes}` : ''}
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d;">
          This email was sent by HireMeNow - Omegle for Recruiters
        </div>
      </div>
    `;
  }

  /**
   * Format summary email with HTML
   */
  private static formatSummaryEmail(
    summary: CallSummary,
    candidate: any,
    recruiter: any
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #007bff; color: white; padding: 20px; text-align: center;">
          <h1>Interview Summary Report</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Candidate: ${candidate?.displayName || 'Unknown'}</h2>
          <h2>Company: ${recruiter?.company || 'Unknown'}</h2>
          
          <h3>Overall Score: ${summary.overallScore}/10</h3>
          
          <div style="display: flex; justify-content: space-between; margin: 20px 0;">
            <div style="text-align: center;">
              <h4>Communication</h4>
              <div style="font-size: 24px; color: #007bff;">${summary.communicationScore}/10</div>
            </div>
            <div style="text-align: center;">
              <h4>Technical</h4>
              <div style="font-size: 24px; color: #28a745;">${summary.technicalScore}/10</div>
            </div>
            <div style="text-align: center;">
              <h4>Cultural Fit</h4>
              <div style="font-size: 24px; color: #ffc107;">${summary.culturalFitScore}/10</div>
            </div>
          </div>
          
          <h3>Strengths</h3>
          <ul>
            ${summary.candidateStrengths.map(strength => `<li>${strength}</li>`).join('')}
          </ul>
          
          <h3>Areas for Improvement</h3>
          <ul>
            ${summary.candidateWeaknesses.map(weakness => `<li>${weakness}</li>`).join('')}
          </ul>
          
          <h3>Key Skills</h3>
          <p>${summary.keySkills.join(', ')}</p>
          
          <h3>Summary</h3>
          <p>${summary.summary}</p>
          
          <h3>Recommendations</h3>
          <ul>
            ${summary.recommendations.map(rec => `<li>${rec}</li>`).join('')}
          </ul>
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d;">
          Generated by HireMeNow AI
        </div>
      </div>
    `;
  }

  /**
   * Format summary email as plain text
   */
  private static formatSummaryEmailText(
    summary: CallSummary,
    candidate: any,
    recruiter: any
  ): string {
    return `
Interview Summary Report

Candidate: ${candidate?.displayName || 'Unknown'}
Company: ${recruiter?.company || 'Unknown'}

Overall Score: ${summary.overallScore}/10

Communication Score: ${summary.communicationScore}/10
Technical Score: ${summary.technicalScore}/10
Cultural Fit Score: ${summary.culturalFitScore}/10

Strengths:
${summary.candidateStrengths.map(strength => `- ${strength}`).join('\n')}

Areas for Improvement:
${summary.candidateWeaknesses.map(weakness => `- ${weakness}`).join('\n')}

Key Skills: ${summary.keySkills.join(', ')}

Summary:
${summary.summary}

Recommendations:
${summary.recommendations.map(rec => `- ${rec}`).join('\n')}

Generated by HireMeNow AI
    `;
  }

  /**
   * Format welcome email with HTML
   */
  private static formatWelcomeEmail(name: string, role: 'candidate' | 'recruiter'): string {
    const roleSpecificContent = role === 'candidate' 
      ? 'Start connecting with top recruiters instantly!'
      : 'Begin finding the perfect candidates for your team!';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #007bff; color: white; padding: 20px; text-align: center;">
          <h1>Welcome to HireMeNow!</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Hi ${name}!</h2>
          <p>Welcome to HireMeNow - the Omegle for Recruiters! 🚀</p>
          <p>${roleSpecificContent}</p>
          <p>Get ready for instant connections and 5-minute screening calls that could change your career!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
               style="background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">
              Get Started
            </a>
          </div>
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d;">
          HireMeNow - Speed Dating for Jobs
        </div>
      </div>
    `;
  }

  /**
   * Format welcome email as plain text
   */
  private static formatWelcomeEmailText(name: string, role: 'candidate' | 'recruiter'): string {
    const roleSpecificContent = role === 'candidate' 
      ? 'Start connecting with top recruiters instantly!'
      : 'Begin finding the perfect candidates for your team!';

    return `
Hi ${name}!

Welcome to HireMeNow - the Omegle for Recruiters! 🚀

${roleSpecificContent}

Get ready for instant connections and 5-minute screening calls that could change your career!

Visit: ${process.env.FRONTEND_URL || 'http://localhost:5173'}

Best regards,
The HireMeNow Team
    `;
  }
}

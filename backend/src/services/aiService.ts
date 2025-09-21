import OpenAI from 'openai';
import { CallSummary } from '../types';

export class AIService {
  private static openai: OpenAI;

  static initialize(): void {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Transcribe audio using Whisper API
   */
  static async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    try {
      if (!this.openai) {
        this.initialize();
      }

      const transcription = await this.openai.audio.transcriptions.create({
        file: new File([audioBuffer], 'audio.webm', { type: 'audio/webm' }),
        model: 'whisper-1',
        language: 'en',
        response_format: 'text',
      });

      return transcription as string;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  /**
   * Generate AI summary of the interview conversation
   */
  static async generateCallSummary(transcript: string): Promise<CallSummary> {
    try {
      if (!this.openai) {
        this.initialize();
      }

      const prompt = `
        Analyze this interview transcript and provide a structured summary:
        
        Transcript: "${transcript}"
        
        Please provide a JSON response with the following structure:
        {
          "candidateStrengths": ["strength1", "strength2", "strength3"],
          "candidateWeaknesses": ["weakness1", "weakness2"],
          "keySkills": ["skill1", "skill2", "skill3"],
          "communicationScore": 8,
          "technicalScore": 7,
          "culturalFitScore": 9,
          "overallScore": 8,
          "summary": "Brief summary of the candidate's performance",
          "recommendations": ["recommendation1", "recommendation2"]
        }
        
        Score each category from 1-10 based on the conversation.
        Focus on technical skills, communication abilities, and cultural fit.
        Be objective and constructive in your assessment.
      `;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert HR analyst. Analyze interview transcripts and provide structured, objective assessments.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI');
      }

      // Parse JSON response
      const summary = JSON.parse(response) as CallSummary;
      
      // Validate and sanitize the response
      return this.validateSummary(summary);
    } catch (error) {
      console.error('Error generating call summary:', error);
      
      // Return a default summary if AI fails
      return this.getDefaultSummary();
    }
  }

  /**
   * Validate and sanitize AI-generated summary
   */
  private static validateSummary(summary: any): CallSummary {
    return {
      candidateStrengths: Array.isArray(summary.candidateStrengths) 
        ? summary.candidateStrengths.slice(0, 5) 
        : ['Good communication skills'],
      candidateWeaknesses: Array.isArray(summary.candidateWeaknesses) 
        ? summary.candidateWeaknesses.slice(0, 3) 
        : ['Areas for improvement identified'],
      keySkills: Array.isArray(summary.keySkills) 
        ? summary.keySkills.slice(0, 5) 
        : ['Technical skills'],
      communicationScore: this.validateScore(summary.communicationScore),
      technicalScore: this.validateScore(summary.technicalScore),
      culturalFitScore: this.validateScore(summary.culturalFitScore),
      overallScore: this.validateScore(summary.overallScore),
      summary: typeof summary.summary === 'string' 
        ? summary.summary.slice(0, 500) 
        : 'Interview completed successfully',
      recommendations: Array.isArray(summary.recommendations) 
        ? summary.recommendations.slice(0, 3) 
        : ['Consider for next round'],
    };
  }

  /**
   * Validate score is between 1-10
   */
  private static validateScore(score: any): number {
    const numScore = Number(score);
    return isNaN(numScore) || numScore < 1 || numScore > 10 ? 5 : Math.round(numScore);
  }

  /**
   * Get default summary when AI fails
   */
  private static getDefaultSummary(): CallSummary {
    return {
      candidateStrengths: ['Participated in interview'],
      candidateWeaknesses: ['Assessment pending'],
      keySkills: ['Interview completed'],
      communicationScore: 5,
      technicalScore: 5,
      culturalFitScore: 5,
      overallScore: 5,
      summary: 'Interview completed. Manual review recommended.',
      recommendations: ['Review transcript manually'],
    };
  }

  /**
   * Generate personalized email content based on decision
   */
  static async generateEmailContent(
    decision: 'YES' | 'NO' | 'MAYBE',
    candidateName: string,
    recruiterCompany: string,
    summary?: CallSummary
  ): Promise<{ subject: string; body: string }> {
    try {
      if (!this.openai) {
        this.initialize();
      }

      const prompt = `
        Generate a professional email for a ${decision} decision after a 5-minute screening interview.
        
        Candidate: ${candidateName}
        Company: ${recruiterCompany}
        Decision: ${decision}
        ${summary ? `Interview Summary: ${summary.summary}` : ''}
        
        Return JSON with "subject" and "body" fields.
        Make it professional, encouraging, and appropriate for the decision.
        Keep it concise but warm.
      `;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional HR representative writing post-interview emails.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI');
      }

      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating email content:', error);
      
      // Return default email content
      return this.getDefaultEmailContent(decision, candidateName, recruiterCompany);
    }
  }

  /**
   * Get default email content when AI fails
   */
  private static getDefaultEmailContent(
    decision: 'YES' | 'NO' | 'MAYBE',
    candidateName: string,
    recruiterCompany: string
  ): { subject: string; body: string } {
    const templates = {
      YES: {
        subject: `Great news from ${recruiterCompany}!`,
        body: `Hi ${candidateName},\n\nThank you for your time during our screening interview. We were impressed with your background and would like to move forward with the next steps in our process.\n\nWe'll be in touch soon with more details.\n\nBest regards,\n${recruiterCompany} Team`,
      },
      NO: {
        subject: `Update from ${recruiterCompany}`,
        body: `Hi ${candidateName},\n\nThank you for taking the time to speak with us. After careful consideration, we've decided to move forward with other candidates at this time.\n\nWe wish you the best in your job search.\n\nBest regards,\n${recruiterCompany} Team`,
      },
      MAYBE: {
        subject: `Follow-up from ${recruiterCompany}`,
        body: `Hi ${candidateName},\n\nThank you for your time during our screening interview. We're still reviewing candidates and will keep your application in mind for future opportunities.\n\nWe'll reach out if anything suitable comes up.\n\nBest regards,\n${recruiterCompany} Team`,
      },
    };

    return templates[decision];
  }
}

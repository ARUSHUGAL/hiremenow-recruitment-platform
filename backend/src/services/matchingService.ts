import { Candidate, RecruiterProfile, MatchingConstraints, HardConstraint, SoftConstraint } from '../types';
import { firestore } from '../config/firebase';

export interface MatchResult {
  candidate: Candidate;
  score: number;
  passedHardConstraints: boolean;
  softConstraintScore: number;
  reasons: string[];
}

export class MatchingService {
  /**
   * Find the best candidate match for a recruiter using predicate logic
   */
  static async findBestMatch(recruiterId: string): Promise<MatchResult | null> {
    try {
      // Get recruiter profile with constraints
      const recruiterDoc = await firestore.collection('recruiters').doc(recruiterId).get();
      if (!recruiterDoc.exists) {
        throw new Error('Recruiter not found');
      }

      const recruiterData = recruiterDoc.data() as RecruiterProfile;
      if (!recruiterData.isActive || !recruiterData.matchingConstraints) {
        throw new Error('Recruiter not active or no constraints set');
      }

      // Get all available candidates
      const candidatesSnapshot = await firestore
        .collection('candidates')
        .where('availability', '==', 'available')
        .where('isOnline', '==', true)
        .get();

      if (candidatesSnapshot.empty) {
        return null;
      }

      const candidates: Candidate[] = [];
      candidatesSnapshot.forEach(doc => {
        candidates.push({ id: doc.id, ...doc.data() } as Candidate);
      });

      // Apply predicate logic matching
      const matchResults = candidates.map(candidate => 
        this.evaluateCandidate(candidate, recruiterData.matchingConstraints)
      );

      // Filter candidates that pass hard constraints
      const validMatches = matchResults.filter(result => result.passedHardConstraints);

      if (validMatches.length === 0) {
        return null;
      }

      // Sort by soft constraint score and return the best match
      validMatches.sort((a, b) => b.softConstraintScore - a.softConstraintScore);
      
      return validMatches[0];
    } catch (error) {
      console.error('Error finding best match:', error);
      throw error;
    }
  }

  /**
   * Evaluate a candidate against recruiter constraints using predicate logic
   */
  private static evaluateCandidate(
    candidate: Candidate, 
    constraints: MatchingConstraints
  ): MatchResult {
    const reasons: string[] = [];
    let passedHardConstraints = true;
    let softConstraintScore = 0;

    // Evaluate hard constraints (must all pass)
    for (const constraint of constraints.hardConstraints) {
      const result = this.evaluateConstraint(candidate, constraint);
      if (!result.passed) {
        passedHardConstraints = false;
        reasons.push(`Failed hard constraint: ${constraint.field} ${constraint.operator} ${constraint.value}`);
      }
    }

    // Evaluate soft constraints (scored)
    for (const constraint of constraints.softConstraints) {
      const result = this.evaluateConstraint(candidate, constraint);
      if (result.passed) {
        softConstraintScore += constraint.weight;
        reasons.push(`Passed soft constraint: ${constraint.field} (weight: ${constraint.weight})`);
      } else {
        reasons.push(`Failed soft constraint: ${constraint.field} ${constraint.operator} ${constraint.value}`);
      }
    }

    // Check if soft constraint threshold is met
    const meetsSoftThreshold = softConstraintScore >= constraints.softConstraintThreshold;
    if (!meetsSoftThreshold) {
      passedHardConstraints = false;
      reasons.push(`Soft constraint threshold not met: ${softConstraintScore}/${constraints.softConstraintThreshold}`);
    }

    return {
      candidate,
      score: softConstraintScore,
      passedHardConstraints,
      softConstraintScore,
      reasons,
    };
  }

  /**
   * Evaluate a single constraint against candidate data
   */
  private static evaluateConstraint(
    candidate: Candidate, 
    constraint: HardConstraint | SoftConstraint
  ): { passed: boolean; value?: any } {
    const fieldValue = this.getFieldValue(candidate, constraint.field);
    
    switch (constraint.operator) {
      case 'equals':
        return { passed: fieldValue === constraint.value, value: fieldValue };
      
      case 'contains':
        if (Array.isArray(fieldValue)) {
          return { passed: fieldValue.includes(constraint.value), value: fieldValue };
        }
        if (typeof fieldValue === 'string') {
          return { passed: fieldValue.toLowerCase().includes(constraint.value.toLowerCase()), value: fieldValue };
        }
        return { passed: false, value: fieldValue };
      
      case 'greater_than':
        return { passed: Number(fieldValue) > Number(constraint.value), value: fieldValue };
      
      case 'less_than':
        return { passed: Number(fieldValue) < Number(constraint.value), value: fieldValue };
      
      case 'in':
        return { passed: Array.isArray(constraint.value) && constraint.value.includes(fieldValue), value: fieldValue };
      
      case 'not_in':
        return { passed: Array.isArray(constraint.value) && !constraint.value.includes(fieldValue), value: fieldValue };
      
      default:
        return { passed: false, value: fieldValue };
    }
  }

  /**
   * Get field value from candidate object (supports nested fields)
   */
  private static getFieldValue(candidate: Candidate, field: string): any {
    const fields = field.split('.');
    let value: any = candidate;
    
    for (const f of fields) {
      value = value?.[f];
    }
    
    return value;
  }

  /**
   * Create default matching constraints for a recruiter
   */
  static createDefaultConstraints(): MatchingConstraints {
    return {
      hardConstraints: [
        {
          field: 'availability',
          operator: 'equals',
          value: 'available',
        },
        {
          field: 'isOnline',
          operator: 'equals',
          value: true,
        },
      ],
      softConstraints: [
        {
          field: 'skills',
          operator: 'contains',
          value: 'JavaScript',
          weight: 0.3,
        },
        {
          field: 'experience',
          operator: 'greater_than',
          value: 1,
          weight: 0.2,
        },
        {
          field: 'location',
          operator: 'contains',
          value: 'Remote',
          weight: 0.1,
        },
      ],
      softConstraintThreshold: 0.3,
    };
  }

  /**
   * Update recruiter's matching constraints
   */
  static async updateRecruiterConstraints(
    recruiterId: string, 
    constraints: MatchingConstraints
  ): Promise<void> {
    await firestore.collection('recruiters').doc(recruiterId).update({
      matchingConstraints: constraints,
      updatedAt: new Date(),
    });
  }
}

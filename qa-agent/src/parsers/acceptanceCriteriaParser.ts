import { TestCase, TestStep, ClarifyingQuestion } from '../types/TestCase';
import { MemoryManager } from '../memory/memoryManager';

export class AcceptanceCriteriaParser {
  private memoryManager: MemoryManager;

  constructor(memoryManager: MemoryManager) {
    this.memoryManager = memoryManager;
  }

  /**
   * Parse acceptance criteria into test steps
   */
  public async parseToSteps(
    criteria: string,
    taskDescription: string = ''
  ): Promise<{
    steps: TestStep[];
    clarifyingQuestions: ClarifyingQuestion[];
  }> {
    if (!criteria || criteria.trim().length === 0) {
      return this.generateFromDescription(taskDescription);
    }

    const steps: TestStep[] = [];
    const clarifyingQuestions: ClarifyingQuestion[] = [];

    // Split by various delimiters
    const lines = criteria
      .split(/[\n•\-*]+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    let stepNumber = 1;

    for (const line of lines) {
      // Skip section headers
      if (
        line.match(/^(given|when|then|and|background|scenario|examples):/i) ||
        line.match(/^#+/)
      ) {
        continue;
      }

      // Extract Given/When/Then pattern
      const givenMatch = line.match(/^given\s+(.+)/i);
      const whenMatch = line.match(/^when\s+(.+)/i);
      const thenMatch = line.match(/^then\s+(.+)/i);
      const andMatch = line.match(/^and\s+(.+)/i);

      if (givenMatch) {
        // Precondition
        continue;
      } else if (whenMatch) {
        steps.push({
          stepNumber: stepNumber++,
          action: whenMatch[1],
          expectedResult: '',
          timestamp: new Date().toISOString(),
        });
      } else if (thenMatch) {
        // Add as expected result to last step or new verification step
        if (steps.length > 0 && !steps[steps.length - 1].expectedResult) {
          steps[steps.length - 1].expectedResult = thenMatch[1];
        } else {
          steps.push({
            stepNumber: stepNumber++,
            action: 'Verify',
            expectedResult: thenMatch[1],
            timestamp: new Date().toISOString(),
          });
        }
      } else if (andMatch) {
        steps.push({
          stepNumber: stepNumber++,
          action: andMatch[1],
          expectedResult: '',
          timestamp: new Date().toISOString(),
        });
      } else {
        // Generic step
        steps.push({
          stepNumber: stepNumber++,
          action: line,
          expectedResult: '',
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Generate clarifying questions for ambiguous criteria
    if (steps.length === 0) {
      clarifyingQuestions.push({
        question: 'No clear acceptance criteria found. Please provide step-by-step test steps.',
        context: `Task description: ${taskDescription}`,
        priority: 'High',
      });
    }

    return { steps, clarifyingQuestions };
  }

  /**
   * Generate test steps from task description if criteria are missing
   */
  private async generateFromDescription(
    description: string
  ): Promise<{
    steps: TestStep[];
    clarifyingQuestions: ClarifyingQuestion[];
  }> {
    const steps: TestStep[] = [];
    const clarifyingQuestions: ClarifyingQuestion[] = [];

    // Basic flow: navigate -> perform action -> verify
    steps.push({
      stepNumber: 1,
      action: 'Navigate to application',
      expectedResult: 'Application loads successfully',
      timestamp: new Date().toISOString(),
    });

    // Ask for clarification
    clarifyingQuestions.push(
      {
        question: 'What is the main feature or action being tested?',
        context: `Description: ${description}`,
        priority: 'High',
      },
      {
        question: 'What data or inputs are required?',
        context: 'Please specify any test data needed for this test case.',
        priority: 'High',
      },
      {
        question: 'What is the expected outcome?',
        context: 'Please describe what should happen after the action is completed.',
        priority: 'High',
      }
    );

    return { steps, clarifyingQuestions };
  }

  /**
   * Detect ambiguous or incomplete criteria
   */
  public detectIssues(criteria: string): string[] {
    const issues: string[] = [];

    if (!criteria || criteria.trim().length < 10) {
      issues.push('Acceptance criteria is too short or missing');
    }

    if (!criteria.match(/when|then|should|expect|verify/i)) {
      issues.push('Criteria lacks clear actions and expectations');
    }

    if (!criteria.match(/^(given|when|then|scenario|test)/i)) {
      issues.push('Criteria does not follow standard BDD format');
    }

    if (criteria.match(/\b(maybe|perhaps|might|could|try)\b/i)) {
      issues.push('Criteria contains uncertain language');
    }

    return issues;
  }

  /**
   * Enhance steps with common patterns from memory
   */
  public async enrichStepsWithMemory(
    steps: TestStep[],
    appName?: string
  ): Promise<TestStep[]> {
    // Get app profile from memory to add common steps
    if (appName) {
      const appProfile = await this.memoryManager.getAppProfile(appName);
      if (appProfile?.commonSteps) {
        // Prepend common steps (like login)
        const commonSteps = appProfile.commonSteps
          .map((step, idx) => ({
            stepNumber: idx + 1,
            action: step,
            expectedResult: '',
            timestamp: new Date().toISOString(),
          }));

        // Re-number existing steps
        steps = steps.map((step) => ({
          ...step,
          stepNumber: step.stepNumber + commonSteps.length,
        }));

        return [...commonSteps, ...steps];
      }
    }

    return steps;
  }
}

import { Task } from '../types/Task';
import { TestCase, TestStep, ClarifyingQuestion } from '../types/TestCase';
import { MemoryManager } from '../memory/memoryManager';
import { AcceptanceCriteriaParser } from './acceptanceCriteriaParser';

export class TestCaseGenerator {
  private criteriaParser: AcceptanceCriteriaParser;
  private memoryManager: MemoryManager;

  constructor(memoryManager: MemoryManager) {
    this.memoryManager = memoryManager;
    this.criteriaParser = new AcceptanceCriteriaParser(memoryManager);
  }

  /**
   * Generate test cases from task
   */
  public async generateFromTask(task: Task, appName?: string): Promise<TestCase[]> {
    const testCases: TestCase[] = [];

    // Parse acceptance criteria
    const { steps, clarifyingQuestions } = await this.criteriaParser.parseToSteps(
      task.acceptanceCriteria,
      task.description
    );

    // Enrich with memory
    const enrichedSteps = await this.criteriaParser.enrichStepsWithMemory(steps, appName);

    // Create test case
    const testCase: TestCase = {
      id: `TC-${task.workItemId}-1`,
      taskId: task.workItemId,
      title: `Test: ${task.title}`,
      description: task.description,
      preconditions: ['User is logged in', 'Application is accessible'],
      steps: enrichedSteps,
      expectedOutcome: 'All steps executed successfully',
      priority: 'High',
      tags: [appName || 'general', 'automated'],
      generatedAt: new Date().toISOString(),
      status: 'Draft',
    };

    testCases.push(testCase);

    // If there are clarifying questions, generate a draft test case anyway
    if (clarifyingQuestions.length > 0) {
      testCase.status = 'Draft';
      testCase.description += `\n\nNote: This test case was generated from limited information. Please review the following questions:\n${clarifyingQuestions.map((q) => `- ${q.question}`).join('\n')}`;
    }

    return testCases;
  }

  /**
   * Generate test cases from user answers
   */
  public async generateFromAnswers(
    task: Task,
    answers: Record<string, string>,
    appName?: string
  ): Promise<TestCase[]> {
    const steps: TestStep[] = [];
    let stepNumber = 1;

    // Convert answers to steps
    for (const [question, answer] of Object.entries(answers)) {
      if (answer && answer.trim().length > 0) {
        steps.push({
          stepNumber: stepNumber++,
          action: answer,
          expectedResult: '',
          timestamp: new Date().toISOString(),
        });
      }
    }

    const enrichedSteps = await this.criteriaParser.enrichStepsWithMemory(steps, appName);

    const testCase: TestCase = {
      id: `TC-${task.workItemId}-1`,
      taskId: task.workItemId,
      title: `Test: ${task.title}`,
      description: task.description,
      preconditions: ['User is logged in', 'Application is accessible'],
      steps: enrichedSteps,
      expectedOutcome: 'All steps executed successfully',
      priority: 'High',
      tags: [appName || 'general', 'automated'],
      generatedAt: new Date().toISOString(),
      status: 'Draft',
    };

    return [testCase];
  }

  /**
   * Apply user edits to test case
   */
  public applyUserEdits(testCase: TestCase, edits: Record<number, string>): TestCase {
    const updated = { ...testCase };
    const userEdits = updated.userEdits || [];

    for (const [stepId, newText] of Object.entries(edits)) {
      const stepIdx = parseInt(stepId);
      if (stepIdx < updated.steps.length) {
        const original = updated.steps[stepIdx];
        updated.steps[stepIdx] = {
          ...original,
          action: newText,
        };

        userEdits.push({
          stepId: stepIdx,
          originalText: original.action,
          editedText: newText,
          timestamp: new Date().toISOString(),
        });

        // Record in memory for future reference
        this.memoryManager.addUserCorrection(original.action, newText, `Task: ${testCase.taskId}`);
      }
    }

    updated.userEdits = userEdits;
    return updated;
  }

  /**
   * Validate test case
   */
  public validate(testCase: TestCase): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!testCase.title || testCase.title.trim().length === 0) {
      errors.push('Test case title is required');
    }

    if (!testCase.steps || testCase.steps.length === 0) {
      errors.push('Test case must have at least one step');
    }

    testCase.steps?.forEach((step, idx) => {
      if (!step.action || step.action.trim().length === 0) {
        errors.push(`Step ${idx + 1}: Action is required`);
      }
    });

    if (!testCase.expectedOutcome || testCase.expectedOutcome.trim().length === 0) {
      errors.push('Expected outcome is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Merge multiple test cases for same task
   */
  public mergeTestCases(testCases: TestCase[]): TestCase {
    if (testCases.length === 0) {
      throw new Error('No test cases to merge');
    }

    if (testCases.length === 1) {
      return testCases[0];
    }

    const first = testCases[0];
    const merged: TestCase = {
      ...first,
      steps: [],
    };

    // Merge all steps with proper numbering
    let stepNumber = 1;
    for (const tc of testCases) {
      for (const step of tc.steps) {
        merged.steps.push({
          ...step,
          stepNumber: stepNumber++,
        });
      }
    }

    return merged;
  }
}

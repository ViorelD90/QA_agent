import * as readline from 'readline';
import { TestCase, TestStep } from '../types/TestCase';

export class UserReview {
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Review test cases with user
   */
  public async reviewTestCases(testCases: TestCase[]): Promise<{
    approved: boolean;
    action: 'approve' | 'edit' | 'regenerate' | 'add-steps';
    edits: Record<number, string>;
  }> {
    console.log('\n📋 TEST CASE REVIEW\n');

    for (const tc of testCases) {
      this.displayTestCase(tc);
    }

    return this.askForAction();
  }

  /**
   * Display test case
   */
  private displayTestCase(tc: TestCase): void {
    console.log(`\n✅ Test Case: ${tc.title}`);
    console.log(`   ID: ${tc.id} | Status: ${tc.status}\n`);

    console.log('   Preconditions:');
    tc.preconditions?.forEach((pc) => console.log(`     • ${pc}`));

    console.log('\n   Steps:');
    tc.steps.forEach((step) => {
      console.log(`     ${step.stepNumber}. ${step.action}`);
      if (step.expectedResult) {
        console.log(`        ✓ Expected: ${step.expectedResult}`);
      }
    });

    console.log(`\n   Expected Outcome: ${tc.expectedOutcome}\n`);
  }

  /**
   * Ask user for action
   */
  private askForAction(): Promise<{
    approved: boolean;
    action: 'approve' | 'edit' | 'regenerate' | 'add-steps';
    edits: Record<number, string>;
  }> {
    return new Promise((resolve) => {
      console.log('Options:');
      console.log('  [Y] Yes - Approve test cases');
      console.log('  [N] No - Edit test cases');
      console.log('  [R] Regenerate - Start over');
      console.log('  [A] Add steps - Add more test cases\n');

      this.question('Your choice (Y/N/R/A): ', async (answer) => {
        const lower = answer.toLowerCase();

        if (lower === 'y') {
          resolve({ approved: true, action: 'approve', edits: {} });
        } else if (lower === 'n') {
          const edits = await this.collectEdits();
          resolve({ approved: false, action: 'edit', edits });
        } else if (lower === 'r') {
          resolve({ approved: false, action: 'regenerate', edits: {} });
        } else if (lower === 'a') {
          resolve({ approved: false, action: 'add-steps', edits: {} });
        } else {
          console.log('Invalid choice. Please try again.');
          resolve(this.askForAction());
        }
      });
    });
  }

  /**
   * Collect user edits
   */
  private collectEdits(): Promise<Record<number, string>> {
    return new Promise((resolve) => {
      const edits: Record<number, string> = {};

      console.log('\nEnter step numbers to edit (comma-separated, e.g., "1,3,5"):');
      this.question('Step numbers: ', async (input) => {
        const stepNumbers = input
          .split(',')
          .map((s) => parseInt(s.trim()))
          .filter((n) => !isNaN(n));

        for (const stepNum of stepNumbers) {
          const newText = await this.askForStepEdit(stepNum);
          edits[stepNum - 1] = newText;
        }

        resolve(edits);
      });
    });
  }

  /**
   * Ask for specific step edit
   */
  private askForStepEdit(stepNumber: number): Promise<string> {
    return new Promise((resolve) => {
      this.question(`\nEnter new text for step ${stepNumber}: `, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  /**
   * Ask clarifying questions
   */
  public async askClarifyingQuestions(questions: Array<{ question: string; context?: string }>): Promise<Record<string, string>> {
    const answers: Record<string, string> = {};

    console.log('\n❓ CLARIFYING QUESTIONS\n');

    for (const item of questions) {
      console.log(`Question: ${item.question}`);
      if (item.context) {
        console.log(`Context: ${item.context}`);
      }

      const answer = await this.askQuestion(`Your answer: `);
      answers[item.question] = answer;
      console.log();
    }

    return answers;
  }

  /**
   * Confirm action
   */
  public async confirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.question(`${message} (y/n): `, (answer) => {
        resolve(answer.toLowerCase() === 'y');
      });
    });
  }

  /**
   * Ask question helper
   */
  public async askQuestion(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  /**
   * Private question wrapper
   */
  private question(prompt: string, callback: (answer: string) => void): void {
    this.rl.question(prompt, callback);
  }

  /**
   * Close readline interface
   */
  public close(): void {
    this.rl.close();
  }
}

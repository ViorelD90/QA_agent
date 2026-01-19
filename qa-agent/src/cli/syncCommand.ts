import { ConfigLoader } from '../config/configLoader';
import { MemoryManager } from '../memory/memoryManager';
import { TaskFetcher } from '../azure/taskFetcher';
import { TestCaseGenerator } from '../parsers/testCaseGenerator';
import { PlaywrightTestGenerator } from '../generators/playwrightTestGenerator';
import { ScenarioWriter } from '../generators/scenarioWriter';
import { UserReview } from '../validators/userReview';
import { TestRunner } from '../validators/testRunner';
import { AcceptanceCriteriaParser } from '../parsers/acceptanceCriteriaParser';
import { Scenario } from '../types/Scenario';
import fs from 'fs';
import path from 'path';

export class SyncCommand {
  private configLoader: ConfigLoader;
  private memoryManager: MemoryManager;
  private taskFetcher: TaskFetcher | null = null;
  private testCaseGenerator: TestCaseGenerator;
  private playwrightGenerator: PlaywrightTestGenerator | null = null;
  private scenarioWriter: ScenarioWriter;
  private userReview: UserReview;
  private testRunner: TestRunner | null = null;

  constructor() {
    this.configLoader = new ConfigLoader();
    this.memoryManager = new MemoryManager();
    this.testCaseGenerator = new TestCaseGenerator(this.memoryManager);
    this.scenarioWriter = new ScenarioWriter('./scenarios');
    this.userReview = new UserReview();
  }

  /**
   * Execute sync command
   */
  public async execute(options: { appName?: string } = {}): Promise<void> {
    try {
      console.log('🚀 QA Agent Sync Started\n');

      // Load configuration
      console.log('📋 Loading configuration...');
      const config = await this.configLoader.load();
      this.taskFetcher = new TaskFetcher(config.azure);
      this.playwrightGenerator = new PlaywrightTestGenerator(config, this.memoryManager);
      this.testRunner = new TestRunner(config);

      // Test connection
      console.log('🔗 Testing Azure DevOps connection...');
      const connected = await this.taskFetcher.testConnection();
      if (!connected) {
        throw new Error('Could not connect to Azure DevOps. Check your credentials.');
      }
      console.log('✅ Connected\n');

      // Fetch tasks - try multiple state names to support different Azure DevOps templates
      console.log('📥 Fetching assigned tasks...');
      const tasks = await this.taskFetcher.fetch({
        assignedTo: config.azure.assignedTo,
        states: ['New', 'Active', 'To Do', 'In Progress'],
        maxResults: 10,
      });

      if (tasks.length === 0) {
        console.log('ℹ️  No tasks found in New, Active, To Do, or In Progress state.');
        return;
      }

      console.log(`✅ Found ${tasks.length} task(s)\n`);

      // Process each task
      for (const task of tasks) {
        console.log(`\n📌 Task: ${task.title} (ID: ${task.workItemId})`);
        console.log(`   Description: ${task.description.substring(0, 100)}...`);
        console.log(`   Acceptance Criteria: ${task.acceptanceCriteria.substring(0, 100)}...\n`);

        // Check if task was processed before
        const processed = await this.memoryManager.getProcessedTask(task.workItemId);
        if (processed && processed.userApproved) {
          const shouldReprocess = await this.userReview.confirm(
            `   Task already processed. Reprocess? (y/n): `
          );
          if (!shouldReprocess) {
            continue;
          }
        }

        // Generate test cases
        console.log('   ⚙️  Generating test cases...');
        let testCases = await this.testCaseGenerator.generateFromTask(
          task,
          options.appName
        );

        // Check for clarifying questions
        const parser = new AcceptanceCriteriaParser(this.memoryManager);
        const issues = parser.detectIssues(task.acceptanceCriteria);

        if (issues.length > 0) {
          console.log('\n   ⚠️  Issues detected:');
          issues.forEach((issue) => console.log(`      • ${issue}`));

          const shouldAsk = await this.userReview.confirm(
            '\n   Would you like to answer clarifying questions? (y/n): '
          );
          if (shouldAsk) {
            const questions = [
              { question: 'What is the main feature being tested?' },
              { question: 'What inputs or data are needed?' },
              { question: 'What is the expected outcome?' },
            ];
            const answers = await this.userReview.askClarifyingQuestions(questions);
            testCases = await this.testCaseGenerator.generateFromAnswers(
              task,
              answers,
              options.appName
            );
          }
        }

        // Review test cases
        console.log('\n   📝 Test Cases Generated:');
        const review = await this.userReview.reviewTestCases(testCases);

        if (review.action === 'regenerate') {
          console.log('   🔄 Regenerating test cases...');
          testCases = await this.testCaseGenerator.generateFromTask(task, options.appName);
          const reviewAgain = await this.userReview.reviewTestCases(testCases);
          if (reviewAgain.approved) {
            // Continue with generation
          } else {
            console.log('   ⏭️  Skipping this task.');
            continue;
          }
        } else if (review.action === 'edit') {
          console.log('   ✏️  Applying edits...');
          testCases = testCases.map((tc) =>
            this.testCaseGenerator.applyUserEdits(tc, review.edits)
          );
        } else if (review.action === 'add-steps') {
          const moreSteps = await this.userReview.askQuestion('Enter additional steps (comma-separated): ');
          // Parse and add steps
        } else if (!review.approved) {
          console.log('   ⏭️  Skipping this task.');
          continue;
        }

        // Validate test cases
        const validation = testCases.map((tc) => this.testCaseGenerator.validate(tc));
        if (validation.some((v) => !v.valid)) {
          console.log('   ❌ Validation errors:');
          validation
            .filter((v) => !v.valid)
            .forEach((v) => v.errors.forEach((e) => console.log(`      • ${e}`)));
          continue;
        }

        console.log('   ✅ Validation passed\n');

        // Generate Playwright tests
        console.log('   🎭 Generating Playwright tests...');
        const testFiles: Array<{ name: string; content: string }> = [];

        for (const tc of testCases) {
          const testCode = await this.playwrightGenerator!.generateTest(tc, options.appName);
          const fileName = this.playwrightGenerator!.getTestFileName(tc);
          testFiles.push({ name: fileName, content: testCode });
        }

        console.log(`   ✅ Generated ${testFiles.length} test file(s)\n`);

        // Ask to save or run
        const saveTests = await this.userReview.confirm('   Save test files? (y/n): ');
        if (saveTests) {
          const testsPath = path.join(process.cwd(), 'tests');
          if (!fs.existsSync(testsPath)) {
            fs.mkdirSync(testsPath, { recursive: true });
          }

          for (const file of testFiles) {
            const filePath = path.join(testsPath, file.name);
            fs.writeFileSync(filePath, file.content, 'utf-8');
            console.log(`   💾 Saved: ${filePath}`);
          }
        }

        // Ask to run tests
        const runTests = await this.userReview.confirm(
          '\n   Run tests in headed + slow mode? (y/n): '
        );
        if (runTests && this.testRunner) {
          console.log('   🎬 Running tests...\n');
          for (const tc of testCases) {
            const result = await this.testRunner.runTestCase(tc, options.appName);
            console.log(`\n   Test Results for ${tc.title}:`);
            console.log(`     Status: ${result.status}`);
            console.log(`     Total Steps: ${result.totalSteps}`);
            console.log(`     Passed: ${result.passedSteps}`);
            console.log(`     Failed: ${result.failedSteps}`);
            console.log(`     Duration: ${result.executionTime}ms\n`);
          }
        }

        // Save scenario
        console.log('   📄 Creating scenario file...');
        const scenario: Scenario = {
          scenarioId: `SC-${task.workItemId}-${Date.now()}`,
          taskId: task.workItemId,
          taskTitle: task.title,
          taskDescription: task.description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          testCases: testCases,
          automationApproach: 'Playwright TypeScript',
          userEdits: testCases.flatMap((tc) => tc.userEdits || []),
          testedUrls: [],
          notes: 'Generated by QA Agent',
        };

        const savedPath = await this.scenarioWriter.write(scenario);
        console.log(`   ✅ Scenario saved: ${savedPath}\n`);

        // Record in memory
        await this.memoryManager.recordProcessedTask({
          taskId: task.workItemId,
          taskTitle: task.title,
          processedAt: new Date().toISOString(),
          testCasesGenerated: testCases.length,
          userApproved: true,
          lastModified: new Date().toISOString(),
        });
      }

      console.log('\n✨ Sync completed successfully!');
    } catch (error) {
      console.error('❌ Error:', error);
      throw error;
    } finally {
      this.userReview.close();
      if (this.testRunner) {
        await this.testRunner.closeBrowser();
      }
    }
  }
}

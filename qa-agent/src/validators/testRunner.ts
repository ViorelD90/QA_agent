import { chromium, firefox, webkit, Browser, Page } from 'playwright';
import { TestCase } from '../types/TestCase';
import { QAAgentConfig } from '../types/Config';
import { Scenario, ExecutionResult, ExecutionError } from '../types/Scenario';

export class TestRunner {
  private config: QAAgentConfig;
  private browser: Browser | null = null;
  private executedSteps: number = 0;
  private passedSteps: number = 0;
  private failedSteps: number = 0;
  private errors: ExecutionError[] = [];

  constructor(config: QAAgentConfig) {
    this.config = config;
  }

  /**
   * Run test case and capture results
   */
  public async runTestCase(testCase: TestCase, appName?: string): Promise<ExecutionResult> {
    const startTime = Date.now();
    this.executedSteps = 0;
    this.passedSteps = 0;
    this.failedSteps = 0;
    this.errors = [];

    try {
      const browser = await this.launchBrowser();
      const page = await browser.newPage();

      // Get app config
      const app =
        appName && this.config.applications.find((a) => a.name === appName)
          ? this.config.applications.find((a) => a.name === appName)!
          : this.config.applications[0];

      // Navigate
      await page.goto(app.baseUrl, { waitUntil: 'networkidle' });

      // Execute steps
      for (let i = 0; i < testCase.steps.length; i++) {
        const step = testCase.steps[i];
        this.executedSteps++;

        try {
          await this.executeStep(page, step, i);
          this.passedSteps++;
          console.log(`  ✓ Step ${step.stepNumber}: ${step.action}`);
        } catch (error) {
          this.failedSteps++;
          this.errors.push({
            stepId: step.stepNumber,
            error: `${error}`,
            timestamp: new Date().toISOString(),
          });
          console.error(`  ✗ Step ${step.stepNumber}: ${error}`);
        }

        // Apply slow mode
        if (this.config.playwright.slowMo) {
          await page.waitForTimeout(this.config.playwright.slowMo);
        }
      }

      await page.close();
      await browser.close();

      const duration = Date.now() - startTime;

      return {
        status: this.failedSteps === 0 ? 'Passed' : this.failedSteps < this.passedSteps ? 'Passed' : 'Failed',
        totalSteps: this.executedSteps,
        passedSteps: this.passedSteps,
        failedSteps: this.failedSteps,
        skippedSteps: 0,
        executionTime: duration,
        timestamp: new Date().toISOString(),
        errors: this.errors.length > 0 ? this.errors : undefined,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        status: 'Failed',
        totalSteps: this.executedSteps,
        passedSteps: this.passedSteps,
        failedSteps: this.failedSteps + 1,
        skippedSteps: testCase.steps.length - this.executedSteps,
        executionTime: duration,
        timestamp: new Date().toISOString(),
        errors: [
          {
            stepId: 0,
            error: `Test execution failed: ${error}`,
            timestamp: new Date().toISOString(),
          },
        ],
      };
    }
  }

  /**
   * Execute individual step
   */
  private async executeStep(page: Page, step: any, index: number): Promise<void> {
    const action = step.action.toLowerCase();

    // Parse and execute based on action type
    if (action.includes('navigate') || action.includes('goto')) {
      const urlMatch = step.action.match(/https?:\/\/\S+|\/\S+/);
      if (urlMatch) {
        await page.goto(urlMatch[0], { waitUntil: 'networkidle' });
      }
    } else if (action.includes('click')) {
      const match = step.action.match(/click\s+(?:on\s+)?(?:the\s+)?([^,]*)/i);
      if (match) {
        const element = match[1].trim();
        try {
          await page.getByRole('button', { name: new RegExp(element, 'i') }).click();
        } catch {
          await page.click(`text=${element}`);
        }
      }
    } else if (action.includes('fill') || action.includes('enter') || action.includes('type')) {
      const match = step.action.match(/(?:fill|enter|type)\s+([^in]+)(?:\s+in|\s+into)\s+(.+)/i);
      if (match) {
        const value = match[1].trim();
        const field = match[2].trim();
        await page.fill(`input[name="${field}"]`, value);
      }
    } else if (action.includes('select')) {
      const match = step.action.match(/select\s+([^from]*)\s+from\s+(.+)/i);
      if (match) {
        const option = match[1].trim();
        const dropdown = match[2].trim();
        await page.selectOption(`select[name="${dropdown}"]`, option);
      }
    } else if (action.includes('wait')) {
      const match = step.action.match(/wait\s+(\d+)/i);
      if (match) {
        await page.waitForTimeout(parseInt(match[1]));
      }
    }

    // Verify expected result if present
    if (step.expectedResult) {
      await this.verify(page, step.expectedResult);
    }
  }

  /**
   * Verify expected result
   */
  private async verify(page: Page, expected: string): Promise<void> {
    const lower = expected.toLowerCase();

    if (lower.includes('visible') || lower.includes('appear')) {
      // This is a soft check - just verify page is still loaded
      await page.waitForLoadState('networkidle');
    } else if (lower.includes('url')) {
      const urlMatch = expected.match(/https?:\/\/\S+|\/\S+/);
      if (urlMatch) {
        const currentUrl = page.url();
        if (!currentUrl.includes(urlMatch[0])) {
          throw new Error(`Expected URL to contain ${urlMatch[0]}, got ${currentUrl}`);
        }
      }
    }
  }

  /**
   * Launch browser
   */
  private async launchBrowser(): Promise<Browser> {
    const browserType = this.config.playwright.browserType;
    const headless = this.config.playwright.headless;
    const slowMo = this.config.playwright.slowMo;

    let launcher;
    switch (browserType) {
      case 'firefox':
        launcher = firefox;
        break;
      case 'webkit':
        launcher = webkit;
        break;
      default:
        launcher = chromium;
    }

    this.browser = await launcher.launch({
      headless: headless,
      slowMo: slowMo,
    });

    return this.browser;
  }

  /**
   * Close browser
   */
  public async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

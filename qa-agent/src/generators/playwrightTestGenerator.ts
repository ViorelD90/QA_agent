import { TestCase, TestStep } from '../types/TestCase';
import { QAAgentConfig } from '../types/Config';
import { MemoryManager } from '../memory/memoryManager';

export class PlaywrightTestGenerator {
  private config: QAAgentConfig;
  private memoryManager: MemoryManager;

  constructor(config: QAAgentConfig, memoryManager: MemoryManager) {
    this.config = config;
    this.memoryManager = memoryManager;
  }

  /**
   * Generate Playwright test from test case
   */
  public async generateTest(testCase: TestCase, appName?: string): Promise<string> {
    const app =
      appName && this.config.applications.find((a) => a.name === appName)
        ? this.config.applications.find((a) => a.name === appName)!
        : this.config.applications[0];

    const testCode = this.buildTestCode(testCase, app);
    return testCode;
  }

  /**
   * Build complete test code
   */
  private buildTestCode(testCase: TestCase, app: any): string {
    const testName = this.sanitizeTestName(testCase.title);
    const baseUrl = app.baseUrl;
    const browserType = this.config.playwright.browserType;

    const stepsCode = this.generateStepsCode(testCase.steps);
    const preferences: any = this.config.testGeneration || {};
    const selectorStrategy = preferences.selectorStrategy || 'role';
    const includeScreenshots = preferences.includeScreenshots || false;

    return `import { test, expect } from '@playwright/test';

test.describe('${testName}', () => {
  const baseUrl = '${baseUrl}';
  let page: any;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
  });

  test('${testName}', async () => {
    // Test Case: TC-${testCase.id}
    // Task ID: ${testCase.taskId}
    // Description: ${testCase.description}
    
    // Preconditions
    ${testCase.preconditions?.map((p) => `// - ${p}`).join('\n    ')}

${stepsCode}

    // Expected Outcome: ${testCase.expectedOutcome}
  });
});
`;
  }

  /**
   * Generate step code
   */
  private generateStepsCode(steps: TestStep[]): string {
    return steps
      .map((step, idx) => this.generateStepCode(step, idx))
      .join('\n\n    ');
  }

  /**
   * Generate individual step code
   */
  private generateStepCode(step: TestStep, index: number): string {
    const actionLines = this.parseAction(step.action);
    const verificationLines = this.parseVerification(step.expectedResult);

    let code = `// Step ${step.stepNumber}: ${step.action}\n    `;
    code += actionLines.join('\n    ');

    if (verificationLines.length > 0) {
      code += `\n\n    // Expected: ${step.expectedResult}\n    `;
      code += verificationLines.join('\n    ');
    }

    return code;
  }

  /**
   * Parse action into Playwright code
   */
  private parseAction(action: string): string[] {
    const lines: string[] = [];
    const lower = action.toLowerCase();

    // Navigation
    if (lower.includes('navigate') || lower.includes('go to') || lower.includes('visit')) {
      const urlMatch = action.match(/https?:\/\/\S+|\/\S+/);
      if (urlMatch) {
        lines.push(`await page.goto('${urlMatch[0]}', { waitUntil: 'networkidle' });`);
      } else {
        lines.push(`// Navigate to: ${action}`);
        lines.push(`// await page.goto('URL', { waitUntil: 'networkidle' });`);
      }
    }
    // Click
    else if (lower.includes('click')) {
      const elementMatch = action.match(/click\s+(?:on\s+)?(?:the\s+)?([^,]*)/i);
      if (elementMatch) {
        const element = elementMatch[1].trim();
        lines.push(`await page.getByRole('button', { name: /${element}/i }).click();`);
        lines.push(`await page.waitForLoadState('networkidle');`);
      } else {
        lines.push(`// await page.click('selector');`);
      }
    }
    // Fill form
    else if (lower.includes('enter') || lower.includes('type') || lower.includes('fill')) {
      const match = action.match(/(?:enter|type|fill)\s+([^in]+)(?:\s+in|\s+into)\s+(?:the\s+)?(.+)/i);
      if (match) {
        const value = match[1].trim();
        const field = match[2].trim();
        lines.push(`await page.fill('input[name="${field}"]', '${value}');`);
      } else {
        lines.push(`// await page.fill('selector', 'value');`);
      }
    }
    // Select dropdown
    else if (lower.includes('select')) {
      const match = action.match(/select\s+([^from]*)\s+from\s+(.+)/i);
      if (match) {
        const option = match[1].trim();
        const dropdown = match[2].trim();
        lines.push(`await page.selectOption('select[name="${dropdown}"]', '${option}');`);
      } else {
        lines.push(`// await page.selectOption('selector', 'value');`);
      }
    }
    // Wait
    else if (lower.includes('wait')) {
      const timeMatch = action.match(/wait\s+(\d+)\s*(ms|seconds?|s)?/i);
      if (timeMatch) {
        const time = timeMatch[2]?.toLowerCase().includes('s') ? parseInt(timeMatch[1]) * 1000 : parseInt(timeMatch[1]);
        lines.push(`await page.waitForTimeout(${time});`);
      } else {
        lines.push(`await page.waitForLoadState('networkidle');`);
      }
    }
    // Default
    else {
      lines.push(`// Action: ${action}`);
      lines.push(`// TODO: Implement this step manually`);
    }

    return lines;
  }

  /**
   * Parse expected result into verification code
   */
  private parseVerification(expected: string): string[] {
    const lines: string[] = [];

    if (!expected || expected.trim().length === 0) {
      return lines;
    }

    const lower = expected.toLowerCase();

    // Element visible
    if (lower.includes('visible') || lower.includes('appear') || lower.includes('display')) {
      const elementMatch = expected.match(/(?:should |is |be\s+)?(?:visible|appear|display|shown)(?:\s+in|,?)?\s*(.+)/i);
      if (elementMatch) {
        const element = elementMatch[1].trim();
        lines.push(`await expect(page.locator('text=${element}')).toBeVisible();`);
      }
    }
    // Contains text
    else if (lower.includes('contain') || lower.includes('show') || lower.includes('display')) {
      const textMatch = expected.match(/(?:contains|shows?|displays?)\s+(?:the\s+)?(?:text\s+)?["\']?([^"\']+)["\']?/i);
      if (textMatch) {
        const text = textMatch[1].trim();
        lines.push(`await expect(page).toContainText('${text}');`);
      }
    }
    // URL
    else if (lower.includes('url') || lower.includes('redirect')) {
      const urlMatch = expected.match(/(?:redirects?|navigates?)\s+to\s+(https?:\/\/\S+|\/\S+)/i);
      if (urlMatch) {
        const url = urlMatch[1];
        lines.push(`await expect(page).toHaveURL(/${url}/);`);
      }
    }
    // Success message
    else if (lower.includes('success') || lower.includes('error') || lower.includes('message')) {
      lines.push(`// Verify: ${expected}`);
      lines.push(`// await expect(page.locator('.message')).toContainText('${expected}');`);
    }
    // Default
    else {
      lines.push(`// Verify: ${expected}`);
      lines.push(`// TODO: Add assertion for this verification`);
    }

    return lines;
  }

  /**
   * Sanitize test name for file naming
   */
  private sanitizeTestName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .substring(0, 50);
  }

  /**
   * Generate test file name
   */
  public getTestFileName(testCase: TestCase): string {
    const sanitized = this.sanitizeTestName(testCase.title);
    return `${sanitized}.spec.ts`;
  }

  /**
   * Generate full test file with fixtures
   */
  public async generateFullTest(testCase: TestCase, appName?: string): Promise<string> {
    const baseTest = await this.generateTest(testCase, appName);

    // Add fixtures if needed
    const fixturesCode = this.generateFixtures();

    return fixturesCode + '\n\n' + baseTest;
  }

  /**
   * Generate fixtures code
   */
  private generateFixtures(): string {
    return `import { test as base, expect } from '@playwright/test';

type TestFixtures = {
  authenticatedPage: void;
};

export const test = base.extend<TestFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // TODO: Implement authentication fixture if needed
    await use();
  },
});`;
  }
}

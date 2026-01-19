import fs from 'fs';
import path from 'path';
import { Scenario } from '../types/Scenario';

export class ScenarioWriter {
  private scenariosPath: string;

  constructor(scenariosPath: string = './scenarios') {
    this.scenariosPath = scenariosPath;

    // Ensure directory exists
    if (!fs.existsSync(scenariosPath)) {
      fs.mkdirSync(scenariosPath, { recursive: true });
    }
  }

  /**
   * Write scenario to file
   */
  public async write(scenario: Scenario): Promise<string> {
    const fileName = this.generateFileName(scenario);
    const filePath = path.join(this.scenariosPath, fileName);

    try {
      fs.writeFileSync(filePath, JSON.stringify(scenario, null, 2), 'utf-8');
      return filePath;
    } catch (error) {
      throw new Error(`Failed to write scenario file: ${error}`);
    }
  }

  /**
   * Read scenario from file
   */
  public async read(scenarioId: string): Promise<Scenario | null> {
    const filePath = path.join(this.scenariosPath, `${scenarioId}.scenario.json`);

    try {
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`Failed to read scenario: ${error}`);
      return null;
    }
  }

  /**
   * List all scenarios
   */
  public async list(): Promise<Scenario[]> {
    try {
      const files = fs.readdirSync(this.scenariosPath).filter((f) => f.endsWith('.scenario.json'));
      const scenarios: Scenario[] = [];

      for (const file of files) {
        const content = fs.readFileSync(path.join(this.scenariosPath, file), 'utf-8');
        scenarios.push(JSON.parse(content));
      }

      return scenarios;
    } catch (error) {
      console.error(`Failed to list scenarios: ${error}`);
      return [];
    }
  }

  /**
   * Generate summary report
   */
  public async generateSummaryReport(scenario: Scenario): Promise<string> {
    const markdown = `# Scenario Report: ${scenario.taskTitle}

## Overview
- **Scenario ID**: ${scenario.scenarioId}
- **Task ID**: ${scenario.taskId}
- **Created**: ${scenario.createdAt}
- **Last Updated**: ${scenario.updatedAt}

## Task Description
${scenario.taskDescription}

## Test Cases (${scenario.testCases.length})
${scenario.testCases
  .map(
    (tc) => `
### ${tc.title}
- **ID**: ${tc.id}
- **Status**: ${tc.status}
- **Priority**: ${tc.priority}

**Preconditions**:
${tc.preconditions?.map((p) => `- ${p}`).join('\n') || 'None'}

**Steps**:
${tc.steps.map((step) => `${step.stepNumber}. ${step.action}`).join('\n')}

**Expected Outcome**: ${tc.expectedOutcome}

${tc.userEdits && tc.userEdits.length > 0 ? `**User Edits**:\n${tc.userEdits.map((edit) => `- Step ${edit.stepId}: Changed from "${edit.originalText}" to "${edit.editedText}"`).join('\n')}` : ''}
`
  )
  .join('\n')}

## Automation Approach
${scenario.automationApproach}

## Tested URLs
${scenario.testedUrls?.map((url) => `- ${url}`).join('\n') || 'None'}

## Application Profile
${scenario.applicationProfile ? `- **Name**: ${scenario.applicationProfile.name}
- **Base URL**: ${scenario.applicationProfile.baseUrl}
- **Login Method**: ${scenario.applicationProfile.loginMethod}
- **Environment**: ${scenario.applicationProfile.environment}` : 'None'}

## Execution Results
${scenario.executionResults ? `- **Status**: ${scenario.executionResults.status}
- **Total Steps**: ${scenario.executionResults.totalSteps}
- **Passed**: ${scenario.executionResults.passedSteps}
- **Failed**: ${scenario.executionResults.failedSteps}
- **Duration**: ${scenario.executionResults.executionTime}ms` : 'Not executed'}

## Notes
${scenario.notes || 'None'}
`;
    return markdown;
  }

  /**
   * Export scenario as HTML report
   */
  public async exportAsHtml(scenario: Scenario): Promise<string> {
    const markdown = await this.generateSummaryReport(scenario);

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>QA Automation Scenario - ${scenario.taskTitle}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    h2 { color: #666; border-bottom: 2px solid #007acc; padding-bottom: 5px; }
    .scenario-meta { background: #f0f0f0; padding: 10px; border-radius: 5px; }
    .test-case { border-left: 4px solid #007acc; padding: 10px; margin: 10px 0; background: #fafafa; }
    .step { margin-left: 20px; }
    pre { background: #f5f5f5; padding: 10px; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>${scenario.taskTitle}</h1>
  <div class="scenario-meta">
    <p><strong>Scenario ID:</strong> ${scenario.scenarioId}</p>
    <p><strong>Task ID:</strong> ${scenario.taskId}</p>
    <p><strong>Created:</strong> ${scenario.createdAt}</p>
  </div>
  
  <h2>Description</h2>
  <p>${scenario.taskDescription}</p>
  
  <h2>Test Cases</h2>
  ${scenario.testCases
    .map(
      (tc) => `
    <div class="test-case">
      <h3>${tc.title}</h3>
      <p><strong>Status:</strong> ${tc.status} | <strong>Priority:</strong> ${tc.priority}</p>
      <h4>Steps:</h4>
      <ul>
        ${tc.steps.map((step) => `<li>${step.stepNumber}. ${step.action}</li>`).join('')}
      </ul>
      <p><strong>Expected Outcome:</strong> ${tc.expectedOutcome}</p>
    </div>
  `
    )
    .join('')}
  
  <h2>Execution Results</h2>
  ${
    scenario.executionResults
      ? `
    <p><strong>Status:</strong> ${scenario.executionResults.status}</p>
    <p><strong>Duration:</strong> ${scenario.executionResults.executionTime}ms</p>
    <p><strong>Pass Rate:</strong> ${Math.round((scenario.executionResults.passedSteps / scenario.executionResults.totalSteps) * 100)}%</p>
  `
      : '<p>Not executed</p>'
  }
</body>
</html>`;

    return html;
  }

  /**
   * Generate file name from scenario
   */
  private generateFileName(scenario: Scenario): string {
    const sanitized = scenario.taskTitle
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 50);

    return `${sanitized}.scenario.json`;
  }

  /**
   * Delete scenario file
   */
  public async delete(scenarioId: string): Promise<boolean> {
    try {
      const filePath = path.join(this.scenariosPath, `${scenarioId}.scenario.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Failed to delete scenario: ${error}`);
      return false;
    }
  }
}

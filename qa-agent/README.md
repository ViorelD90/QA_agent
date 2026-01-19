# QA Agent - Automated QA Workflow for Playwright

A powerful CLI tool that automates the QA workflow for Playwright projects, integrating with Azure DevOps to automatically generate, validate, and manage test cases.

## Features

✨ **Core Features**
- 🔗 Automatic task fetching from Azure DevOps
- 🧪 Intelligent test case generation from acceptance criteria
- 🎭 Playwright test script generation
- 👥 Interactive user review workflow
- 💾 Memory system for learning user preferences
- 📊 Scenario reporting with execution results
- 🔄 Multi-application support (Pega, custom apps, etc.)

🤖 **Intelligent Features**
- Detects ambiguous acceptance criteria and asks clarifying questions
- Learns from user edits to improve future generations
- Stores application profiles for faster test generation
- Supports multiple login flows (forms, SSO, API, custom)
- Memory-based step recommendations

## Quick Start

### 1. Installation

```bash
npm install -g qa-agent
```

Or clone and build locally:

```bash
git clone <repo-url>
cd qa-agent
npm install
npm run build
npm link  # Makes 'qa-agent' available globally
```

### 2. Configuration

```bash
qa-agent config
```

Follow the prompts to:
- Enter Azure DevOps organization, project, and PAT token
- Configure your applications (base URLs, login flows)
- Set Playwright preferences (browser, headless mode, etc.)

This creates `qa-agent.config.json` in your project root.

### 3. Run Your First Sync

```bash
qa-agent sync
```

The agent will:
1. ✅ Connect to Azure DevOps
2. 📥 Fetch your assigned tasks (New/Active state)
3. 🧪 Generate test cases from acceptance criteria
4. 👥 Show you the generated test cases for review
5. 🎭 Generate Playwright test scripts
6. 🎬 Run tests in headed + slow mode
7. 📄 Save scenario files for reference

## Commands

### `qa-agent sync [appName]`

Main command that runs the complete workflow.

**Options:**
- `appName` (optional): Filter tasks by application profile name

**Example:**
```bash
qa-agent sync pega-app
```

**Workflow:**
```
1. Fetch Azure DevOps tasks
   ↓
2. Generate test cases
   ↓
3. Review with user (approve/edit/regenerate)
   ↓
4. Generate Playwright tests
   ↓
5. Run tests in validation mode
   ↓
6. Save scenario file
   ↓
7. Record in memory for future runs
```

### `qa-agent config`

Interactive configuration wizard.

**Menu:**
- Update Azure DevOps credentials
- Add/edit application profiles
- Configure Playwright settings
- View current configuration
- Save and exit

**Example:**
```bash
qa-agent config
⚙️  QA Agent Configuration

Configuration Menu:
  [1] Update Azure DevOps credentials
  [2] Add/Edit application profile
  [3] Configure Playwright settings
  [4] View current configuration
  [5] Save and exit
  [6] Exit without saving

Choose option (1-6): 2
```

### `qa-agent memory [action]`

Manage the memory system.

**Actions:**
- `stats` - Show memory statistics
- `reset` - Clear all stored data
- `view` - Display full memory contents

**Example:**
```bash
qa-agent memory stats
💾 QA Agent Memory

📊 Memory Statistics:
{
  "version": "1.0.0",
  "processedTasksCount": 15,
  "applicationProfilesCount": 3,
  "userCorrectionsCount": 8,
  "lastSyncedTaskId": 1234
}
```

## Configuration File

The configuration is stored in `qa-agent.config.json`:

```json
{
  "azure": {
    "organization": "your-org",
    "project": "your-project",
    "patToken": "pat123...",
    "assignedTo": "user@company.com"
  },
  "playwright": {
    "headless": false,
    "slowMo": 500,
    "browserType": "chromium"
  },
  "applications": [
    {
      "name": "pega-app",
      "baseUrl": "https://app.company.com",
      "environment": "dev",
      "loginFlow": { "type": "forms" }
    }
  ],
  "paths": {
    "scenarios": "./scenarios",
    "tests": "./tests"
  }
}
```

## Memory System

The agent stores learning data in `qa-agent.memory.json`:

```json
{
  "version": "1.0.0",
  "lastSyncedTaskId": 1234,
  "processedTasks": [...],
  "userPreferences": {
    "preferredBrowser": "chromium",
    "preferredTestNamingConvention": "Given/When/Then",
    "preferredSelectorStyle": "role",
    "includeWaits": true
  },
  "applicationProfiles": {
    "pega-app": {
      "commonSteps": ["Navigate to app", "Login"],
      "frequentlyEditedSteps": ["Wait for dialog"],
      "loginMethod": "forms"
    }
  },
  "userCorrections": [...]
}
```

**What it learns:**
- Your preferred test naming conventions
- Selector strategies you prefer
- Common steps for each application
- Patterns in your edits to test cases
- Applications you frequently test

**Commands:**
```bash
qa-agent memory stats     # View statistics
qa-agent memory reset     # Clear all memory
qa-agent memory view      # See full contents
```

## Test Case Generation

### From Acceptance Criteria

If your Azure DevOps task has acceptance criteria in BDD format:

```
Given I am logged in
When I click the "Create" button
Then a form appears
And I can enter data
```

The agent generates test steps automatically:

```
Step 1: Navigate to application
Step 2: Login with credentials
Step 3: Click the "Create" button
  ✓ Expected: Form appears
Step 4: Enter data in form
  ✓ Expected: Data is accepted
```

### From Task Description

If acceptance criteria are missing, the agent:
1. ✅ Generates a draft test case
2. ❓ Asks clarifying questions:
   - "What is the main feature being tested?"
   - "What inputs or data are needed?"
   - "What is the expected outcome?"
3. 🎯 Generates refined test cases based on your answers

## Playwright Test Generation

The agent generates production-ready Playwright tests:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Test: Create New Widget', () => {
  const baseUrl = 'https://app.company.com';
  let page: any;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
  });

  test('Test: Create New Widget', async () => {
    // Step 1: Navigate to application
    await page.goto(baseUrl, { waitUntil: 'networkidle' });

    // Step 2: Click the "Create" button
    await page.getByRole('button', { name: /Create/i }).click();
    await page.waitForLoadState('networkidle');

    // Step 3: Enter widget name
    await page.fill('input[name="widgetName"]', 'My Widget');

    // Expected: Form is submitted successfully
    // TODO: Add assertion for this verification
  });
});
```

## Scenario Files

After validation, scenarios are saved as `.scenario.json` files in `./scenarios/`:

```json
{
  "scenarioId": "SC-1234-1234567890",
  "taskId": 1234,
  "taskTitle": "Create New Widget",
  "testCases": [...],
  "automationApproach": "Playwright TypeScript",
  "userEdits": [...],
  "executionResults": {
    "status": "Passed",
    "totalSteps": 5,
    "passedSteps": 5,
    "failedSteps": 0,
    "executionTime": 2345
  },
  "notes": "Generated by QA Agent"
}
```

## Multi-Application Support

Configure multiple applications:

```json
{
  "applications": [
    {
      "name": "pega-claims",
      "baseUrl": "https://pega-claims.company.com",
      "loginFlow": { "type": "sso" }
    },
    {
      "name": "pega-billing",
      "baseUrl": "https://pega-billing.company.com",
      "loginFlow": { "type": "forms" }
    },
    {
      "name": "admin-portal",
      "baseUrl": "https://admin.company.com",
      "loginFlow": { "type": "custom" }
    }
  ]
}
```

Run sync for specific app:

```bash
qa-agent sync pega-claims    # Tests only Pega Claims
qa-agent sync                # Tests default app
```

## Environment Variables

Instead of config file, use environment variables:

```bash
export AZURE_ORG=your-organization
export AZURE_PROJECT=your-project
export AZURE_PAT=your-pat-token
export AZURE_ASSIGNED_TO=user@company.com
export PLAYWRIGHT_HEADLESS=false
export PLAYWRIGHT_SLOW_MO=500
export PLAYWRIGHT_BROWSER=chromium
export DEFAULT_APP=pega-app
export APPLICATIONS='[{"name":"pega-app","baseUrl":"..."}]'
```

Then create `.env` file:
```
AZURE_ORG=your-organization
AZURE_PROJECT=your-project
AZURE_PAT=your-pat-token
AZURE_ASSIGNED_TO=user@company.com
```

## Folder Structure

```
your-playwright-project/
├── qa-agent/
│   ├── src/
│   │   ├── cli/
│   │   │   ├── index.ts (entry point)
│   │   │   ├── syncCommand.ts
│   │   │   ├── configCommand.ts
│   │   │   └── memoryCommand.ts
│   │   ├── azure/
│   │   │   ├── adoClient.ts
│   │   │   └── taskFetcher.ts
│   │   ├── parsers/
│   │   │   ├── acceptanceCriteriaParser.ts
│   │   │   └── testCaseGenerator.ts
│   │   ├── generators/
│   │   │   ├── playwrightTestGenerator.ts
│   │   │   └── scenarioWriter.ts
│   │   ├── validators/
│   │   │   ├── userReview.ts
│   │   │   └── testRunner.ts
│   │   ├── memory/
│   │   │   └── memoryManager.ts
│   │   ├── config/
│   │   │   └── configLoader.ts
│   │   └── types/
│   │       ├── Task.ts
│   │       ├── TestCase.ts
│   │       ├── Scenario.ts
│   │       ├── Config.ts
│   │       └── Memory.ts
│   ├── dist/       (compiled output)
│   ├── scenarios/  (generated scenario files)
│   ├── tests/      (generated test files)
│   ├── package.json
│   ├── tsconfig.json
│   ├── qa-agent.config.json
│   └── qa-agent.memory.json
```

## Workflow Example

```
1. Run sync command
   $ qa-agent sync pega-app

2. Agent fetches 3 tasks from Azure DevOps
   ✅ Found 3 task(s)

3. For first task - "Create Widget":
   📝 Test Cases Generated:
   - Step 1: Navigate to app
   - Step 2: Login
   - Step 3: Click Create button
   - Step 4: Fill form
   - Step 5: Submit

4. User review:
   Options:
   [Y] Yes - Approve test cases
   [N] No - Edit test cases
   [R] Regenerate - Start over
   [A] Add steps - Add more test cases
   
   User selects: N (wants to edit)

5. User edits:
   Enter step numbers to edit (comma-separated): 3,5
   
   Enter new text for step 3: Click "Add New Widget" button
   Enter new text for step 5: Submit form and verify success message

6. Agent generates Playwright tests
   ✅ Generated 1 test file(s)

7. Run tests:
   🎬 Running tests in headed + slow mode
   
   ✓ Step 1: Navigate to application
   ✓ Step 2: Login
   ✓ Step 3: Click "Add New Widget" button
   ✓ Step 4: Fill form
   ✓ Step 5: Submit form and verify success message
   
   Test Results: PASSED (5/5 steps)

8. Scenario saved
   ✅ Scenario saved: ./scenarios/create_widget.scenario.json

9. Memory updated with:
   - Preferred selector style
   - User edits (for future reference)
   - Application profile
   - Common patterns

10. Repeat for remaining 2 tasks

✨ Sync completed successfully!
```

## Troubleshooting

### "Could not connect to Azure DevOps"
- Verify organization name and project name
- Check PAT token is valid and hasn't expired
- Ensure PAT has "Work Items (read & write)" scope

### "No tasks found"
- Check `assignedTo` email matches your Azure DevOps email
- Verify you have tasks in "New" or "Active" state
- Check task assignments in Azure DevOps

### Tests fail to run
- Verify application base URL is accessible
- Check login credentials are correct
- Ensure Playwright is installed: `npm install @playwright/test`

### Memory issues
- View memory: `qa-agent memory view`
- Reset if corrupted: `qa-agent memory reset`
- Check file: `qa-agent.memory.json` in project root

## Development

### Build from source

```bash
git clone <repo-url>
cd qa-agent
npm install
npm run build
npm run dev  # Run with ts-node
```

### Run in development

```bash
npm run sync pega-app
npm run config
npm run memory stats
```

### Run specific command

```bash
npx ts-node src/cli/index.ts sync
npx ts-node src/cli/index.ts config
```

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT

## Support

For issues, questions, or feature requests, please open an issue on GitHub or contact: support@company.com

---

**Happy Testing! 🚀**

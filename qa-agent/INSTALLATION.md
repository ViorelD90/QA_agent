# Installation & Setup Guide

## Prerequisites

- **Node.js**: 18.0.0 or higher
- **npm** or **yarn**
- **Azure DevOps**: Access to your organization and project
- **Git**: For cloning the repository (optional)

## Step 1: Install QA Agent

### Option A: Install Globally from npm (Recommended)

```bash
npm install -g qa-agent
qa-agent --version  # Verify installation
```

### Option B: Clone and Build Locally

```bash
# Clone the repository
git clone <repository-url>
cd qa-agent

# Install dependencies
npm install

# Build the project
npm run build

# Link globally (optional, makes 'qa-agent' available in terminal)
npm link
```

### Option C: Add to Existing Playwright Project

```bash
cd your-playwright-project
npm install --save-dev qa-agent

# Run with npx
npx qa-agent sync
```

## Step 2: Prepare Azure DevOps

### Get Your Organization & Project Details

1. Go to your Azure DevOps organization: `https://dev.azure.com/YOUR_ORG`
2. Select your project
3. Note your organization name and project name from the URL

### Create a Personal Access Token (PAT)

1. Click your profile icon (top right) → **Personal access tokens**
2. Click **New Token**
3. Fill in:
   - **Name**: "QA Agent"
   - **Organization**: Select your organization
   - **Expiration**: 90 days or longer
4. **Scopes**: Select **Work Items (read & write)**
5. Click **Create**
6. **Copy and save** the token securely (you won't see it again)

## Step 3: Configure QA Agent

Run the interactive configuration:

```bash
qa-agent config
```

Answer the prompts:

1. **Organization name**: Your Azure DevOps organization (e.g., "mycompany")
2. **Project name**: Your project (e.g., "MyProduct")
3. **PAT token**: Paste the token you created above
4. **Assigned to email**: Your email in Azure DevOps (e.g., "john.doe@company.com")
5. **Application profiles**: Add your applications
   - Name: "pega-app"
   - Base URL: "https://pega-dev.company.com"
   - Environment: "dev"
   - Login flow: "forms"
6. **Playwright settings**:
   - Headless mode: No (for validation)
   - Slow motion: 500ms (for visibility)
   - Browser: chromium

### Configuration File Location

The configuration is saved to:
```
./qa-agent.config.json
```

Example:
```json
{
  "azure": {
    "organization": "mycompany",
    "project": "MyProduct",
    "patToken": "abc123xyz...",
    "assignedTo": "john.doe@company.com"
  },
  "playwright": {
    "headless": false,
    "slowMo": 500,
    "browserType": "chromium"
  },
  "applications": [
    {
      "name": "pega-app",
      "baseUrl": "https://pega-dev.company.com",
      "environment": "dev",
      "loginFlow": {
        "type": "forms"
      }
    }
  ],
  "paths": {
    "scenarios": "./scenarios",
    "tests": "./tests"
  }
}
```

## Step 4: Test the Connection

```bash
qa-agent sync
```

If successful, you should see:
```
🚀 QA Agent Sync Started

📋 Loading configuration...
🔗 Testing Azure DevOps connection...
✅ Connected

📥 Fetching assigned tasks...
✅ Found X task(s)
```

If you get an error, check:
1. Azure DevOps credentials are correct
2. PAT token hasn't expired
3. You have tasks assigned to you in New/Active state

## Step 5: Create Your First Scenario

Follow the interactive workflow:

1. **Review test cases**: You'll see generated test steps
2. **Approve or edit**: Choose [Y], [N], [R], or [A]
3. **Run tests**: Tests will run in headed mode
4. **Scenario saved**: File saved to `./scenarios/`

## Usage Commands

### Main Commands

```bash
# Fetch tasks and generate tests (main workflow)
qa-agent sync

# For specific application
qa-agent sync pega-app

# Configure settings
qa-agent config

# Manage memory
qa-agent memory stats    # View statistics
qa-agent memory reset    # Clear all data
qa-agent memory view     # View full contents

# Help
qa-agent help
qa-agent --version
```

## Environment Setup (Alternative)

If you prefer environment variables instead of config file:

### Create .env file

```
# .env file in your project root
AZURE_ORG=your-organization
AZURE_PROJECT=your-project
AZURE_PAT=your-pat-token-here
AZURE_ASSIGNED_TO=your.email@company.com
PLAYWRIGHT_HEADLESS=false
PLAYWRIGHT_SLOW_MO=500
PLAYWRIGHT_BROWSER=chromium
DEFAULT_APP=pega-app
```

Then QA Agent will read from these variables automatically.

## Project Structure

After setup, your project should look like:

```
your-project/
├── qa-agent/              # QA Agent installation
│   ├── src/
│   ├── dist/              # Compiled code
│   ├── package.json
│   └── qa-agent.config.json
├── scenarios/             # Generated scenario files
├── tests/                 # Generated test files
├── qa-agent.memory.json   # Learning memory (auto-created)
└── playwright.config.ts   # Your existing Playwright config
```

## Next Steps

1. ✅ Installation complete
2. ✅ Configuration done
3. ✅ Connection tested

Now you're ready to:
- Run `qa-agent sync` to generate your first tests
- Review and approve test cases
- Run tests in headed mode
- Save scenario files
- View and manage your memory

## Troubleshooting Installation

### `Command not found: qa-agent`

If using npm install -g:
```bash
# Verify installation
npm list -g qa-agent

# Reinstall
npm install -g qa-agent --force

# Or use npx
npx qa-agent --version
```

If local installation:
```bash
# Use full path
./node_modules/.bin/qa-agent --version

# Or use npm script
npm run qa-agent  # Add to package.json scripts
```

### TypeScript Errors During Build

```bash
# Clear cache and rebuild
npm run clean
npm run build
```

### Playwright Issues

```bash
# Reinstall Playwright
npm install --save-dev @playwright/test

# Install browsers
npx playwright install
```

## Support

If you encounter issues:
1. Check the [README.md](./README.md) for command reference
2. Run `qa-agent --help` for CLI help
3. Check `qa-agent.memory.json` for diagnostic info
4. Review Azure DevOps configuration

## Next: Configure Your Applications

See [APPLICATION_CONFIG.md](./APPLICATION_CONFIG.md) for advanced application setup.

# Getting Started with QA Agent

Welcome! This guide will get you up and running with QA Agent in 5 minutes.

## What is QA Agent?

QA Agent is an intelligent CLI tool that automates your QA workflow:
- Fetches tasks from Azure DevOps
- Generates test cases from acceptance criteria
- Creates Playwright test scripts
- Runs tests in validation mode
- Saves scenario documentation

## 5-Minute Quick Start

### 1. Installation (1 minute)

```bash
npm install -g qa-agent
```

Verify:
```bash
qa-agent --version
# Should output: QA Agent v1.0.0
```

### 2. Initial Configuration (2 minutes)

Prepare your Azure DevOps info:
- Organization name (from URL: `dev.azure.com/YOUR_ORG`)
- Project name
- Personal Access Token (PAT) - [How to create](https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate)
- Your email in Azure DevOps

Then run:
```bash
qa-agent config
```

Follow the prompts and select your settings. When done, it creates `qa-agent.config.json`.

### 3. Run Your First Sync (2 minutes)

```bash
qa-agent sync
```

The agent will:
1. ✅ Connect to Azure DevOps
2. 📥 Fetch your assigned tasks
3. 🧪 Generate test cases
4. 👥 Ask you to review (approve/edit/regenerate)
5. 🎭 Generate Playwright tests
6. 🎬 Run tests (headed mode)
7. 📄 Save scenario file

### 4. Review Output

Check the generated files:
```
./scenarios/          # Scenario documentation
./tests/              # Playwright test files
qa-agent.memory.json  # Learning data (auto-created)
```

## That's It! 🎉

You're now using QA Agent to automate your QA workflow.

## Next: Understanding the Workflow

### What Happens During Sync?

```
┌─────────────────────────────────────────┐
│ 1. Fetch Azure DevOps Tasks             │
│    (New/Active tasks assigned to you)   │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ 2. Parse Acceptance Criteria            │
│    (Extract test steps)                 │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ 3. Generate Test Cases                  │
│    (Create step-by-step tests)          │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ 4. User Review                          │
│    (You approve/edit/regenerate)        │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ 5. Generate Playwright Tests            │
│    (TypeScript test scripts)            │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ 6. Run Tests                            │
│    (Headed + slow mode validation)      │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ 7. Save Scenario                        │
│    (Documentation + execution results)  │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ 8. Learn from You                       │
│    (Store preferences in memory)        │
└─────────────────────────────────────────┘
```

### What Gets Saved?

After each sync:

1. **Scenario File** (`scenarios/*.scenario.json`)
   - Task information
   - Test cases with steps
   - Your edits
   - Execution results
   - Notes

2. **Memory** (`qa-agent.memory.json`)
   - Your preferences (browser, selector style, etc.)
   - Application profiles
   - Patterns in your edits
   - Previously processed tasks

3. **Test Files** (`tests/*.spec.ts`)
   - Generated Playwright tests
   - Ready to run with: `npx playwright test`

## Key Features to Explore

### 1. Memory System

QA Agent learns from you:
```bash
qa-agent memory stats   # See what was learned
qa-agent memory view    # See all stored data
qa-agent memory reset   # Clear everything
```

Memory tracks:
- Your preferred browser and settings
- How you like test steps named
- Common edits you make
- App profiles you frequently test

### 2. Multiple Applications

Configure multiple apps in `qa-agent.config.json`:

```json
{
  "applications": [
    {
      "name": "pega-claims",
      "baseUrl": "https://pega.company.com"
    },
    {
      "name": "admin-portal",
      "baseUrl": "https://admin.company.com"
    }
  ]
}
```

Then run:
```bash
qa-agent sync pega-claims   # Tests only Pega
qa-agent sync admin-portal  # Tests only Admin
qa-agent sync               # Tests default app
```

### 3. Test Case Review

During sync, you can:
- ✅ **[Y]** - Approve generated test cases
- ❌ **[N]** - Edit specific steps
- 🔄 **[R]** - Regenerate completely
- ➕ **[A]** - Add more test cases

### 4. Heading Mode Testing

Tests run with:
- **Headed Mode**: See the browser
- **Slow Motion**: 500ms delay between actions
- **Full Visibility**: Watch what's happening

This helps you validate before automating.

## Common Commands

```bash
# Main workflow
qa-agent sync

# For specific app
qa-agent sync app-name

# Setup
qa-agent config

# Memory
qa-agent memory stats
qa-agent memory reset
qa-agent memory view

# Help
qa-agent help
qa-agent --help
qa-agent --version
```

## Troubleshooting

### "Could not connect to Azure DevOps"
```bash
# Check your credentials in config
qa-agent config

# View configured settings
qa-agent config
# Then choose option [4]
```

### "No tasks found"
- Ensure you have tasks assigned to you in Azure DevOps
- Check they're in "New" or "Active" state
- Verify your email is correct in config

### "Test failed to run"
```bash
# Check your application is accessible
curl https://your-app-url

# Check login credentials work
# Run in browser first to verify

# Check Playwright is installed
npm install @playwright/test
```

## Next Steps

1. ✅ Run `qa-agent sync` a few times
2. 📚 Review generated scenarios: `cat scenarios/*.scenario.json`
3. 🧪 Run generated tests: `npx playwright test`
4. 🔧 Customize applications: Edit `qa-agent.config.json`
5. 📖 Read detailed docs: [README.md](./README.md)

## Need Help?

- Run: `qa-agent help`
- Check: [README.md](./README.md)
- Configure: `qa-agent config`
- Debug: `qa-agent memory view`

## Advanced Topics

When you're ready:
- [Complete README](./README.md) - Full documentation
- [Installation Guide](./INSTALLATION.md) - Detailed setup
- [Application Configuration](./APPLICATION_CONFIG.md) - Multi-app setup
- [Memory System](./README.md#memory-system) - How it learns

---

**Happy Testing! 🚀**

Start with `qa-agent sync` and follow the prompts!

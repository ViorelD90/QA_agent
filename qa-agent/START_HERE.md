# QA Agent - Complete Setup & Usage Guide

## Welcome! 👋

You now have a **complete, production-ready QA automation CLI tool** that:
- 🔗 Connects to Azure DevOps
- 🧪 Generates test cases automatically
- 🎭 Creates Playwright test scripts
- 👥 Lets you review and approve tests
- 💾 Learns from your preferences
- 📊 Documents everything

## 📋 What You Have

✅ **22 TypeScript source files** - Fully functional implementation
✅ **6 documentation files** - Complete guides
✅ **Memory system** - Learns from your work
✅ **Multi-app support** - Handle multiple applications
✅ **Azure DevOps integration** - Direct API connection
✅ **Interactive CLI** - User-friendly prompts

## 🚀 Quick Start (5 Minutes)

### Step 1: Install

```bash
cd qa-agent
npm install
npm run build
npm link  # Makes 'qa-agent' available globally
```

Or on Windows, run:
```cmd
setup.bat
```

Or on Mac/Linux:
```bash
chmod +x setup.sh
./setup.sh
```

### Step 2: Configure

```bash
qa-agent config
```

When prompted, enter:
- **Azure Organization**: your-organization
- **Azure Project**: your-project
- **PAT Token**: your-personal-access-token
- **Your Email**: your.email@company.com
- **App Base URL**: https://your-app.com
- **Headless Mode**: no (to see tests running)

### Step 3: Run

```bash
qa-agent sync
```

Follow the interactive prompts to:
1. ✅ Review generated test cases
2. ✅ Approve or edit
3. ✅ Watch tests run
4. ✅ See scenario saved

**That's it!** 🎉

## 📚 Documentation Guide

### For Quick Start
👉 Read: **[GETTING_STARTED.md](./GETTING_STARTED.md)**
- 5-minute overview
- Basic workflow
- Key features

### For Installation Help
👉 Read: **[INSTALLATION.md](./INSTALLATION.md)**
- Step-by-step setup
- Troubleshooting
- Azure DevOps configuration
- Environment variables

### For Multi-App Setup
👉 Read: **[APPLICATION_CONFIG.md](./APPLICATION_CONFIG.md)**
- Configure multiple applications
- Different login flows (forms, SSO, API)
- Per-app customization
- Page objects integration

### For Complete Reference
👉 Read: **[README.md](./README.md)**
- All commands explained
- Memory system details
- Workflow examples
- Advanced features

### For Technical Details
👉 Read: **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)**
- Architecture overview
- Module descriptions
- Type system
- Extensibility

### For File Listing
👉 Read: **[FILE_INDEX.md](./FILE_INDEX.md)**
- All files explained
- Project structure
- What each file does

## 🎯 Main Commands

### Primary Workflow
```bash
qa-agent sync [appName]
```
**What it does:**
1. Fetches your tasks from Azure DevOps
2. Generates test cases from acceptance criteria
3. Shows you generated tests (approve/edit/regenerate)
4. Generates Playwright test scripts
5. Runs tests in headed + slow mode
6. Saves scenario file
7. Learns from your edits

**Examples:**
```bash
qa-agent sync                  # Test default app
qa-agent sync pega-app         # Test specific app
qa-agent sync --verbose        # Detailed output
```

### Configuration
```bash
qa-agent config
```
**Interactive menu to:**
- Update Azure DevOps credentials
- Add/edit application profiles
- Configure Playwright settings
- View current settings

### Memory Management
```bash
qa-agent memory stats          # Show statistics
qa-agent memory reset          # Clear all data
qa-agent memory view           # See everything
```

### Help
```bash
qa-agent help                  # Show this help
qa-agent --version            # Show version
qa-agent --help               # Show help
```

## 🗂️ File Structure

```
qa-agent/
├── src/                       # Source code
│   ├── cli/                   # Commands
│   ├── azure/                 # Azure DevOps API
│   ├── parsers/               # Parse criteria → test cases
│   ├── generators/            # Generate tests + scenarios
│   ├── validators/            # Review + execute
│   ├── memory/                # Learning system
│   ├── config/                # Configuration
│   └── types/                 # TypeScript interfaces
├── dist/                      # Compiled code (created after build)
├── scenarios/                 # Generated scenario files
├── tests/                     # Generated test files
├── README.md                  # Main documentation
├── INSTALLATION.md            # Setup guide
├── GETTING_STARTED.md         # Quick start
├── APPLICATION_CONFIG.md      # App configuration
├── IMPLEMENTATION_SUMMARY.md  # Technical overview
├── FILE_INDEX.md              # File guide
├── package.json               # NPM configuration
├── tsconfig.json              # TypeScript config
├── qa-agent.config.example.json  # Example config
├── .env.example               # Example env vars
└── setup.sh / setup.bat       # Auto setup scripts
```

## ⚙️ Configuration

### File-Based (Recommended)

Create `qa-agent.config.json`:
```json
{
  "azure": {
    "organization": "mycompany",
    "project": "MyProject",
    "patToken": "pat...",
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
  ]
}
```

### Environment-Based

Create `.env`:
```
AZURE_ORG=mycompany
AZURE_PROJECT=MyProject
AZURE_PAT=pat...
AZURE_ASSIGNED_TO=user@company.com
PLAYWRIGHT_HEADLESS=false
PLAYWRIGHT_SLOW_MO=500
DEFAULT_APP=pega-app
```

## 💾 Generated Output

### Scenario Files
`scenarios/*.scenario.json` - Complete test documentation:
- Test cases with steps
- Your edits
- Execution results
- Pass/fail statistics

### Test Files
`tests/*.spec.ts` - Runnable Playwright tests:
```bash
npx playwright test              # Run all tests
npx playwright test --headed     # Run with browser open
```

### Memory
`qa-agent.memory.json` - Learning system:
- Your preferences (browser, naming style, etc.)
- App profiles (common steps, login methods)
- User corrections (patterns in your edits)
- Task history

## 🔗 Azure DevOps Setup

### 1. Create PAT Token

1. Go to: `https://dev.azure.com/YOUR_ORG`
2. Click profile icon → Personal access tokens
3. Create token with "Work Items (read & write)"
4. Copy the token
5. Use in `qa-agent config`

### 2. Get Organization & Project

From URL: `https://dev.azure.com/YOUR_ORG/YOUR_PROJECT`
- Organization = `YOUR_ORG`
- Project = `YOUR_PROJECT`

### 3. Verify Access

Ensure you have:
- Access to the project
- Tasks assigned to you
- Tasks in "New" or "Active" state

## 📖 Workflow Example

```
1. Create task in Azure DevOps
   Title: "Create New Widget"
   Description: "User should be able to create a new widget"
   Acceptance Criteria: "Given I'm logged in
                         When I click 'Create Widget'
                         Then a form appears
                         And I can enter widget details"

2. Run qa-agent
   $ qa-agent sync

3. Agent fetches your task and generates:
   ✓ Test step 1: Login
   ✓ Test step 2: Click 'Create Widget'
   ✓ Test step 3: Verify form appears
   ✓ Test step 4: Enter widget details

4. You review test cases
   [Y] Approve
   [N] Edit step 2 to "Click 'Add Widget'"
   
5. Agent generates Playwright test
6. Test runs in headed browser mode
7. You see browser navigate, click buttons, fill form
8. Scenario saved with results

✅ Done! Test is now automated and documented
```

## 🔄 Workflow Details

### The Complete Flow

```
User runs:
  qa-agent sync
       ↓
[Connect to Azure DevOps]
       ↓
[Fetch tasks in New/Active]
       ↓
For each task:
   ├─ Parse acceptance criteria
   ├─ Generate test cases
   ├─ Show to user for review
   │  ├─ [Y] Approve
   │  ├─ [N] Edit
   │  ├─ [R] Regenerate
   │  └─ [A] Add steps
   ├─ Generate Playwright tests
   ├─ Run tests (headed + slow)
   ├─ Capture results
   ├─ Save scenario file
   └─ Update memory
       ↓
[Process next task]
       ↓
✨ Sync complete
```

## 💡 Key Features

### 1. Intelligent Test Generation
- Parses BDD acceptance criteria
- Asks clarifying questions if needed
- Generates step-by-step tests
- Creates Playwright scripts

### 2. User Review Workflow
- Shows generated tests
- You approve or edit
- Options to regenerate
- Records your edits for learning

### 3. Learning Memory
- Stores your preferences
- Records patterns in edits
- Learns common steps per app
- Improves future generations

### 4. Multi-App Support
- Configure multiple applications
- Different URLs per app
- Different login flows
- Run sync for specific app

### 5. Test Execution
- Runs in headed mode
- Slow motion for visibility
- Captures execution results
- Records pass/fail stats

## ❓ FAQ

### Q: Do I need to manually write tests?
**A:** No! The agent generates them automatically from acceptance criteria.

### Q: What if acceptance criteria are unclear?
**A:** The agent asks clarifying questions and generates a draft you can refine.

### Q: Can I use this for multiple applications?
**A:** Yes! Configure multiple app profiles in `qa-agent.config.json`.

### Q: Does it learn from my edits?
**A:** Yes! Memory system records patterns to improve future generations.

### Q: Can I integrate with existing Playwright tests?
**A:** Yes! Generated tests use standard Playwright syntax.

### Q: Is it secure?
**A:** Credentials are stored locally in config or .env, never sent to third parties.

### Q: Can I regenerate tests later?
**A:** Yes! Use `qa-agent sync` with the same task ID.

## 🆘 Troubleshooting

### Connection Error to Azure DevOps
```bash
# Check credentials
qa-agent config
# Select [4] to view configuration

# Verify PAT hasn't expired
# PAT expires - create a new one

# Check organization/project names
```

### No Tasks Found
```bash
# Ensure you have tasks assigned
# Check they're in "New" or "Active" state
# Verify your email is correct in config
```

### Tests Fail to Run
```bash
# Check app URL is accessible
# Check login credentials work
# Review generated test code
cat tests/*.spec.ts
```

### Memory Issues
```bash
# View memory
qa-agent memory view

# Reset if corrupted
qa-agent memory reset
```

## 🚀 Next Steps

### Immediate
1. ✅ Run setup: `npm install && npm run build`
2. ✅ Configure: `qa-agent config`
3. ✅ Run: `qa-agent sync`

### Short Term
- Review generated scenarios: `./scenarios/`
- Edit `qa-agent.config.json` for your needs
- Add more application profiles
- Run `qa-agent sync` multiple times

### Long Term
- Run on CI/CD pipeline
- Integrate with test management tools
- Add custom page objects
- Extend with custom reporters

## 📞 Support

If you have issues:
1. Check [INSTALLATION.md](./INSTALLATION.md)
2. Review [APPLICATION_CONFIG.md](./APPLICATION_CONFIG.md)
3. Read [README.md](./README.md)
4. Run `qa-agent memory stats` for diagnostics

## 📦 What's Included

- ✅ Complete CLI application
- ✅ Azure DevOps integration
- ✅ Test case generator
- ✅ Playwright test creator
- ✅ Interactive user workflow
- ✅ Memory/learning system
- ✅ Configuration management
- ✅ Multi-app support
- ✅ Full documentation
- ✅ Example files
- ✅ Setup scripts

## 🎉 Ready to Start?

```bash
# 1. Install
npm install && npm run build

# 2. Configure
qa-agent config

# 3. Run
qa-agent sync

# 4. Watch the magic happen! ✨
```

---

**Welcome to automated QA testing!** 🚀

Questions? Check the documentation:
- 🚀 Quick Start: [GETTING_STARTED.md](./GETTING_STARTED.md)
- 📖 Full Guide: [README.md](./README.md)
- 🔧 Setup: [INSTALLATION.md](./INSTALLATION.md)
- 📱 Apps: [APPLICATION_CONFIG.md](./APPLICATION_CONFIG.md)

**Happy Testing!** 🎭

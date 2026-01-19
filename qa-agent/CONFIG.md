# QA Agent Configuration

This file stores your Azure DevOps and application settings.

## Fields

### Azure DevOps
- `organization`: Your Azure DevOps organization name
- `project`: Your project name in Azure DevOps
- `patToken`: Personal Access Token with work item read/write permissions
- `assignedTo`: Your email address in Azure DevOps

### Applications
Array of application profiles with:
- `name`: Unique identifier for the app
- `baseUrl`: Application URL
- `environment`: dev, staging, or prod
- `loginFlow`: Login configuration (forms, sso, api, custom)

### Playwright
- `headless`: Run tests in headless mode (true/false)
- `slowMo`: Delay between actions in ms
- `browserType`: chromium, firefox, or webkit

### Paths
- `scenarios`: Directory for scenario files
- `tests`: Directory for generated test files
- `screenshots`: Directory for test screenshots

## Example

See qa-agent.config.example.json for a complete example.

# Application Configuration Guide

This guide explains how to configure multiple applications with QA Agent, including different login flows and environment setups.

## Basic Application Config

Each application in your config needs:

```json
{
  "name": "app-name",           // Unique identifier
  "baseUrl": "https://...",     // Application URL
  "environment": "dev",          // dev, staging, or prod
  "description": "...",          // Optional description
  "loginFlow": {
    "type": "forms"              // forms, sso, api, or custom
  }
}
```

## Login Flow Types

### 1. Forms-Based Login

For applications with username/password forms:

```json
{
  "name": "pega-claims",
  "baseUrl": "https://pega-claims-dev.company.com",
  "environment": "dev",
  "loginFlow": {
    "type": "forms",
    "steps": [
      {
        "action": "fill",
        "selector": "#username",
        "value": "testuser"
      },
      {
        "action": "fill",
        "selector": "#password",
        "value": "testpass"
      },
      {
        "action": "click",
        "selector": "button[type='submit']"
      },
      {
        "action": "wait",
        "wait": 2000
      }
    ]
  },
  "credentials": {
    "usernameField": "username",
    "passwordField": "password",
    "loginButton": "button[type='submit']"
  }
}
```

### 2. SSO (Single Sign-On) Login

For applications using SSO (Azure AD, Okta, etc.):

```json
{
  "name": "admin-portal",
  "baseUrl": "https://admin-portal.company.com",
  "environment": "prod",
  "loginFlow": {
    "type": "sso",
    "steps": [
      {
        "action": "click",
        "selector": "a:text('Login with SSO')"
      },
      {
        "action": "wait_for_url",
        "value": "https://login.microsoftonline.com"
      },
      {
        "action": "fill",
        "selector": "#upn",
        "value": "testuser@company.com"
      },
      {
        "action": "click",
        "selector": "#idSIButton9"
      }
    ]
  }
}
```

### 3. API-Based Login

For applications requiring API authentication:

```json
{
  "name": "rest-api",
  "baseUrl": "https://api.company.com",
  "environment": "dev",
  "loginFlow": {
    "type": "api",
    "steps": [
      {
        "action": "post_token",
        "endpoint": "/api/auth/login",
        "payload": {
          "username": "testuser",
          "password": "testpass"
        },
        "store_as": "authToken"
      },
      {
        "action": "set_header",
        "header": "Authorization",
        "value": "Bearer {{authToken}}"
      }
    ]
  }
}
```

### 4. Custom Login

For complex or non-standard login flows:

```json
{
  "name": "custom-app",
  "baseUrl": "https://custom.company.com",
  "environment": "dev",
  "loginFlow": {
    "type": "custom",
    "customScript": "scripts/custom-login.js"
  }
}
```

**custom-login.js:**
```javascript
module.exports = async (page) => {
  // Your custom login logic
  await page.goto('https://custom.company.com/login');
  await page.fill('#username', process.env.TEST_USERNAME);
  await page.fill('#password', process.env.TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
};
```

## Multiple Environments

Configure the same app for different environments:

```json
{
  "applications": [
    {
      "name": "pega-claims-dev",
      "baseUrl": "https://pega-claims-dev.company.com",
      "environment": "dev",
      "loginFlow": { "type": "forms" }
    },
    {
      "name": "pega-claims-staging",
      "baseUrl": "https://pega-claims-staging.company.com",
      "environment": "staging",
      "loginFlow": { "type": "forms" }
    },
    {
      "name": "pega-claims-prod",
      "baseUrl": "https://pega-claims.company.com",
      "environment": "prod",
      "loginFlow": { "type": "sso" }
    }
  ]
}
```

Then run sync for specific environment:

```bash
qa-agent sync pega-claims-dev      # Dev environment
qa-agent sync pega-claims-staging  # Staging environment
qa-agent sync pega-claims-prod     # Production environment
```

## Page Objects Configuration

Link custom page objects for each app:

```json
{
  "name": "pega-app",
  "baseUrl": "https://pega.company.com",
  "environment": "dev",
  "pageObjects": "./tests/pages/pega.pages.ts",
  "loginFlow": { "type": "forms" }
}
```

**pega.pages.ts:**
```typescript
export class PegaPages {
  static elements = {
    createButton: 'button:text("Create")',
    formTitle: 'h1:text("New Item")',
    saveButton: 'button[type="submit"]',
  };
}
```

## Shared Configuration

Use defaults with overrides:

```json
{
  "applications": [
    {
      "name": "pega-app",
      "baseUrl": "https://pega-dev.company.com",
      "environment": "dev",
      "loginFlow": {
        "type": "forms",
        "steps": [
          {
            "action": "fill",
            "selector": "#username",
            "value": "$USERNAME"  // Use environment variable
          },
          {
            "action": "fill",
            "selector": "#password",
            "value": "$PASSWORD"
          },
          {
            "action": "click",
            "selector": ".login-btn"
          }
        ]
      }
    }
  ]
}
```

Then set environment variables:

```bash
export USERNAME=testuser
export PASSWORD=testpass
qa-agent sync pega-app
```

## Complex Application Example

Full configuration with all features:

```json
{
  "name": "enterprise-app",
  "baseUrl": "https://enterprise-dev.company.com",
  "description": "Enterprise application with SSO and role-based access",
  "environment": "dev",
  "loginFlow": {
    "type": "sso",
    "steps": [
      {
        "action": "click",
        "selector": "a:text('Sign In')"
      },
      {
        "action": "wait_for_url",
        "value": "microsoftonline.com"
      },
      {
        "action": "fill",
        "selector": "input[type='email']",
        "value": "$TEST_EMAIL"
      },
      {
        "action": "click",
        "selector": "button[type='submit']"
      },
      {
        "action": "wait_for_selector",
        "selector": ".dashboard"
      }
    ]
  },
  "pageObjects": "./tests/pages/enterprise.pages.ts",
  "credentials": {
    "usernameField": "email",
    "passwordField": "password",
    "loginButton": "button[type='submit']"
  },
  "customConfig": {
    "mfaEnabled": true,
    "mfaTimeout": 30000,
    "sessionTimeout": 900000,
    "supportedBrowsers": ["chromium", "firefox"]
  }
}
```

## Running Tests for Multiple Apps

### Test All Applications

```bash
qa-agent sync
```

### Test Specific Application

```bash
qa-agent sync pega-app
```

### Test Multiple Applications

Create a batch script:

```bash
#!/bin/bash
# run-all-tests.sh

qa-agent sync pega-app
qa-agent sync admin-portal
qa-agent sync rest-api

echo "✅ All test suites completed!"
```

Run with:
```bash
chmod +x run-all-tests.sh
./run-all-tests.sh
```

## Debugging Application Config

### View Current Config

```bash
qa-agent config
# Then choose option [4] View current configuration
```

### Test Connection to App

Add a test endpoint check:

```json
{
  "name": "pega-app",
  "baseUrl": "https://pega.company.com",
  "testEndpoint": "/api/health",  // Optional
  "environment": "dev"
}
```

### Verbose Logging

During sync, watch the console output:

```bash
qa-agent sync pega-app 2>&1 | tee qa-agent.log
```

## Best Practices

1. **Use meaningful names**: `pega-claims-dev` not `app1`
2. **Set correct environments**: dev, staging, prod
3. **Store credentials securely**: Use environment variables
4. **Test login flows**: Verify manually first
5. **Document custom flows**: Add comments explaining the flow
6. **Use relative paths**: For page objects `./tests/pages/`
7. **Version control**: Commit config (but not secrets)

## Environment Variables

Supported variables in config:

```json
{
  "baseUrl": "$APP_URL",
  "loginFlow": {
    "steps": [
      {
        "value": "$TEST_USERNAME"
      },
      {
        "value": "$TEST_PASSWORD"
      }
    ]
  }
}
```

Set before running:

```bash
export APP_URL=https://pega.company.com
export TEST_USERNAME=testuser
export TEST_PASSWORD=testpass
qa-agent sync pega-app
```

## Troubleshooting

### Login Fails

1. Check credentials are correct
2. Verify baseUrl is accessible
3. Check login flow steps match actual UI
4. Review browser console errors

### Selector Not Found

1. Verify selector is unique: `page.locator('selector').count()` should be 1
2. Use `page.pause()` to debug
3. Try alternative selector strategies:
   - Role: `getByRole('button', { name: 'Save' })`
   - Label: `getByLabel('Username')`
   - Text: `getByText('Submit')`
   - TestId: `getByTestId('login-btn')`

### Session Timeout

Increase timeout in Playwright config:

```json
{
  "playwright": {
    "timeout": 60000  // 60 seconds
  }
}
```

## Next Steps

1. Configure your applications
2. Test login flows manually
3. Run `qa-agent sync appname` to verify
4. Review generated test cases
5. Customize as needed

For more help, see [README.md](./README.md) or run `qa-agent --help`

/**
 * Configuration Interfaces
 */
export interface QAAgentConfig {
  // Azure DevOps
  azure: {
    organization: string;
    project: string;
    patToken: string;
    assignedTo: string;
  };

  // Playwright
  playwright: {
    headless: boolean;
    slowMo?: number;
    timeout?: number;
    browserType: 'chromium' | 'firefox' | 'webkit';
  };

  // Application Profiles
  applications: AppConfig[];

  // Default App
  defaultApp?: string;

  // Output Paths
  paths: {
    scenarios: string;
    tests: string;
    screenshots?: string;
  };

  // Test Generation
  testGeneration?: {
    stepNamingConvention: 'Given/When/Then' | 'Action/Verification' | 'Step-based';
    selectorStrategy: 'role' | 'testid' | 'xpath' | 'mixed';
    includeWaits: boolean;
    includeScreenshots: boolean;
  };
}

export interface AppConfig {
  name: string;
  baseUrl: string;
  description?: string;
  environment: 'dev' | 'staging' | 'prod';
  loginFlow?: LoginFlowConfig;
  pageObjects?: string;
  credentials?: {
    usernameField: string;
    passwordField: string;
    loginButton: string;
  };
}

export interface LoginFlowConfig {
  type: 'forms' | 'sso' | 'api' | 'custom';
  steps?: LoginStep[];
  customScript?: string;
}

export interface LoginStep {
  action: string;
  selector?: string;
  value?: string;
  wait?: number;
}

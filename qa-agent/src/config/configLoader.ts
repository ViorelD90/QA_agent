import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { QAAgentConfig, AppConfig } from '../types/Config';

export class ConfigLoader {
  private configPath: string;
  private config: QAAgentConfig | null = null;
  private envPath: string;

  constructor(projectRoot: string = process.cwd()) {
    this.configPath = path.join(projectRoot, 'qa-agent.config.json');
    this.envPath = path.join(projectRoot, '.env');
    this.loadEnv();
  }

  /**
   * Load environment variables from .env file
   */
  private loadEnv(): void {
    if (fs.existsSync(this.envPath)) {
      dotenv.config({ path: this.envPath });
    }
  }

  /**
   * Load configuration from config file or environment
   */
  public async load(): Promise<QAAgentConfig> {
    if (this.config) {
      return this.config;
    }

    try {
      // Try loading from config file first
      if (fs.existsSync(this.configPath)) {
        const fileContent = fs.readFileSync(this.configPath, 'utf-8');
        this.config = JSON.parse(fileContent);
      } else {
        // Fall back to environment variables
        this.config = this.loadFromEnv();
      }

      // Validate configuration
      if (this.config) {
        this.validate(this.config);
        return this.config;
      }
      throw new Error('Configuration failed to load');
    } catch (error) {
      throw new Error(`Failed to load configuration: ${error}`);
    }
  }

  /**
   * Load configuration from environment variables
   */
  private loadFromEnv(): QAAgentConfig {
    const org = process.env.AZURE_ORG;
    const project = process.env.AZURE_PROJECT;
    const pat = process.env.AZURE_PAT;
    const assignedTo = process.env.AZURE_ASSIGNED_TO;

    if (!org || !project || !pat || !assignedTo) {
      throw new Error(
        'Missing required environment variables: AZURE_ORG, AZURE_PROJECT, AZURE_PAT, AZURE_ASSIGNED_TO'
      );
    }

    return {
      azure: {
        organization: org,
        project: project,
        patToken: pat,
        assignedTo: assignedTo,
      },
      playwright: {
        headless: process.env.PLAYWRIGHT_HEADLESS !== 'false',
        slowMo: process.env.PLAYWRIGHT_SLOW_MO ? parseInt(process.env.PLAYWRIGHT_SLOW_MO) : undefined,
        timeout: process.env.PLAYWRIGHT_TIMEOUT ? parseInt(process.env.PLAYWRIGHT_TIMEOUT) : 30000,
        browserType: (process.env.PLAYWRIGHT_BROWSER || 'chromium') as any,
      },
      applications: this.loadAppsFromEnv(),
      defaultApp: process.env.DEFAULT_APP,
      paths: {
        scenarios: './scenarios',
        tests: './tests',
        screenshots: './screenshots',
      },
      testGeneration: {
        stepNamingConvention: (process.env.STEP_NAMING || 'Given/When/Then') as any,
        selectorStrategy: (process.env.SELECTOR_STRATEGY || 'role') as any,
        includeWaits: process.env.INCLUDE_WAITS !== 'false',
        includeScreenshots: process.env.INCLUDE_SCREENSHOTS === 'true',
      },
    };
  }

  /**
   * Load app configs from environment (JSON format expected)
   */
  private loadAppsFromEnv(): AppConfig[] {
    const appsJson = process.env.APPLICATIONS;
    if (!appsJson) {
      return [];
    }

    try {
      return JSON.parse(appsJson);
    } catch (error) {
      console.warn('Could not parse APPLICATIONS env var as JSON');
      return [];
    }
  }

  /**
   * Validate configuration
   */
  private validate(config: QAAgentConfig): void {
    if (!config.azure.organization) {
      throw new Error('Azure organization is required');
    }
    if (!config.azure.project) {
      throw new Error('Azure project is required');
    }
    if (!config.azure.patToken) {
      throw new Error('Azure PAT token is required');
    }
    if (!config.azure.assignedTo) {
      throw new Error('Assigned to email is required');
    }
  }

  /**
   * Save configuration to file
   */
  public async save(config: QAAgentConfig): Promise<void> {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2), 'utf-8');
      this.config = config;
    } catch (error) {
      throw new Error(`Failed to save configuration: ${error}`);
    }
  }

  /**
   * Get current configuration
   */
  public getConfig(): QAAgentConfig {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call load() first.');
    }
    return this.config;
  }

  /**
   * Get specific application profile
   */
  public getAppProfile(appName: string): AppConfig | undefined {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }
    return this.config.applications.find((app) => app.name === appName);
  }

  /**
   * Add or update application profile
   */
  public addAppProfile(app: AppConfig): void {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }

    const index = this.config.applications.findIndex((a) => a.name === app.name);
    if (index >= 0) {
      this.config.applications[index] = app;
    } else {
      this.config.applications.push(app);
    }
  }
}

export const configLoader = new ConfigLoader();

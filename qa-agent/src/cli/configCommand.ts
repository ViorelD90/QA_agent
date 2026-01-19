import * as readline from 'readline';
import { ConfigLoader } from '../config/configLoader';
import { QAAgentConfig, AppConfig, LoginFlowConfig } from '../types/Config';

export class ConfigCommand {
  private configLoader: ConfigLoader;
  private rl: readline.Interface;

  constructor() {
    this.configLoader = new ConfigLoader();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Execute config command
   */
  public async execute(): Promise<void> {
    try {
      console.log('⚙️  QA Agent Configuration\n');

      let config: QAAgentConfig;

      try {
        config = await this.configLoader.load();
        console.log('✅ Existing configuration found.\n');
      } catch (error) {
        console.log('📝 No existing configuration found. Creating new...\n');
        config = await this.createNewConfig();
      }

      // Menu
      let loop = true;
      while (loop) {
        console.log('\nConfiguration Menu:');
        console.log('  [1] Update Azure DevOps credentials');
        console.log('  [2] Add/Edit application profile');
        console.log('  [3] Configure Playwright settings');
        console.log('  [4] View current configuration');
        console.log('  [5] Save and exit');
        console.log('  [6] Exit without saving\n');

        const choice = await this.askQuestion('Choose option (1-6): ');

        switch (choice) {
          case '1':
            config.azure = await this.configureAzure(config.azure);
            break;
          case '2':
            config.applications = await this.configureApplications(config.applications);
            break;
          case '3':
            config.playwright = await this.configurePlaywright(config.playwright);
            break;
          case '4':
            this.displayConfig(config);
            break;
          case '5':
            await this.configLoader.save(config);
            console.log('✅ Configuration saved to qa-agent.config.json');
            loop = false;
            break;
          case '6':
            console.log('Exiting without saving...');
            loop = false;
            break;
          default:
            console.log('Invalid option. Please try again.');
        }
      }
    } finally {
      this.rl.close();
    }
  }

  /**
   * Create new configuration
   */
  private async createNewConfig(): Promise<QAAgentConfig> {
    const azure = await this.configureAzure({
      organization: '',
      project: '',
      patToken: '',
      assignedTo: '',
    });

    const applications = await this.configureApplications([]);
    const playwright = await this.configurePlaywright({
      headless: false,
      slowMo: 500,
      browserType: 'chromium',
    });

    return {
      azure,
      applications,
      playwright,
      paths: {
        scenarios: './scenarios',
        tests: './tests',
      },
    };
  }

  /**
   * Configure Azure DevOps
   */
  private async configureAzure(existing: any): Promise<any> {
    console.log('\n📋 Azure DevOps Configuration');

    const organization = await this.askQuestion(
      `Organization name [${existing.organization}]: `
    );
    const project = await this.askQuestion(`Project name [${existing.project}]: `);
    const patToken = await this.askQuestion(`PAT token [${existing.patToken ? '***' : ''}]: `, true);
    const assignedTo = await this.askQuestion(
      `Assigned to email [${existing.assignedTo}]: `
    );

    return {
      organization: organization || existing.organization,
      project: project || existing.project,
      patToken: patToken || existing.patToken,
      assignedTo: assignedTo || existing.assignedTo,
    };
  }

  /**
   * Configure applications
   */
  private async configureApplications(existing: AppConfig[]): Promise<AppConfig[]> {
    console.log('\n🌐 Application Profiles');
    console.log(`Currently configured: ${existing.length} app(s)\n`);

    existing.forEach((app, idx) => {
      console.log(`  ${idx + 1}. ${app.name} - ${app.baseUrl}`);
    });

    const addAnother = await this.askQuestion(
      '\nAdd/Edit application? (y/n): '
    );
    if (addAnother.toLowerCase() !== 'y') {
      return existing;
    }

    const name = await this.askQuestion('Application name: ');
    const baseUrl = await this.askQuestion('Base URL: ');
    const environment = await this.askQuestion('Environment (dev/staging/prod) [dev]: ') || 'dev';
    const loginType = await this.askQuestion(
      'Login flow type (forms/sso/api/custom) [forms]: '
    ) || 'forms';

    const newApp: AppConfig = {
      name,
      baseUrl,
      environment: environment as any,
      description: await this.askQuestion('Description (optional): ') || undefined,
      loginFlow: {
        type: loginType as any,
      },
    };

    existing.push(newApp);
    return existing;
  }

  /**
   * Configure Playwright
   */
  private async configurePlaywright(existing: any): Promise<any> {
    console.log('\n🎭 Playwright Configuration');

    const headless = await this.askQuestion(
      `Run in headless mode? (y/n) [${existing.headless ? 'y' : 'n'}]: `
    );
    const slowMo = await this.askQuestion(
      `Slow motion delay (ms) [${existing.slowMo || 0}]: `
    );
    const browserType = await this.askQuestion(
      `Browser (chromium/firefox/webkit) [${existing.browserType || 'chromium'}]: `
    );

    return {
      headless: headless === 'n' ? false : true,
      slowMo: slowMo ? parseInt(slowMo) : existing.slowMo,
      browserType: browserType || existing.browserType || 'chromium',
      timeout: 30000,
    };
  }

  /**
   * Display configuration
   */
  private displayConfig(config: QAAgentConfig): void {
    console.log('\n📋 Current Configuration:\n');
    console.log(JSON.stringify(config, null, 2));
  }

  /**
   * Ask question helper
   */
  private askQuestion(prompt: string, hidden: boolean = false): Promise<string> {
    return new Promise((resolve) => {
      if (hidden) {
        this.rl.question(prompt, (answer) => {
          resolve(answer.trim());
        });
      } else {
        this.rl.question(prompt, (answer) => {
          resolve(answer.trim());
        });
      }
    });
  }

  /**
   * Close readline
   */
  public close(): void {
    this.rl.close();
  }
}

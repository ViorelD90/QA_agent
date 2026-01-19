#!/usr/bin/env node

import { SyncCommand } from './syncCommand';
import { ConfigCommand } from './configCommand';
import { MemoryCommand } from './memoryCommand';

/**
 * Main CLI entry point
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];
  const action = args[1];

  try {
    switch (command) {
      case 'sync':
        const syncCmd = new SyncCommand();
        await syncCmd.execute({ appName: args[1] });
        break;

      case 'config':
        const configCmd = new ConfigCommand();
        await configCmd.execute();
        break;

      case 'memory':
        const memoryCmd = new MemoryCommand();
        await memoryCmd.execute(action || 'stats');
        break;

      case '--help':
      case '-h':
      case 'help':
        showHelp();
        break;

      case '--version':
      case '-v':
        console.log('QA Agent v1.0.0');
        break;

      default:
        if (!command) {
          showHelp();
        } else {
          console.error(`Unknown command: ${command}`);
          console.error('Use "qa-agent help" for more information.');
          process.exit(1);
        }
    }
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

/**
 * Show help information
 */
function showHelp(): void {
  console.log(`
QA Agent - Playwright QA Automation CLI Tool

Usage:
  qa-agent <command> [options]

Commands:
  sync [appName]          Sync Azure DevOps tasks and generate tests
                          Optional: specify app name to filter tasks
  
  config                  Configure Azure DevOps and test settings
  
  memory <action>         Manage memory system
    - stats              Show memory statistics
    - reset              Reset all stored data
    - view               View full memory contents

  help                    Show this help message
  --help, -h             Show this help message
  --version, -v          Show version

Examples:
  $ qa-agent sync
  $ qa-agent sync pega-app
  $ qa-agent config
  $ qa-agent memory stats
  $ qa-agent memory reset

For more information, visit: https://github.com/yourusername/qa-agent
  `);
}

// Run main
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

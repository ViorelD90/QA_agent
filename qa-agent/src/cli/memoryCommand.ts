import { MemoryManager } from '../memory/memoryManager';

export class MemoryCommand {
  private memoryManager: MemoryManager;

  constructor() {
    this.memoryManager = new MemoryManager();
  }

  /**
   * Execute memory command
   */
  public async execute(action: string): Promise<void> {
    try {
      console.log('💾 QA Agent Memory\n');

      switch (action) {
        case 'reset':
          await this.reset();
          break;
        case 'stats':
          await this.stats();
          break;
        case 'view':
          await this.view();
          break;
        default:
          console.log('Unknown action. Supported: reset, stats, view');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      throw error;
    }
  }

  /**
   * Reset memory
   */
  private async reset(): Promise<void> {
    console.log('⚠️  This will erase all stored preferences and history.\n');

    const confirm = await this.askQuestion('Are you sure? (y/n): ');
    if (confirm.toLowerCase() === 'y') {
      await this.memoryManager.resetMemory();
      console.log('✅ Memory reset successfully!');
    } else {
      console.log('Cancelled.');
    }
  }

  /**
   * Show memory stats
   */
  private async stats(): Promise<void> {
    const stats = await this.memoryManager.getStats();
    console.log('📊 Memory Statistics:\n');
    console.log(JSON.stringify(stats, null, 2));
  }

  /**
   * View memory contents
   */
  private async view(): Promise<void> {
    const memory = await this.memoryManager.loadMemory();
    console.log('📋 Memory Contents:\n');
    console.log(JSON.stringify(memory, null, 2));
  }

  /**
   * Ask question helper
   */
  private askQuestion(prompt: string): Promise<string> {
    return new Promise((resolve) => {
      process.stdout.write(prompt);
      process.stdin.once('data', (data) => {
        resolve(data.toString().trim());
      });
    });
  }
}

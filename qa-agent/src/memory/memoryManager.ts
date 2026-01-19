import fs from 'fs';
import path from 'path';
import {
  MemoryFile,
  ProcessedTask,
  UserPreferences,
  AppMemoryProfile,
  UserCorrection,
} from '../types/Memory';

export class MemoryManager {
  private memoryPath: string;
  private memory: MemoryFile | null = null;
  private readonly DEFAULT_PREFERENCES: UserPreferences = {
    preferredBrowser: 'chromium',
    preferredTestNamingConvention: 'Given/When/Then',
    preferredSelectorStyle: 'role',
    preferredAssertionStyle: 'expect',
    includeWaits: true,
    includeScreenshots: false,
  };

  constructor(projectRoot: string = process.cwd()) {
    this.memoryPath = path.join(projectRoot, 'qa-agent.memory.json');
  }

  /**
   * Load memory from disk
   */
  public async loadMemory(): Promise<MemoryFile> {
    if (this.memory) {
      return this.memory;
    }

    try {
      if (fs.existsSync(this.memoryPath)) {
        const content = fs.readFileSync(this.memoryPath, 'utf-8');
        this.memory = JSON.parse(content);
      } else {
        this.memory = this.createEmptyMemory();
      }
      return this.memory || this.createEmptyMemory();
    } catch (error) {
      console.warn('Could not load memory, creating new:', error);
      this.memory = this.createEmptyMemory();
      return this.memory;
    }
  }

  /**
   * Create empty memory structure
   */
  private createEmptyMemory(): MemoryFile {
    return {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      processedTasks: [],
      userPreferences: this.DEFAULT_PREFERENCES,
      applicationProfiles: {},
      userCorrections: [],
    };
  }

  /**
   * Save memory to disk
   */
  public async saveMemory(): Promise<void> {
    if (!this.memory) {
      throw new Error('Memory not loaded');
    }

    try {
      this.memory.lastUpdated = new Date().toISOString();
      fs.writeFileSync(this.memoryPath, JSON.stringify(this.memory, null, 2), 'utf-8');
    } catch (error) {
      throw new Error(`Failed to save memory: ${error}`);
    }
  }

  /**
   * Update specific memory value
   */
  public async updateMemory(key: string, value: any): Promise<void> {
    if (!this.memory) {
      await this.loadMemory();
    }

    const keys = key.split('.');
    let obj: any = this.memory;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) {
        obj[keys[i]] = {};
      }
      obj = obj[keys[i]];
    }

    obj[keys[keys.length - 1]] = value;
    await this.saveMemory();
  }

  /**
   * Get preference by key
   */
  public async getPreference(key: keyof UserPreferences): Promise<any> {
    if (!this.memory) {
      await this.loadMemory();
    }

    return this.memory!.userPreferences[key] ?? this.DEFAULT_PREFERENCES[key];
  }

  /**
   * Set user preference
   */
  public async setPreference(key: keyof UserPreferences, value: any): Promise<void> {
    if (!this.memory) {
      await this.loadMemory();
    }

    if (this.memory) {
      (this.memory.userPreferences as any)[key] = value;
    }
    await this.saveMemory();
  }

  /**
   * Get all preferences
   */
  public async getAllPreferences(): Promise<UserPreferences> {
    if (!this.memory) {
      await this.loadMemory();
    }

    return this.memory!.userPreferences;
  }

  /**
   * Get application profile
   */
  public async getAppProfile(appName: string): Promise<AppMemoryProfile | undefined> {
    if (!this.memory) {
      await this.loadMemory();
    }

    return this.memory!.applicationProfiles[appName];
  }

  /**
   * Set application profile
   */
  public async setAppProfile(appName: string, profile: AppMemoryProfile): Promise<void> {
    if (!this.memory) {
      await this.loadMemory();
    }

    profile.lastUsed = new Date().toISOString();
    this.memory!.applicationProfiles[appName] = profile;
    await this.saveMemory();
  }

  /**
   * Record processed task
   */
  public async recordProcessedTask(task: ProcessedTask): Promise<void> {
    if (!this.memory) {
      await this.loadMemory();
    }

    const existing = this.memory!.processedTasks.findIndex((t) => t.taskId === task.taskId);
    if (existing >= 0) {
      this.memory!.processedTasks[existing] = task;
    } else {
      this.memory!.processedTasks.push(task);
    }

    this.memory!.lastSyncedTaskId = task.taskId;
    await this.saveMemory();
  }

  /**
   * Get processed task
   */
  public async getProcessedTask(taskId: number): Promise<ProcessedTask | undefined> {
    if (!this.memory) {
      await this.loadMemory();
    }

    return this.memory!.processedTasks.find((t) => t.taskId === taskId);
  }

  /**
   * Add user correction pattern
   */
  public async addUserCorrection(
    pattern: string,
    correction: string,
    example: string
  ): Promise<void> {
    if (!this.memory) {
      await this.loadMemory();
    }

    const existing = this.memory!.userCorrections.find((c) => c.pattern === pattern);
    if (existing) {
      existing.frequency++;
      if (!existing.examples.includes(example)) {
        existing.examples.push(example);
      }
      existing.lastUsed = new Date().toISOString();
    } else {
      this.memory!.userCorrections.push({
        pattern,
        correction,
        frequency: 1,
        examples: [example],
        lastUsed: new Date().toISOString(),
      });
    }

    await this.saveMemory();
  }

  /**
   * Get user corrections by frequency
   */
  public async getUserCorrections(): Promise<UserCorrection[]> {
    if (!this.memory) {
      await this.loadMemory();
    }

    return this.memory!.userCorrections.sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Get last synced task ID
   */
  public async getLastSyncedTaskId(): Promise<number | undefined> {
    if (!this.memory) {
      await this.loadMemory();
    }

    return this.memory!.lastSyncedTaskId;
  }

  /**
   * Reset memory
   */
  public async resetMemory(): Promise<void> {
    this.memory = this.createEmptyMemory();
    await this.saveMemory();
  }

  /**
   * Get memory stats for debugging
   */
  public async getStats(): Promise<Record<string, any>> {
    if (!this.memory) {
      await this.loadMemory();
    }

    return {
      version: this.memory!.version,
      createdAt: this.memory!.createdAt,
      lastUpdated: this.memory!.lastUpdated,
      processedTasksCount: this.memory!.processedTasks.length,
      applicationProfilesCount: Object.keys(this.memory!.applicationProfiles).length,
      userCorrectionsCount: this.memory!.userCorrections.length,
      lastSyncedTaskId: this.memory!.lastSyncedTaskId,
    };
  }
}

export const memoryManager = new MemoryManager();

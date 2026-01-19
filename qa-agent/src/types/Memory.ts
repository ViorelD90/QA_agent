/**
 * Memory System Interfaces
 */
export interface MemoryFile {
  version: string;
  createdAt: string;
  lastUpdated: string;
  lastSyncedTaskId?: number;
  processedTasks: ProcessedTask[];
  userPreferences: UserPreferences;
  applicationProfiles: Record<string, AppMemoryProfile>;
  userCorrections: UserCorrection[];
}

export interface ProcessedTask {
  taskId: number;
  taskTitle: string;
  processedAt: string;
  testCasesGenerated: number;
  userApproved: boolean;
  lastModified: string;
}

export interface UserPreferences {
  preferredBrowser: 'chromium' | 'firefox' | 'webkit';
  preferredTestNamingConvention: 'Given/When/Then' | 'Action/Verification' | 'Step-based';
  preferredSelectorStyle: 'role' | 'testid' | 'xpath' | 'mixed';
  preferredAssertionStyle: 'expect' | 'assert';
  includeWaits: boolean;
  includeScreenshots: boolean;
  slowMoValue?: number;
}

export interface AppMemoryProfile {
  name: string;
  baseUrl: string;
  loginMethod: 'forms' | 'sso' | 'api' | 'custom';
  customLoginFlow?: string;
  commonSteps?: string[];
  frequentlyEditedSteps?: string[];
  environment: 'dev' | 'staging' | 'prod';
  lastUsed: string;
}

export interface UserCorrection {
  pattern: string;
  correction: string;
  frequency: number;
  examples: string[];
  lastUsed: string;
}

export interface MemoryUpdate {
  key: string;
  value: any;
  timestamp: string;
}

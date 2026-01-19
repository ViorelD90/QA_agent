/**
 * Scenario File - Summarizes Complete Automation Flow
 */
import { TestCase, UserEdit } from './TestCase';

export interface Scenario {
  scenarioId: string;
  taskId: number;
  taskTitle: string;
  taskDescription: string;
  createdAt: string;
  updatedAt: string;
  testCases: TestCase[];
  automationApproach: string;
  userEdits: UserEdit[];
  executionResults?: ExecutionResult;
  testedUrls?: string[];
  applicationProfile?: AppProfile;
  notes?: string;
}

export interface ExecutionResult {
  status: 'Passed' | 'Failed' | 'Skipped';
  totalSteps: number;
  passedSteps: number;
  failedSteps: number;
  skippedSteps: number;
  executionTime: number; // in milliseconds
  timestamp: string;
  errors?: ExecutionError[];
}

export interface ExecutionError {
  stepId: number;
  error: string;
  screenshot?: string;
  timestamp: string;
}

export interface AppProfile {
  name: string;
  baseUrl: string;
  loginMethod: 'forms' | 'sso' | 'api' | 'custom';
  environment: 'dev' | 'staging' | 'prod';
  username?: string;
  pageObjectPath?: string;
  customConfig?: Record<string, any>;
}

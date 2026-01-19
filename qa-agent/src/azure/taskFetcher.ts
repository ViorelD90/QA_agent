import { ADOClient } from './adoClient';
import { Task, TaskFetchOptions } from '../types/Task';

export class TaskFetcher {
  private client: ADOClient;

  constructor(options: TaskFetchOptions) {
    this.client = new ADOClient(options);
  }

  /**
   * Fetch tasks assigned to user
   */
  public async fetch(options: {
    states?: string[];
    maxResults?: number;
    assignedTo: string;
  }): Promise<Task[]> {
    const states = options.states || ['New', 'Active'];
    const maxResults = options.maxResults || 50;

    return this.client.fetchTasks(options.assignedTo, states, maxResults);
  }

  /**
   * Test connection
   */
  public async testConnection(): Promise<boolean> {
    return this.client.testConnection();
  }

  /**
   * Update work item
   */
  public async updateWorkItem(workItemId: number, updates: Record<string, any>): Promise<void> {
    return this.client.updateWorkItem(workItemId, updates);
  }

  /**
   * Add comment
   */
  public async addComment(workItemId: number, comment: string): Promise<void> {
    return this.client.addComment(workItemId, comment);
  }
}

import axios, { AxiosInstance } from 'axios';
import { Task, TaskFetchOptions } from '../types/Task';

export class ADOClient {
  private client: AxiosInstance;
  private organization: string;
  private project: string;

  constructor(options: TaskFetchOptions) {
    this.organization = options.organization;
    this.project = options.project;

    const auth = Buffer.from(`:${options.patToken}`).toString('base64');

    this.client = axios.create({
      baseURL: `https://dev.azure.com/${options.organization}/${options.project}/_apis`,
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      params: {
        'api-version': '7.0',
      },
    });
  }

  /**
   * Fetch work items (tasks) assigned to user
   */
  public async fetchTasks(
    assignedTo: string,
    states: string[] = ['New', 'Active'],
    maxResults: number = 50
  ): Promise<Task[]> {
    try {
      // Use the assignedTo parameter directly instead of @me
      const wiql = `
        SELECT [System.Id], [System.Title], [System.Description], [System.State],
               [System.AssignedTo], [System.IterationPath], [System.AreaPath]
        FROM workitems
        WHERE [System.AssignedTo] = '${assignedTo}'
        AND [System.State] IN (${states.map((s) => `'${s}'`).join(',')})
        AND [System.TeamProject] = @project
        ORDER BY [System.CreatedDate] DESC
      `;

      const response = await this.client.post('/wit/wiql', { query: wiql });
      const workItems = response.data.workItems || [];

      // Fetch details for each work item
      const tasks: Task[] = [];

      for (const wi of workItems.slice(0, maxResults)) {
        try {
          const task = await this.getWorkItemDetails(wi.id);
          tasks.push(task);
        } catch (error) {
          console.warn(`Failed to fetch details for work item ${wi.id}:`, error);
        }
      }

      return tasks;
    } catch (error) {
      throw new Error(`Failed to fetch tasks from Azure DevOps: ${error}`);
    }
  }

  /**
   * Get work item details
   */
  private async getWorkItemDetails(workItemId: number): Promise<Task> {
    try {
      const response = await this.client.get(`/wit/workitems/${workItemId}`, {
        params: { $expand: 'all' },
      });

      const fields = response.data.fields || {};
      const url = response.data._links?.html?.href || '';

      return {
        id: workItemId,
        workItemId: workItemId,
        title: fields['System.Title'] || 'Untitled',
        description: fields['System.Description'] || '',
        assignedTo: fields['System.AssignedTo'] || '',
        state: fields['System.State'] || 'New',
        acceptanceCriteria: fields['Custom.AcceptanceCriteria'] || fields['Microsoft.VSTS.Common.AcceptanceCriteria'] || '',
        url: url,
        iterationPath: fields['System.IterationPath'] || '',
        areaPath: fields['System.AreaPath'] || '',
        fields: fields,
      };
    } catch (error) {
      throw new Error(`Failed to get work item details for ${workItemId}: ${error}`);
    }
  }

  /**
   * Update work item
   */
  public async updateWorkItem(
    workItemId: number,
    updates: Record<string, any>
  ): Promise<void> {
    try {
      const operations = Object.entries(updates).map(([key, value]) => ({
        op: 'add',
        path: `/fields/${key}`,
        value: value,
      }));

      await this.client.patch(`/wit/workitems/${workItemId}`, operations, {
        headers: {
          'Content-Type': 'application/json-patch+json',
        },
      });
    } catch (error) {
      throw new Error(`Failed to update work item ${workItemId}: ${error}`);
    }
  }

  /**
   * Add comment to work item
   */
  public async addComment(workItemId: number, comment: string): Promise<void> {
    try {
      await this.client.post(`/wit/workitems/${workItemId}/comments`, {
        text: comment,
      });
    } catch (error) {
      throw new Error(`Failed to add comment to work item ${workItemId}: ${error}`);
    }
  }

  /**
   * Test connection to Azure DevOps
   */
  public async testConnection(): Promise<boolean> {
    try {
      // Try to fetch a simple work items query to verify connection
      await this.client.post('/wit/wiql', {
        query: `SELECT [System.Id] FROM workitems ORDER BY [System.CreatedDate] DESC`,
      });
      return true;
    } catch (error) {
      console.error('Failed to connect to Azure DevOps:', error);
      return false;
    }
  }
}

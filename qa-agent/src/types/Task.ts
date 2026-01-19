/**
 * Azure DevOps Task/Work Item Interface
 */
export interface Task {
  id: number;
  workItemId: number;
  title: string;
  description: string;
  assignedTo?: string;
  state: 'New' | 'Active' | 'Resolved' | 'Closed';
  acceptanceCriteria: string;
  url: string;
  iterationPath?: string;
  areaPath?: string;
  fields?: Record<string, any>;
}

export interface TaskFetchOptions {
  organization: string;
  project: string;
  patToken: string;
  assignedTo: string;
  states?: string[];
  maxResults?: number;
}

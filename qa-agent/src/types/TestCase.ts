/**
 * Test Case Interface - Generated from Acceptance Criteria
 */
export interface TestStep {
  stepNumber: number;
  action: string;
  expectedResult: string;
  selector?: string;
  value?: string;
  timestamp?: string;
}

export interface TestCase {
  id: string;
  taskId: number;
  title: string;
  description: string;
  preconditions?: string[];
  steps: TestStep[];
  expectedOutcome: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  tags?: string[];
  generatedAt: string;
  userEdits?: UserEdit[];
  status?: 'Draft' | 'Reviewed' | 'Approved' | 'Implemented';
}

export interface UserEdit {
  stepId?: number;
  originalText: string;
  editedText: string;
  reason?: string;
  timestamp: string;
}

export interface ClarifyingQuestion {
  question: string;
  context: string;
  suggestedAnswer?: string;
  priority: 'High' | 'Medium' | 'Low';
}

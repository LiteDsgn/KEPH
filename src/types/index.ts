export type TaskStatus = 'current' | 'completed' | 'pending';

export interface Task {
  id: string;
  content: string;
  status: TaskStatus;
  createdAt: Date;
  notes?: string;
  url?: string;
}

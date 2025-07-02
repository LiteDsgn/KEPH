export type TaskStatus = 'current' | 'completed' | 'pending';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: Date;
  notes?: string;
  url?: string;
}

export type TaskStatus = 'current' | 'completed' | 'pending';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurrenceConfig {
  type: RecurrenceType;
  interval: number; // e.g., every 2 weeks = interval: 2, type: 'weekly'
  endDate?: Date;
  maxOccurrences?: number;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Url {
  id: string;
  value: string;
}

export interface Task {
  id: string;
  title: string;
  subtasks?: Subtask[];
  status: TaskStatus;
  createdAt: Date;
  notes?: string;
  urls?: Url[];
  dueDate?: Date;
  completedAt?: Date;
  recurrence?: RecurrenceConfig;
  parentRecurringTaskId?: string; // Links to the original recurring task
  isRecurringInstance?: boolean;
  category?: string;
}

export type NotificationType = 'overdue-tasks';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: Date;
  read: boolean;
  data: any;
}

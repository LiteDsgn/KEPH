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

export type ToneProfile = 'professional' | 'casual' | 'motivational' | 'analytical' | 'reflective';

export interface Report {
  id: string;
  title: string;
  tone_profile: ToneProfile;
  date_range_start: string;
  date_range_end: string;
  filters: any;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  totalSubtasks?: number; // New field for total subtasks
  totalUrls?: number; // New field for total URLs
  completedTasks?: number; // New field for completed tasks count
  completionRate?: number; // New field for completion rate percentage
}



export interface ReportGenerationRequest {
  startDate: Date;
  endDate: Date;
  toneProfile?: ToneProfile;
  customTitle?: string;
}

// Component interfaces for homepage
export interface FeatureCardProps {
  icon?: React.ElementType;
  title: string;
  description: string;
  image?: string;
}

export interface PricingCardProps {
  plan: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  cta: string;
}

export interface FAQItemProps {
  question: string;
  answer: string;
}

export interface Testimonial {
  id: number;
  text: string;
  author: string;
  role: string;
}

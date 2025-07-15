import { supabase } from '@/lib/supabase';
import {
  isToday,
  isOverdue,
  getCurrentDateInTimezone,
  getStartOfDayInTimezone,
  getEndOfDayInTimezone,
} from '@/lib/timezone';

export interface TimezoneAwareTask {
  id: string;
  title: string;
  notes: string | null;
  due_date: string | null;
  status: 'current' | 'completed' | 'pending';
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  user_id: string;
  category_id: string | null;
  recurrence_type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  recurrence_interval: number | null;
  recurrence_end_date: string | null;
  recurrence_max_occurrences: number | null;
  parent_recurring_task_id: string | null;
  is_recurring_instance: boolean;
}

export class TimezoneTaskService {
  private userId: string;
  private timezone: string;

  constructor(userId: string, timezone: string) {
    this.userId = userId;
    this.timezone = timezone;
  }

  /**
   * Get tasks due today in the user's timezone
   */
  async getTasksDueToday(): Promise<TimezoneAwareTask[]> {
    try {
      // Use the database function for server-side timezone handling
      const { data, error } = await supabase.rpc('get_tasks_due_today', {
        user_uuid: this.userId
      });

      if (error) {
        console.error('Error fetching tasks due today:', error);
        // Fallback to client-side filtering
        return this.getTasksDueTodayFallback();
      }

      return data || [];
    } catch (error) {
      console.error('Error in getTasksDueToday:', error);
      return this.getTasksDueTodayFallback();
    }
  }

  /**
   * Fallback method for getting tasks due today using client-side timezone logic
   */
  private async getTasksDueTodayFallback(): Promise<TimezoneAwareTask[]> {
    const startOfDay = getStartOfDayInTimezone(new Date(), this.timezone);
    const endOfDay = getEndOfDayInTimezone(new Date(), this.timezone);

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', this.userId)
      .gte('due_date', startOfDay.toISOString())
      .lte('due_date', endOfDay.toISOString())
      .neq('status', 'completed')
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error in fallback getTasksDueToday:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get overdue tasks in the user's timezone
   */
  async getOverdueTasks(): Promise<TimezoneAwareTask[]> {
    try {
      // Use the database function for server-side timezone handling
      const { data, error } = await supabase.rpc('get_overdue_tasks', {
        user_uuid: this.userId
      });

      if (error) {
        console.error('Error fetching overdue tasks:', error);
        // Fallback to client-side filtering
        return this.getOverdueTasksFallback();
      }

      return data || [];
    } catch (error) {
      console.error('Error in getOverdueTasks:', error);
      return this.getOverdueTasksFallback();
    }
  }

  /**
   * Fallback method for getting overdue tasks using client-side timezone logic
   */
  private async getOverdueTasksFallback(): Promise<TimezoneAwareTask[]> {
    const startOfToday = getStartOfDayInTimezone(new Date(), this.timezone);

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', this.userId)
      .lt('due_date', startOfToday.toISOString())
      .neq('status', 'completed')
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error in fallback getOverdueTasks:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Check if a task is due today in the user's timezone
   */
  isTaskDueToday(task: TimezoneAwareTask): boolean {
    if (!task.due_date) return false;
    const dueDate = new Date(task.due_date);
    return isToday(dueDate, this.timezone);
  }

  /**
   * Check if a task is overdue in the user's timezone
   */
  isTaskOverdue(task: TimezoneAwareTask): boolean {
    if (!task.due_date) return false;
    const dueDate = new Date(task.due_date);
    return isOverdue(dueDate, this.timezone);
  }

  /**
   * Get tasks grouped by their status relative to user's timezone
   */
  async getTasksGroupedByTimeStatus(): Promise<{
    today: TimezoneAwareTask[];
    overdue: TimezoneAwareTask[];
    upcoming: TimezoneAwareTask[];
  }> {
    const { data: allTasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', this.userId)
      .neq('status', 'completed')
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
      return { today: [], overdue: [], upcoming: [] };
    }

    const today: TimezoneAwareTask[] = [];
    const overdue: TimezoneAwareTask[] = [];
    const upcoming: TimezoneAwareTask[] = [];

    const now = getCurrentDateInTimezone(this.timezone);
    const startOfToday = getStartOfDayInTimezone(now, this.timezone);
    const endOfToday = getEndOfDayInTimezone(now, this.timezone);

    allTasks?.forEach(task => {
      if (!task.due_date) {
        upcoming.push(task as TimezoneAwareTask);
        return;
      }
      
      const dueDate = new Date(task.due_date);
      
      if (dueDate < startOfToday) {
        overdue.push(task as TimezoneAwareTask);
      } else if (dueDate >= startOfToday && dueDate <= endOfToday) {
        today.push(task as TimezoneAwareTask);
      } else {
        upcoming.push(task as TimezoneAwareTask);
      }
    });

    return { today, overdue, upcoming };
  }

  /**
   * Create a new task with timezone-aware due date
   */
  async createTask(taskData: {
    title: string;
    notes?: string;
    due_date: Date;
    category_id?: string;
  }): Promise<TimezoneAwareTask | null> {
    // Convert the due date to UTC for storage
    const utcDueDate = new Date(taskData.due_date.toLocaleString('en-US', { timeZone: 'UTC' }));

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: taskData.title,
        notes: taskData.notes || null,
        due_date: utcDueDate.toISOString(),
        category_id: taskData.category_id || null,
        user_id: this.userId,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return null;
    }

    return data as TimezoneAwareTask;
  }

  /**
   * Update a task's due date with timezone awareness
   */
  async updateTaskDueDate(taskId: string, newDueDate: Date): Promise<boolean> {
    // Convert the due date to UTC for storage
    const utcDueDate = new Date(newDueDate.toLocaleString('en-US', { timeZone: 'UTC' }));

    const { error } = await supabase
      .from('tasks')
      .update({ 
        due_date: utcDueDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .eq('user_id', this.userId);

    if (error) {
      console.error('Error updating task due date:', error);
      return false;
    }

    return true;
  }

  /**
   * Get the next occurrence of user's midnight for scheduling
   */
  getNextUserMidnight(): Date {
    const now = getCurrentDateInTimezone(this.timezone);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return getStartOfDayInTimezone(tomorrow, this.timezone);
  }

  /**
   * Trigger daily task transition for this user
   */
  async triggerDailyTransition(): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('transition_daily_tasks', {
        user_uuid: this.userId
      });

      if (error) {
        console.error('Error triggering daily transition:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in triggerDailyTransition:', error);
      return null;
    }
  }

  /**
   * Get task statistics for the user's current day
   */
  async getDailyTaskStats(): Promise<{
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  }> {
    const { today, overdue } = await this.getTasksGroupedByTimeStatus();
    
    const { data: completedToday, error } = await supabase
      .from('tasks')
      .select('id')
      .eq('user_id', this.userId)
      .eq('status', 'completed')
      .gte('updated_at', getStartOfDayInTimezone(new Date(), this.timezone).toISOString())
      .lte('updated_at', getEndOfDayInTimezone(new Date(), this.timezone).toISOString());

    const completed = completedToday?.length || 0;
    const pending = today.length;
    const overdueCount = overdue.length;
    const total = completed + pending + overdueCount;

    return {
      total,
      completed,
      pending,
      overdue: overdueCount
    };
  }
}

/**
 * Factory function to create a TimezoneTaskService instance
 */
export function createTimezoneTaskService(userId: string, timezone: string): TimezoneTaskService {
  return new TimezoneTaskService(userId, timezone);
}
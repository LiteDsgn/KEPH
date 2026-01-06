/**
 * Example usage of the TimezoneTaskService with the existing Task interface
 * This demonstrates how to integrate timezone-aware functionality with your current codebase
 */

import { createTimezoneTaskService, TimezoneTaskService } from './timezone-task-service';
import { useAuth } from '@/hooks/use-auth';
import { useTimezone } from '@/hooks/use-timezone';
import { Task } from '@/types';

/**
 * Hook for using the timezone-aware task service
 */
export function useTimezoneTaskService() {
  const { user } = useAuth();
  const { settings } = useTimezone();

  if (!user) {
    throw new Error('User must be authenticated to use timezone task service');
  }

  const service = createTimezoneTaskService(user.id, settings.timezone);

  return {
    getTasksDueToday: () => service.getTasksDueToday(),
    getOverdueTasks: () => service.getOverdueTasks(),
    getTasksGroupedByTimeStatus: (userTimezone?: string) => 
      service.getTasksGroupedByTimeStatus(userTimezone),
    createTask: (task: { title: string; notes?: string; dueDate: Date; category?: string; }) => service.createTask(task),
    updateTaskDueDate: (taskId: string, newDueDate: Date) => 
      service.updateTaskDueDate(taskId, newDueDate),
    isTaskDueToday: (task: Task, userTimezone?: string) => 
      service.isTaskDueToday(task, userTimezone),
    isTaskOverdue: (task: Task, userTimezone?: string) => 
      service.isTaskOverdue(task, userTimezone)
  };
}

/**
 * Example usage functions for the timezone service
 */
export class TimezoneServiceExamples {
  private service: TimezoneTaskService;

  constructor(userId: string, timezone: string) {
    this.service = new TimezoneTaskService(userId, timezone);
  }

  /**
   * Example: Load and display today's tasks
   */
  async loadTodaysTasks(): Promise<Task[]> {
    try {
      const todaysTasks = await this.service.getTasksDueToday();
      console.log('Tasks due today:', todaysTasks);
      // These are now proper Task objects with camelCase properties
      todaysTasks.forEach(task => {
        console.log(`Task: ${task.title}, Due: ${task.dueDate}`);
      });
      return todaysTasks;
    } catch (error) {
      console.error('Error fetching today\'s tasks:', error);
      return [];
    }
  }

  /**
   * Example: Create a new task with timezone awareness
   */
  async createTimezoneAwareTask(taskData: { title: string; notes?: string; dueDate: Date; category?: string; }): Promise<Task | null> {
    try {
      const newTask = await this.service.createTask(taskData);
      console.log('Created task:', newTask);
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      return null;
    }
  }

  /**
   * Example: Get tasks grouped by time status
   */
  async getTasksByTimeStatus(userTimezone: string = 'UTC') {
    try {
      const groupedTasks = await this.service.getTasksGroupedByTimeStatus(userTimezone);
      console.log('Today:', groupedTasks.today.length);
      console.log('Overdue:', groupedTasks.overdue.length);
      console.log('Upcoming:', groupedTasks.upcoming.length);
      return groupedTasks;
    } catch (error) {
      console.error('Error fetching grouped tasks:', error);
      return { today: [], overdue: [], upcoming: [] };
    }
  }
}

/**
 * Migration helper class to guide replacement of existing task logic
 */
export class TimezoneTaskMigrationHelper {
  private service: TimezoneTaskService;

  constructor(userId: string, timezone: string) {
    this.service = new TimezoneTaskService(userId, timezone);
  }

  /**
   * Replace existing task fetching with timezone-aware version
   * 
   * Before: const tasks = await supabase.from('tasks').select('*')
   * After: const tasks = await this.getTasksDueToday()
   */
  async getTasksDueToday(): Promise<Task[]> {
    return this.service.getTasksDueToday();
  }

  /**
   * Replace manual overdue checking with timezone-aware version
   * 
   * Before: task.dueDate < new Date()
   * After: this.isTaskOverdue(task, userTimezone)
   */
  isTaskOverdue(task: Task, userTimezone?: string): boolean {
    return this.service.isTaskOverdue(task, userTimezone);
  }

  /**
   * Replace manual today checking with timezone-aware version
   * 
   * Before: isToday(task.dueDate)
   * After: this.isTaskDueToday(task, userTimezone)
   */
  isTaskDueToday(task: Task, userTimezone?: string): boolean {
    return this.service.isTaskDueToday(task, userTimezone);
  }
}
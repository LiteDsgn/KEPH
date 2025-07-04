import { addDays, addWeeks, addMonths, addYears, isBefore, isAfter } from 'date-fns';
import type { Task, RecurrenceConfig } from '@/types';

/**
 * Generates the next due date for a recurring task
 */
export function getNextDueDate(currentDate: Date, recurrence: RecurrenceConfig): Date {
  switch (recurrence.type) {
    case 'daily':
      return addDays(currentDate, recurrence.interval);
    case 'weekly':
      return addWeeks(currentDate, recurrence.interval);
    case 'monthly':
      return addMonths(currentDate, recurrence.interval);
    case 'yearly':
      return addYears(currentDate, recurrence.interval);
    default:
      return currentDate;
  }
}

/**
 * Checks if a recurring task should generate a new instance
 */
export function shouldGenerateNextInstance(
  task: Task,
  currentDate: Date = new Date()
): boolean {
  if (!task.recurrence || task.recurrence.type === 'none') {
    return false;
  }

  // Don't generate if task is not completed
  if (task.status !== 'completed') {
    return false;
  }

  // Don't generate if no due date is set
  if (!task.dueDate) {
    return false;
  }

  const nextDueDate = getNextDueDate(task.dueDate, task.recurrence);

  // Check if we've reached the end date
  if (task.recurrence.endDate && isAfter(nextDueDate, task.recurrence.endDate)) {
    return false;
  }

  // Check if we've reached max occurrences (this would need to be tracked separately)
  // For now, we'll assume this is handled at the application level

  return true;
}

/**
 * Creates a new instance of a recurring task
 */
export function createRecurringTaskInstance(
  originalTask: Task,
  instanceNumber?: number
): Omit<Task, 'id' | 'createdAt'> {
  if (!originalTask.recurrence || !originalTask.dueDate) {
    throw new Error('Task must have recurrence configuration and due date');
  }

  const nextDueDate = getNextDueDate(originalTask.dueDate, originalTask.recurrence);

  return {
    title: originalTask.title,
    subtasks: originalTask.subtasks?.map(st => ({
      ...st,
      id: crypto.randomUUID(),
      completed: false, // Reset subtask completion
    })),
    status: 'current',
    notes: originalTask.notes,
    urls: originalTask.urls?.map(url => ({
      ...url,
      id: crypto.randomUUID(),
    })),
    dueDate: nextDueDate,
    recurrence: originalTask.recurrence,
    parentRecurringTaskId: originalTask.parentRecurringTaskId || originalTask.id,
    isRecurringInstance: true,
  };
}

/**
 * Gets all pending recurring task instances that should be created
 */
export function getPendingRecurringInstances(
  tasks: Task[],
  currentDate: Date = new Date()
): Array<Omit<Task, 'id' | 'createdAt'>> {
  const pendingInstances: Array<Omit<Task, 'id' | 'createdAt'>> = [];

  // Find completed recurring tasks that need new instances
  const completedRecurringTasks = tasks.filter(task => 
    task.recurrence && 
    task.recurrence.type !== 'none' && 
    task.status === 'completed' &&
    shouldGenerateNextInstance(task, currentDate)
  );

  for (const task of completedRecurringTasks) {
    try {
      const newInstance = createRecurringTaskInstance(task);
      
      // Check if an instance for this date already exists
      const existingInstance = tasks.find(t => 
        t.parentRecurringTaskId === (task.parentRecurringTaskId || task.id) &&
        t.dueDate?.getTime() === newInstance.dueDate?.getTime()
      );

      if (!existingInstance) {
        pendingInstances.push(newInstance);
      }
    } catch (error) {
      console.error('Error creating recurring task instance:', error);
    }
  }

  return pendingInstances;
}

/**
 * Formats recurrence configuration for display
 */
export function formatRecurrenceDisplay(recurrence: RecurrenceConfig): string {
  if (recurrence.type === 'none') {
    return 'No repeat';
  }

  const interval = recurrence.interval;
  const type = recurrence.type;
  
  let baseText = '';
  if (interval === 1) {
    baseText = `Every ${type.slice(0, -2)}ly`; // daily, weekly, monthly, yearly
  } else {
    baseText = `Every ${interval} ${type}s`;
  }

  const endConditions = [];
  if (recurrence.endDate) {
    endConditions.push(`until ${recurrence.endDate.toLocaleDateString()}`);
  }
  if (recurrence.maxOccurrences) {
    endConditions.push(`for ${recurrence.maxOccurrences} times`);
  }

  if (endConditions.length > 0) {
    baseText += ` (${endConditions.join(', ')})`;
  }

  return baseText;
}
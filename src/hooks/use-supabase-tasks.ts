'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase, getCurrentUserId, handleSupabaseError } from '@/lib/supabase';
import type { Task, TaskStatus, Subtask, Url } from '@/types';
import type { Database } from '@/types/database';
import { isBefore, startOfToday } from 'date-fns';
import { getPendingRecurringInstances, shouldGenerateNextInstance, createRecurringTaskInstance } from '@/lib/recurring-tasks';

type SupabaseTask = Database['public']['Tables']['tasks']['Row'];
type SupabaseSubtask = Database['public']['Tables']['subtasks']['Row'];
type SupabaseTaskUrl = Database['public']['Tables']['task_urls']['Row'];
type SupabaseCategory = Database['public']['Tables']['categories']['Row'];

// Local storage keys
const TASKS_STORAGE_KEY = 'supabase-tasks-cache';
const LAST_SYNC_KEY = 'supabase-last-sync';

// Convert Supabase task to app Task type
function convertSupabaseTask(
  task: SupabaseTask,
  subtasks: SupabaseSubtask[] = [],
  urls: SupabaseTaskUrl[] = [],
  category?: { id: string; name: string; color: string | null } | null
): Task {
  return {
    id: task.id,
    title: task.title,
    status: task.status,
    createdAt: new Date(task.created_at),
    notes: task.notes || undefined,
    dueDate: task.due_date ? new Date(task.due_date) : undefined,
    completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
    category: category?.name,
    subtasks: subtasks.map(st => ({
      id: st.id,
      title: st.title,
      completed: st.completed
    })),
    urls: urls.map(url => ({
      id: url.id,
      value: url.url
    })),
    recurrence: task.recurrence_type && task.recurrence_type !== 'none' ? {
      type: task.recurrence_type,
      interval: task.recurrence_interval || 1,
      endDate: task.recurrence_end_date ? new Date(task.recurrence_end_date) : undefined,
      maxOccurrences: task.recurrence_max_occurrences || undefined
    } : undefined,
    parentRecurringTaskId: task.parent_recurring_task_id || undefined,
    isRecurringInstance: task.is_recurring_instance
  };
}

// Convert app Task to Supabase format
function convertToSupabaseTask(task: Omit<Task, 'id'>, userId: string, categoryId?: string) {
  return {
    title: task.title,
    notes: task.notes || null,
    status: task.status,
    due_date: task.dueDate?.toISOString() || null,
    completed_at: task.completedAt?.toISOString() || null,
    user_id: userId,
    category_id: categoryId || null,
    recurrence_type: task.recurrence?.type || 'none',
    recurrence_interval: task.recurrence?.interval || null,
    recurrence_end_date: task.recurrence?.endDate?.toISOString() || null,
    recurrence_max_occurrences: task.recurrence?.maxOccurrences || null,
    parent_recurring_task_id: task.parentRecurringTaskId || null,
    is_recurring_instance: task.isRecurringInstance || false
  };
}

export function useSupabaseTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);
  const [search, setSearch] = useState('');
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);

  // Load tasks from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const cached = localStorage.getItem(TASKS_STORAGE_KEY);
      if (cached) {
        const parsedTasks = JSON.parse(cached).map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          completedAt: task.completedAt ? new Date(task.completedAt) : undefined
        }));
        setTasks(parsedTasks);
      }
    } catch (error) {
      console.error('Error loading cached tasks:', error);
    }
  }, []);

  // Monitor online status
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cache tasks to localStorage
  const cacheTasks = useCallback((tasksToCache: Task[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasksToCache));
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    } catch (error) {
      console.error('Error caching tasks:', error);
    }
  }, []);

  // Fetch tasks from Supabase
  const fetchTasks = useCallback(async () => {
    if (!isOnline) return;
    
    try {
      setSyncing(true);
      setError(null);
      
      const userId = await getCurrentUserId();
      
      // Fetch tasks with related data
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          subtasks(*),
          task_urls(*),
          categories(id, name, color)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      const convertedTasks = tasksData?.map(taskData => {
         const { subtasks, task_urls, categories, ...task } = taskData;
         return convertSupabaseTask(
            task,
            subtasks || [],
            task_urls || [],
            categories || undefined
          );
       }) || [];

      // Check for overdue tasks and tasks from previous days
      const today = startOfToday();
      const overdue = convertedTasks.filter(task => {
        if (task.status !== 'current') return false;
        
        // Task is overdue if it has a due date before today
        if (task.dueDate && isBefore(task.dueDate, today)) {
          return true;
        }
        
        // Task is also overdue if it was created before today (regardless of due date)
        if (isBefore(task.createdAt, today)) {
          return true;
        }
        
        return false;
      });
      
      if (overdue.length > 0) {
        setOverdueTasks(overdue);
        // Update overdue tasks to pending status
        const updatedTasks = convertedTasks.map(task => {
          const isOverdue = overdue.some(ot => ot.id === task.id);
          return isOverdue ? { ...task, status: 'pending' as TaskStatus } : task;
        });
        setTasks(updatedTasks);
        cacheTasks(updatedTasks);
        
        // Update status in database for overdue tasks
        if (isOnline) {
          try {
            const overdueIds = overdue.map(task => task.id);
            await supabase
              .from('tasks')
              .update({ status: 'pending' })
              .in('id', overdueIds);
          } catch (error) {
            console.error('Error updating overdue tasks in database:', error);
          }
        }
      } else {
        setTasks(convertedTasks);
        cacheTasks(convertedTasks);
      }
      
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      setError(error.message || 'Failed to fetch tasks');
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  }, [isOnline, cacheTasks]);

  // Initial load and real-time subscription
  useEffect(() => {
    fetchTasks();

    if (!isOnline) {
      setLoading(false);
      return;
    }

    // Set up real-time subscription
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        () => {
          // Refetch tasks when changes occur
          fetchTasks();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subtasks'
        },
        () => {
          fetchTasks();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_urls'
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTasks, isOnline]);

  // Add single task
  const addTask = useCallback(async (taskData: Omit<Task, 'id'>) => {
    const tempId = crypto.randomUUID();
    const newTask: Task = {
      id: tempId,
      ...taskData,
      status: 'current',
      createdAt: new Date(),
      dueDate: taskData.dueDate || new Date(),
    };

    // Optimistic update
    setTasks(prev => [newTask, ...prev]);

    if (!isOnline) {
      // Store for later sync
      return;
    }

    try {
      const userId = await getCurrentUserId();
      
      // Get category ID if category is specified
      let categoryId: string | undefined;
      if (taskData.category) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('user_id', userId)
          .eq('name', taskData.category)
          .single();
        categoryId = categoryData?.id;
      }

      const { data: insertedTask, error } = await supabase
        .from('tasks')
        .insert(convertToSupabaseTask(taskData, userId, categoryId))
        .select()
        .single();

      if (error) throw error;

      // Insert subtasks
      if (taskData.subtasks && taskData.subtasks.length > 0) {
        const { error: subtasksError } = await supabase
          .from('subtasks')
          .insert(
            taskData.subtasks.map(st => ({
              title: st.title,
              completed: st.completed,
              task_id: insertedTask.id
            }))
          );
        if (subtasksError) throw subtasksError;
      }

      // Insert URLs
      if (taskData.urls && taskData.urls.length > 0) {
        const { error: urlsError } = await supabase
          .from('task_urls')
          .insert(
            taskData.urls.map(url => ({
              url: url.value,
              task_id: insertedTask.id
            }))
          );
        if (urlsError) throw urlsError;
      }

      // Update with real task ID
      setTasks(prev => prev.map(task => 
        task.id === tempId ? { ...newTask, id: insertedTask.id } : task
      ));
      
    } catch (error: any) {
      console.error('Error adding task:', error);
      setError(error.message || 'Failed to add task');
      // Revert optimistic update
      setTasks(prev => prev.filter(task => task.id !== tempId));
    }
  }, [isOnline]);

  // Add multiple tasks
  const addTasks = useCallback(async (newTasksData: Array<{ title: string; subtasks?: string[] }>) => {
    const newTasks: Task[] = newTasksData.map((data) => ({
      id: crypto.randomUUID(),
      title: data.title,
      subtasks: data.subtasks
        ? data.subtasks.map(subtaskTitle => ({
            id: crypto.randomUUID(),
            title: subtaskTitle,
            completed: false,
        }))
        : [],
      status: 'current',
      createdAt: new Date(),
      notes: '',
      urls: [],
      dueDate: new Date(),
    }));
    
    // Optimistic update
    setTasks((prev) => [...newTasks, ...prev]);

    if (!isOnline) return;

    try {
      const userId = await getCurrentUserId();
      
      for (const task of newTasks) {
        await addTask(task);
      }
    } catch (error: any) {
      console.error('Error adding tasks:', error);
      setError(error.message || 'Failed to add tasks');
    }
  }, [addTask, isOnline]);

  // Update task
  const updateTask = useCallback(async (taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    // Optimistic update
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updatedTask = { ...task, ...updates };
        if (updates.status === 'completed' && !task.completedAt) {
          updatedTask.completedAt = new Date();
        }
        if (updates.status && updates.status !== 'completed' && task.status === 'completed') {
          updatedTask.completedAt = undefined;
        }
        return updatedTask;
      }
      return task;
    }));

    if (!isOnline) return;

    try {
      const userId = await getCurrentUserId();
      
      // Get category ID if category is being updated
      let categoryId: string | null = null;
      if (updates.category) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('user_id', userId)
          .eq('name', updates.category)
          .single();
        categoryId = categoryData?.id || null;
      }

      const supabaseUpdates: any = {
        ...(updates.title && { title: updates.title }),
        ...(updates.notes !== undefined && { notes: updates.notes }),
        ...(updates.status && { status: updates.status }),
        ...(updates.dueDate !== undefined && { due_date: updates.dueDate?.toISOString() }),
        ...(updates.completedAt !== undefined && { completed_at: updates.completedAt?.toISOString() }),
        ...(categoryId !== null && { category_id: categoryId }),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('tasks')
        .update(supabaseUpdates)
        .eq('id', taskId)
        .eq('user_id', userId);

      if (error) throw error;

      // Handle subtasks updates
      if (updates.subtasks) {
        // Delete existing subtasks
        await supabase
          .from('subtasks')
          .delete()
          .eq('task_id', taskId);

        // Insert new subtasks
        if (updates.subtasks.length > 0) {
          const { error: subtasksError } = await supabase
            .from('subtasks')
            .insert(
              updates.subtasks.map(st => ({
                title: st.title,
                completed: st.completed,
                task_id: taskId
              }))
            );
          if (subtasksError) throw subtasksError;
        }
      }

      // Handle URLs updates
      if (updates.urls) {
        // Delete existing URLs
        await supabase
          .from('task_urls')
          .delete()
          .eq('task_id', taskId);

        // Insert new URLs
        if (updates.urls.length > 0) {
          const { error: urlsError } = await supabase
            .from('task_urls')
            .insert(
              updates.urls.map(url => ({
                url: url.value,
                task_id: taskId
              }))
            );
          if (urlsError) throw urlsError;
        }
      }

      // Handle recurring task generation
      const completedTask = tasks.find(t => t.id === taskId);
      if (completedTask && updates.status === 'completed' && shouldGenerateNextInstance(completedTask)) {
        try {
          const newInstance = createRecurringTaskInstance(completedTask);
          await addTask({
        ...newInstance,
        createdAt: new Date(),
      });
        } catch (error) {
          console.error('Error creating recurring task instance:', error);
        }
      }
      
    } catch (error: any) {
      console.error('Error updating task:', error);
      setError(error.message || 'Failed to update task');
      // Revert optimistic update
      fetchTasks();
    }
  }, [isOnline, tasks, addTask, fetchTasks]);

  // Update multiple tasks
  const updateMultipleTasks = useCallback(async (taskIds: string[], updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    // Optimistic update
    setTasks(prev => 
      prev.map(task => {
        if (taskIds.includes(task.id)) {
          const updatedTask = { ...task, ...updates };
          if (updates.status === 'completed' && !task.completedAt) {
            updatedTask.completedAt = new Date();
          }
          if (updates.status && updates.status !== 'completed' && task.status === 'completed') {
            updatedTask.completedAt = undefined;
          }
          return updatedTask;
        }
        return task;
      })
    );

    if (!isOnline) return;

    try {
      for (const taskId of taskIds) {
        await updateTask(taskId, updates);
      }
    } catch (error: any) {
      console.error('Error updating multiple tasks:', error);
      setError(error.message || 'Failed to update tasks');
    }
  }, [updateTask, isOnline]);

  // Delete task
  const deleteTask = useCallback(async (taskId: string) => {
    // Optimistic update
    setTasks(prev => prev.filter(task => task.id !== taskId));

    if (!isOnline) return;

    try {
      const userId = await getCurrentUserId();
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', userId);

      if (error) throw error;
      
    } catch (error: any) {
      console.error('Error deleting task:', error);
      setError(error.message || 'Failed to delete task');
      // Revert optimistic update
      fetchTasks();
    }
  }, [isOnline, fetchTasks]);

  // Duplicate task
  const duplicateTask = useCallback(async (taskId: string) => {
    const taskToDuplicate = tasks.find(t => t.id === taskId);
    if (!taskToDuplicate) return;

    const duplicatedTask = {
      ...taskToDuplicate,
      title: `${taskToDuplicate.title} (Copy)`,
      status: 'current' as TaskStatus,
      dueDate: new Date(),
      completedAt: undefined,
      parentRecurringTaskId: undefined,
      isRecurringInstance: false
    };

    await addTask(duplicatedTask);
  }, [tasks, addTask]);

  // Clear overdue tasks
  const clearOverdueTasks = useCallback(() => {
    setOverdueTasks([]);
  }, []);

  // Search functionality
  const searchTasks = useCallback(async (query: string) => {
    if (!query.trim() || !isOnline) {
      return tasks.filter(task => 
        task.title.toLowerCase().includes(query.toLowerCase()) ||
        (task.notes && task.notes.toLowerCase().includes(query.toLowerCase()))
      );
    }

    try {
      const userId = await getCurrentUserId();
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          subtasks (*),
          task_urls (*)
        `)
        .textSearch('title', query)
        .eq('user_id', userId);

      if (error) throw error;
      
      return data || [];
    } catch (error: any) {
      console.error('Error searching tasks:', error);
      // Fallback to local search
      return tasks.filter(task => 
        task.title.toLowerCase().includes(query.toLowerCase()) ||
        (task.notes && task.notes.toLowerCase().includes(query.toLowerCase()))
      );
    }
  }, [tasks, isOnline]);

  // Filtered tasks based on search
  const filteredTasks = useMemo(() => {
    if (!search.trim()) return tasks;
    return tasks.filter(task => 
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      (task.notes && task.notes.toLowerCase().includes(search.toLowerCase()))
    );
  }, [tasks, search]);

  return {
    tasks: filteredTasks,
    loading,
    syncing,
    error,
    isOnline,
    search,
    setSearch,
    overdueTasks,
    addTask,
    addTasks,
    updateTask,
    updateMultipleTasks,
    deleteTask,
    duplicateTask,
    clearOverdueTasks,
    searchTasks,
    refetch: fetchTasks
  };
}
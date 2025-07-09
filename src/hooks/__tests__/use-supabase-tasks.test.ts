import { renderHook, act, waitFor } from '@testing-library/react';
import { useSupabaseTasks } from '../use-supabase-tasks';
import { supabase, getCurrentUserId } from '@/lib/supabase';
import { createMockTask, createMockTasks, mockSupabaseResponse, mockUser } from '@/__tests__/test-utils';
import type { Task, TaskStatus } from '@/types';

// Mock the supabase module
jest.mock('@/lib/supabase');
const mockSupabase = supabase as jest.Mocked<typeof supabase>;
const mockGetCurrentUserId = getCurrentUserId as jest.MockedFunction<typeof getCurrentUserId>;

// Mock date-fns functions
jest.mock('date-fns', () => ({
  isBefore: jest.fn(),
  startOfToday: jest.fn(() => new Date('2024-01-15')),
  isToday: jest.fn((date: Date) => {
    const today = new Date('2024-01-15');
    return date.toDateString() === today.toDateString();
  })
}));

describe('useSupabaseTasks', () => {
  const mockTasks = createMockTasks(3);
  
  beforeEach(() => {
    jest.clearAllMocks();
    (mockGetCurrentUserId as jest.Mock).mockResolvedValue(mockUser.id);
    
    // Create a chainable mock object
    const createChainableMock = () => {
      const chainable = {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(mockSupabaseResponse(mockTasks[0])),
      };
      // Make all methods return the same chainable object
      Object.keys(chainable).forEach(key => {
        if (key !== 'single') {
          (chainable as any)[key].mockReturnValue(chainable);
        }
      });
      return chainable;
    };
    
    // Mock successful Supabase response
    (mockSupabase.from as jest.Mock).mockReturnValue(createChainableMock());
    
    // Mock other supabase methods
    (mockSupabase.channel as jest.Mock) = jest.fn().mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnValue({})
    });
    (mockSupabase.removeChannel as jest.Mock) = jest.fn();
    
    // Mock localStorage
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.setItem = jest.fn();
    Storage.prototype.removeItem = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useSupabaseTasks());
      
      expect(result.current.tasks).toEqual([]);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBe(null);
      expect(result.current.syncing).toBe(false);
    });

    it('should load cached tasks from localStorage on mount', async () => {
      const cachedTasks = JSON.stringify(mockTasks.map(task => ({
        ...task,
        createdAt: task.createdAt.toISOString(),
        dueDate: task.dueDate?.toISOString(),
        completedAt: task.completedAt?.toISOString()
      })));
      
      Storage.prototype.getItem = jest.fn().mockReturnValue(cachedTasks);
      
      // Mock offline to prevent fetchTasks from running
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      
      const { result } = renderHook(() => useSupabaseTasks());
      
      await waitFor(() => {
        expect(result.current.tasks).toHaveLength(3);
      });
      
      expect(result.current.tasks[0].title).toBe('Test Task 1');
    });
  });

  describe('fetchTasks', () => {
    it('should fetch tasks successfully', async () => {
      const mockTasksData = mockTasks.map(task => ({
        ...task,
        created_at: task.createdAt.toISOString(),
        due_date: task.dueDate?.toISOString() || null,
        completed_at: task.completedAt?.toISOString() || null,
        user_id: mockUser.id,
        category_id: null,
        subtasks: [],
        task_urls: [],
        categories: null
      }));
      
      const chainableMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue(mockSupabaseResponse(mockTasksData))
      };
      chainableMock.select.mockReturnValue(chainableMock);
      chainableMock.eq.mockReturnValue(chainableMock);
      
      (mockSupabase.from as jest.Mock).mockReturnValue(chainableMock);
      
      const { result } = renderHook(() => useSupabaseTasks());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.tasks).toHaveLength(3);
      expect(result.current.error).toBe(null);
    });

    it('should handle fetch errors gracefully', async () => {
      const errorMessage = 'Database connection failed';
      const chainableMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue(mockSupabaseResponse(null, { message: errorMessage }))
      };
      chainableMock.select.mockReturnValue(chainableMock);
      chainableMock.eq.mockReturnValue(chainableMock);
      
      (mockSupabase.from as jest.Mock).mockReturnValue(chainableMock);
      
      const { result } = renderHook(() => useSupabaseTasks());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.error).toContain(errorMessage);
    });
  });

  describe('addTask', () => {
    it('should add a new task successfully', async () => {
      const newTask = createMockTask({ title: 'New Task' });
      const mockInsertResponse = {
        ...newTask,
        created_at: newTask.createdAt.toISOString(),
        user_id: mockUser.id,
        subtasks: [],
        task_urls: [],
        categories: null
      };
      
      const chainableMock = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(mockSupabaseResponse(mockInsertResponse))
      };
      chainableMock.insert.mockReturnValue(chainableMock);
      chainableMock.select.mockReturnValue(chainableMock);
      
      (mockSupabase.from as jest.Mock).mockReturnValue(chainableMock);
      
      const { result } = renderHook(() => useSupabaseTasks());
      
      await act(async () => {
        await result.current.addTask({
          title: 'New Task',
          status: 'current',
          createdAt: new Date(),
          subtasks: [],
          urls: []
        });
      });
      
      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].title).toBe('New Task');
    });

    it('should handle add task errors', async () => {
      const errorMessage = 'Insert failed';
      const chainableMock = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(mockSupabaseResponse(null, { message: errorMessage }))
      };
      chainableMock.insert.mockReturnValue(chainableMock);
      chainableMock.select.mockReturnValue(chainableMock);
      
      (mockSupabase.from as jest.Mock).mockReturnValue(chainableMock);
      
      const { result } = renderHook(() => useSupabaseTasks());
      
      await act(async () => {
        try {
          await result.current.addTask({
            title: 'New Task',
            status: 'current',
            createdAt: new Date(),
            subtasks: [],
            urls: []
          });
        } catch (error) {
          expect(error).toBeDefined();
        }
      });
    });
  });

  describe('updateTask', () => {
    it('should update a task successfully', async () => {
      const existingTask = createMockTask();
      const updatedTask = { ...existingTask, title: 'Updated Task' };
      
      // Setup initial state with existing task
      Storage.prototype.getItem = jest.fn().mockReturnValue(
        JSON.stringify([{
          ...existingTask,
          createdAt: existingTask.createdAt.toISOString()
        }])
      );
      
      const chainableMock = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(mockSupabaseResponse({
          ...updatedTask,
          created_at: updatedTask.createdAt.toISOString(),
          subtasks: [],
          task_urls: [],
          categories: null
        }))
      };
      chainableMock.update.mockReturnValue(chainableMock);
      chainableMock.eq.mockReturnValue(chainableMock);
      chainableMock.select.mockReturnValue(chainableMock);
      
      (mockSupabase.from as jest.Mock).mockReturnValue(chainableMock);
      
      const { result } = renderHook(() => useSupabaseTasks());
      
      await act(async () => {
        await result.current.updateTask(existingTask.id, { title: 'Updated Task' });
      });
      
      expect(result.current.tasks[0].title).toBe('Updated Task');
    });
  });

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      const taskToDelete = createMockTask();
      
      // Setup initial state with existing task
      Storage.prototype.getItem = jest.fn().mockReturnValue(
        JSON.stringify([{
          ...taskToDelete,
          createdAt: taskToDelete.createdAt.toISOString()
        }])
      );
      
      const chainableMock = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue(mockSupabaseResponse({}))
      };
      chainableMock.delete.mockReturnValue(chainableMock);
      
      (mockSupabase.from as jest.Mock).mockReturnValue(chainableMock);
      
      const { result } = renderHook(() => useSupabaseTasks());
      
      await act(async () => {
        await result.current.deleteTask(taskToDelete.id);
      });
      
      expect(result.current.tasks).toHaveLength(0);
    });
  });

  describe('search functionality', () => {
    it('should filter tasks based on search query', async () => {
      const tasks = [
        createMockTask({ title: 'Buy groceries' }),
        createMockTask({ title: 'Walk the dog' }),
        createMockTask({ title: 'Buy coffee' })
      ];
      
      Storage.prototype.getItem = jest.fn().mockReturnValue(
        JSON.stringify(tasks.map(task => ({
          ...task,
          createdAt: task.createdAt.toISOString()
        })))
      );
      
      // Mock offline to prevent fetchTasks from running
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      
      const { result } = renderHook(() => useSupabaseTasks());
      
      await waitFor(() => {
        expect(result.current.tasks).toHaveLength(3);
      });
      
      act(() => {
        result.current.setSearch('buy');
      });
      
      const filteredTasks = result.current.tasks.filter(task => 
        task.title.toLowerCase().includes(result.current.search.toLowerCase())
      );
      expect(filteredTasks).toHaveLength(2);
      expect(filteredTasks.every(task => task.title.toLowerCase().includes('buy'))).toBe(true);
    });
  });

  describe('offline functionality', () => {
    it('should work offline with cached data', async () => {
      const cachedTasks = JSON.stringify(mockTasks.map(task => ({
        ...task,
        createdAt: task.createdAt.toISOString()
      })));
      
      Storage.prototype.getItem = jest.fn().mockReturnValue(cachedTasks);
      
      // Mock offline state
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      
      const { result } = renderHook(() => useSupabaseTasks());
      
      await waitFor(() => {
        expect(result.current.tasks).toHaveLength(3);
      });
      
      expect(result.current.isOnline).toBe(false);
    });
  });
});
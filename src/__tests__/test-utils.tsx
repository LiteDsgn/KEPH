import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Task, TaskStatus, Subtask } from '@/types';

// Mock data for testing
export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Test Task 1',
    status: 'current',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    category: 'work',
    subtasks: [],
    notes: 'Test description 1',
    urls: []
  },
  {
    id: '2',
    title: 'Test Task 2',
    status: 'completed',
    createdAt: new Date('2024-01-02T00:00:00Z'),
    completedAt: new Date('2024-01-02T12:00:00Z'),
    category: 'personal',
    dueDate: new Date('2024-01-10T00:00:00Z'),
    subtasks: [],
    notes: 'Important task',
    urls: []
  }
];

export const mockCategories = [
  { id: '1', name: 'work', color: '#3b82f6' },
  { id: '2', name: 'personal', color: '#ef4444' },
  { id: '3', name: 'shopping', color: '#10b981' }
];

// Mock user data
export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User'
  }
};

// Factory functions for creating mock data
export const createMockTask = (overrides: Partial<Task> = {}): Task => {
  return {
    id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    title: 'Test Task',
    status: 'current' as TaskStatus,
    createdAt: new Date(),
    subtasks: [],
    urls: [],
    ...overrides
  };
};

export const createMockTasks = (count: number): Task[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockTask({
      id: `task-${index + 1}`,
      title: `Test Task ${index + 1}`,
      status: index === 0 ? 'completed' : index === 4 ? 'pending' : 'current'
    })
  );
};

export const createMockCategory = (overrides: Partial<{ id: string; name: string; color: string }> = {}) => {
  return {
    id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    name: 'Test Category',
    color: '#3b82f6',
    ...overrides
  };
};

// Mock Supabase response structure
export const createMockSupabaseResponse = function<T>(data: T, error: any = null) {
  return {
    data,
    error,
    count: null,
    status: error ? 400 : 200,
    statusText: error ? 'Bad Request' : 'OK'
  };
};

// Alias for backward compatibility
export const mockSupabaseResponse = createMockSupabaseResponse;

// Mock localStorage
export const mockLocalStorage = {
  getItem: jest.fn((key: string) => {
    const store: Record<string, string> = {};
    return store[key] || null;
  }),
  setItem: jest.fn((key: string, value: string) => {
    const store: Record<string, string> = {};
    store[key] = value;
  }),
  removeItem: jest.fn((key: string) => {
    const store: Record<string, string> = {};
    delete store[key];
  }),
  clear: jest.fn(() => {
    const store: Record<string, string> = {};
    Object.keys(store).forEach(key => delete store[key]);
  })
};

// Custom render function
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Add any custom options here
}

export const customRender = (ui: React.ReactElement, options?: CustomRenderOptions) => {
  return render(ui, {
    ...options
  });
};

// Utility to wait for loading states to finish
export const waitForLoadingToFinish = (): Promise<void> => {
  return new Promise<void>(resolve => setTimeout(resolve, 0));
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };
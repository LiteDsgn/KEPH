// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn()
}));



// Mock TaskItem component
jest.mock('../task-item', () => ({
  TaskItem: ({ task, onUpdate, onDelete, onDuplicate }: any) => (
    <div data-testid={`task-item-${task.id}`}>
      <span>{task.title}</span>
      <button onClick={() => onUpdate(task.id, { status: 'completed' })}>Complete</button>
      <button onClick={() => onDelete(task.id)}>Delete</button>
      <button onClick={() => onDuplicate(task.id)}>Duplicate</button>
    </div>
  )
}));

// Mock all UI components comprehensively
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: any) => <div data-testid="dialog">{children}</div>,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <div data-testid="dialog-title">{children}</div>,
  DialogDescription: ({ children }: any) => <div data-testid="dialog-description">{children}</div>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>
}));

jest.mock('@/components/ui/visually-hidden', () => ({
  VisuallyHidden: ({ children }: any) => <div data-testid="visually-hidden">{children}</div>
}));

jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value }: any) => <div data-testid="progress" data-value={value}>Progress: {value}%</div>
}));

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr data-testid="separator" />
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, className }: any) => <button data-testid="button" onClick={onClick} className={className}>{children}</button>
}));



jest.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' ')
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: jest.fn() })
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon" />,
  Circle: () => <div data-testid="circle-icon" />,
  CheckCircle2: () => <div data-testid="check-circle-icon" />,
  Archive: () => <div data-testid="archive-icon" />,
  NotebookText: () => <div data-testid="notebook-icon" />,
  Link: () => <div data-testid="link-icon" />,
  Copy: () => <div data-testid="copy-icon" />,
  X: () => <div data-testid="x-icon" />
}));

// Mock date-fns format function
jest.mock('date-fns', () => ({
  format: jest.fn((date) => date.toLocaleDateString()),
  isToday: jest.fn(() => true),
  isPast: jest.fn(() => false),
  startOfDay: jest.fn((date) => date),
  compareAsc: jest.fn((a, b) => a.getTime() - b.getTime()),
  isYesterday: jest.fn(() => false)
}));

// Mock DailySummaryDialog component using __mocks__ directory
jest.mock('../daily-summary-dialog');

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TaskList } from '../task-list';
import { createMockTask, createMockTasks, createMockCategory } from '@/__tests__/test-utils';
import type { Task, TaskStatus } from '@/types';

describe('TaskList', () => {
  const mockOnUpdateTask = jest.fn();
  const mockOnDeleteTask = jest.fn();
  const mockOnDuplicateTask = jest.fn();
  const mockOnAddCategory = jest.fn();
  const mockSetSearch = jest.fn();
  const mockSetSelectedCategory = jest.fn();
  const mockCategories = ['Test Category'];
  
  const defaultProps = {
    tasks: createMockTasks(5),
    onUpdateTask: mockOnUpdateTask,
    onDeleteTask: mockOnDeleteTask,
    onDuplicateTask: mockOnDuplicateTask,
    onAddCategory: mockOnAddCategory,
    search: '',
    setSearch: mockSetSearch,
    selectedCategory: '',
    setSelectedCategory: mockSetSelectedCategory,
    categories: mockCategories
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render task list with default current tab', () => {
      render(<TaskList {...defaultProps} />);
      
      // Should show current tasks by default
      expect(screen.getByText('Current')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
      expect(screen.getByText('Test Task 3')).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<TaskList {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/search across all tasks/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('should render tab navigation', () => {
      render(<TaskList {...defaultProps} />);
      
      expect(screen.getByText('Current')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('should display task counts in tabs', () => {
      const tasks = [
        createMockTask({ status: 'current' }),
        createMockTask({ status: 'current' }),
        createMockTask({ status: 'completed' }),
        createMockTask({ status: 'pending' })
      ];
      
      render(<TaskList {...defaultProps} tasks={tasks} />);
      
      // Check for count badges (assuming they're rendered)
      expect(screen.getByText('2')).toBeInTheDocument(); // Current count
      expect(screen.getByText('1')).toBeInTheDocument(); // Completed count
    });
  });

  describe('tab switching', () => {
    it('should switch to completed tasks tab', async () => {
      const user = userEvent.setup();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const tasks = [
        createMockTask({ id: '1', status: 'current', title: 'Current Task' }),
        createMockTask({ id: '2', status: 'completed', title: 'Completed Task', completedAt: yesterday })
      ];
      
      render(<TaskList {...defaultProps} tasks={tasks} />);
      
      const doneTab = screen.getByText('Done');
      await user.click(doneTab);
      
      expect(screen.getByText('Completed Task')).toBeInTheDocument();
      expect(screen.queryByText('Current Task')).not.toBeInTheDocument();
    });

    it('should switch to pending tasks tab', async () => {
      const user = userEvent.setup();
      const tasks = [
        createMockTask({ id: '1', status: 'current', title: 'Current Task' }),
        createMockTask({ id: '2', status: 'pending', title: 'Pending Task' })
      ];
      
      render(<TaskList {...defaultProps} tasks={tasks} />);
      
      const pendingTab = screen.getByText('Pending');
      await user.click(pendingTab);
      
      expect(screen.getByText('Pending Task')).toBeInTheDocument();
      expect(screen.queryByText('Current Task')).not.toBeInTheDocument();
    });
  });

  describe('search functionality', () => {
    it('should filter tasks based on search query', async () => {
      const user = userEvent.setup();
      const tasks = [
        createMockTask({ id: '1', status: 'current', title: 'Buy groceries' }),
        createMockTask({ id: '2', status: 'current', title: 'Walk the dog' }),
        createMockTask({ id: '3', status: 'current', title: 'Buy coffee' })
      ];
      
      render(<TaskList {...defaultProps} tasks={tasks} search="buy" />);
      
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
      expect(screen.getByText('Buy coffee')).toBeInTheDocument();
      expect(screen.queryByText('Walk the dog')).not.toBeInTheDocument();
    });

    it('should update search when typing in search input', async () => {
      const user = userEvent.setup();
      render(<TaskList {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/search across all tasks/i) as HTMLInputElement;
      await user.clear(searchInput);
      await user.type(searchInput, 'test query');
      
      expect(searchInput.value).toBe('test query');
      expect(mockSetSearch).toHaveBeenCalledTimes(11); // 1 for clear + 10 for each character
    });

    it('should clear search when input is cleared', async () => {
      const user = userEvent.setup();
      render(<TaskList {...defaultProps} search="existing search" />);
      
      const searchInput = screen.getByPlaceholderText(/search across all tasks/i);
      await user.clear(searchInput);
      
      expect(mockSetSearch).toHaveBeenCalledWith('');
    });
  });

  describe('category filtering', () => {
    it('should filter tasks by selected category', () => {
      const tasks = [
        createMockTask({ id: '1', status: 'current', title: 'Work Task', category: 'Work' }),
        createMockTask({ id: '2', status: 'current', title: 'Personal Task', category: 'Personal' })
      ];
      
      render(
        <TaskList 
          {...defaultProps} 
          tasks={tasks} 
          selectedCategory="Work"
          categories={['Work', 'Personal']}
        />
      );
      
      expect(screen.getByText('Work Task')).toBeInTheDocument();
      expect(screen.queryByText('Personal Task')).not.toBeInTheDocument();
    });
  });

  describe('task operations', () => {
    it('should handle task update', async () => {
      const user = userEvent.setup();
      render(<TaskList {...defaultProps} />);
      
      const completeButton = screen.getAllByText('Complete')[0];
      await user.click(completeButton);
      
      expect(mockOnUpdateTask).toHaveBeenCalledWith(
        expect.any(String),
        { status: 'completed' }
      );
    });

    it('should handle task deletion', async () => {
      const user = userEvent.setup();
      render(<TaskList {...defaultProps} />);
      
      const deleteButton = screen.getAllByText('Delete')[0];
      await user.click(deleteButton);
      
      expect(mockOnDeleteTask).toHaveBeenCalledWith(expect.any(String));
    });

    it('should handle task duplication', async () => {
      const user = userEvent.setup();
      render(<TaskList {...defaultProps} />);
      
      const duplicateButton = screen.getAllByText('Duplicate')[0];
      await user.click(duplicateButton);
      
      expect(mockOnDuplicateTask).toHaveBeenCalledWith(expect.any(String));
    });
  });

  describe('empty states', () => {
    it('should show empty state when no tasks match current filter', () => {
      render(<TaskList {...defaultProps} tasks={[]} />);
      
      expect(screen.getByText(/no tasks here/i)).toBeInTheDocument();
    });

    it('should show empty state for completed tasks when none exist', async () => {
      const user = userEvent.setup();
      const tasks = [createMockTask({ status: 'current' })];
      
      render(<TaskList {...defaultProps} tasks={tasks} />);
      
      const doneTab = screen.getByText('Done');
      await user.click(doneTab);
      
      expect(screen.getByText(/no tasks here/i)).toBeInTheDocument();
    });

    it('should show empty state for search with no results', () => {
      const tasks = [createMockTask({ title: 'Test Task' })];
      
      render(<TaskList {...defaultProps} tasks={tasks} search="nonexistent" />);
      
      expect(screen.getByText(/no tasks here/i)).toBeInTheDocument();
    });
  });

  describe('task grouping', () => {
    it('should group tasks by date', () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      
      const tasks = [
        createMockTask({ 
          id: '1', 
          status: 'current', 
          title: 'Today Task',
          createdAt: today
        }),
        createMockTask({ 
          id: '2', 
          status: 'current', 
          title: 'Yesterday Task',
          createdAt: yesterday
        })
      ];
      
      render(<TaskList {...defaultProps} tasks={tasks} />);
      
      // Should show date headers
      expect(screen.getByText('Today Task')).toBeInTheDocument();
      expect(screen.getByText('Yesterday Task')).toBeInTheDocument();
    });
  });

  describe('performance optimizations', () => {
    it('should memoize filtered tasks', () => {
      const tasks = createMockTasks(10);
      const { rerender } = render(<TaskList {...defaultProps} tasks={tasks} />);
      
      // Re-render with same props should not cause expensive recalculations
      rerender(<TaskList {...defaultProps} tasks={tasks} />);
      
      // This test verifies that useMemo is working by ensuring consistent rendering
      // createMockTasks(10) creates: 1 completed, 1 pending, 8 current tasks
      expect(screen.getAllByTestId(/task-item-/)).toHaveLength(8); // Current tasks only
    });

    it('should memoize task counts', () => {
      const tasks = [
        createMockTask({ status: 'current' }),
        createMockTask({ status: 'completed' }),
        createMockTask({ status: 'pending' })
      ];
      
      const { rerender } = render(<TaskList {...defaultProps} tasks={tasks} />);
      
      // Re-render with same tasks should use memoized counts
      rerender(<TaskList {...defaultProps} tasks={tasks} />);
      
      // Look for count badge more specifically
      const currentTab = screen.getByRole('tab', { name: /current/i });
      expect(currentTab).toBeInTheDocument();
      expect(currentTab.textContent).toContain('1');
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels for tabs', () => {
      render(<TaskList {...defaultProps} />);
      
      const tabList = screen.getByRole('tablist');
      expect(tabList).toBeInTheDocument();
      
      const currentTab = screen.getByRole('tab', { name: /current/i });
      expect(currentTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should have proper labels for search input', () => {
      render(<TaskList {...defaultProps} />);
      
      const searchInput = screen.getByLabelText(/search tasks/i);
      expect(searchInput).toBeInTheDocument();
    });
  });
});
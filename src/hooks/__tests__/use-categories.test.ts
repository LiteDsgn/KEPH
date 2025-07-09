import { renderHook, act } from '@testing-library/react';
import { useCategories } from '../use-categories';
import { waitForLoadingToFinish } from '@/__tests__/test-utils';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

describe('useCategories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('initialization', () => {
    it('should initialize with default categories when localStorage is empty', () => {
      const { result } = renderHook(() => useCategories())
      
      expect(result.current.categories).toEqual(['General', 'Work', 'Personal', 'Family'])
    });

    it('should load categories from localStorage when available', () => {
      const storedCategories = JSON.stringify(['General', 'Work', 'Custom']);
      mockLocalStorage.getItem.mockReturnValue(storedCategories);
      
      const { result } = renderHook(() => useCategories());
      
      expect(result.current.categories).toEqual(['General', 'Work', 'Custom']);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('task-categories');
    });

    it('should handle invalid JSON in localStorage gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json')
      
      const { result } = renderHook(() => useCategories())
      
      expect(result.current.categories).toEqual(['General', 'Work', 'Personal', 'Family'])
    });

    it('should ensure General is always first', () => {
      const storedCategories = JSON.stringify(['Work', 'Personal', 'General']);
      mockLocalStorage.getItem.mockReturnValue(storedCategories);
      
      const { result } = renderHook(() => useCategories());
      
      expect(result.current.categories[0]).toBe('General');
    });
  });

  describe('category management', () => {
    it('should add a new category', async () => {
      const { result } = renderHook(() => useCategories());
      
      act(() => {
        result.current.addCategory('Shopping');
      });
      
      await waitForLoadingToFinish();
      
      expect(result.current.categories).toContain('Shopping');
    });

    it('should not add duplicate categories', async () => {
      const { result } = renderHook(() => useCategories());
      const initialLength = result.current.categories.length;
      
      act(() => {
        result.current.addCategory('Work'); // Already exists
      });
      
      await waitForLoadingToFinish();
      
      expect(result.current.categories).toHaveLength(initialLength);
    });

    it('should edit a category name', async () => {
      const { result } = renderHook(() => useCategories());
      
      act(() => {
        result.current.editCategory('Work', 'Office');
      });
      
      await waitForLoadingToFinish();
      
      expect(result.current.categories).toContain('Office');
      expect(result.current.categories).not.toContain('Work');
    });

    it('should not edit the General category', async () => {
      const { result } = renderHook(() => useCategories());
      
      act(() => {
        result.current.editCategory('General', 'Modified');
      });
      
      await waitForLoadingToFinish();
      
      expect(result.current.categories).toContain('General');
      expect(result.current.categories).not.toContain('Modified');
    });

    it('should remove a category', async () => {
      const { result } = renderHook(() => useCategories());
      
      act(() => {
        result.current.removeCategory('Work');
      });
      
      await waitForLoadingToFinish();
      
      expect(result.current.categories).not.toContain('Work');
    });

    it('should not remove the General category', async () => {
      const { result } = renderHook(() => useCategories());
      
      act(() => {
        result.current.removeCategory('General');
      });
      
      await waitForLoadingToFinish();
      
      expect(result.current.categories).toContain('General');
    });
  });

  describe('category permissions', () => {
    it('should allow editing non-General categories', () => {
      const { result } = renderHook(() => useCategories());
      
      expect(result.current.canEditCategory('Work')).toBe(true);
      expect(result.current.canEditCategory('Personal')).toBe(true);
    });

    it('should not allow editing General category', () => {
      const { result } = renderHook(() => useCategories());
      
      expect(result.current.canEditCategory('General')).toBe(false);
    });

    it('should allow removing non-General categories', () => {
      const { result } = renderHook(() => useCategories());
      
      expect(result.current.canRemoveCategory('Work')).toBe(true);
      expect(result.current.canRemoveCategory('Personal')).toBe(true);
    });

    it('should not allow removing General category', () => {
      const { result } = renderHook(() => useCategories());
      
      expect(result.current.canRemoveCategory('General')).toBe(false);
    });
  });



  describe('persistence', () => {
    it('should save categories to localStorage when categories change', async () => {
      const { result } = renderHook(() => useCategories());
      
      act(() => {
        result.current.addCategory('Test Category');
      });
      
      await waitForLoadingToFinish();
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'task-categories',
        expect.stringContaining('Test Category')
      );
    });

    it('should maintain General as first category when saving', async () => {
      const { result } = renderHook(() => useCategories());
      
      act(() => {
        result.current.addCategory('New Category');
      });
      
      await waitForLoadingToFinish();
      
      const savedData = mockLocalStorage.setItem.mock.calls[0][1];
      const parsedData = JSON.parse(savedData);
      expect(parsedData[0]).toBe('General');
    });
  });


});
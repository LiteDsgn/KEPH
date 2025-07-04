'use client';

import { useState, useEffect } from 'react';
import { defaultCategories } from '@/types/categories';

const CATEGORIES_STORAGE_KEY = 'task-categories';

export function useCategories() {
  const [categories, setCategories] = useState<string[]>(() => {
    if (typeof window === 'undefined') return defaultCategories;
    try {
      const storedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (storedCategories) {
        const parsed = JSON.parse(storedCategories);
        // Ensure "General" is always the first category
        if (!parsed.includes('General')) {
          const result = ['General', ...parsed];
          console.log('Added General to existing categories:', result);
          return result;
        }
        // Ensure "General" is first
        const filtered = parsed.filter((cat: string) => cat !== 'General');
        const result = ['General', ...filtered];
        console.log('Loaded categories with General first:', result);
        return result;
      }
      console.log('No stored categories, using defaults:', defaultCategories);
      return defaultCategories;
    } catch (error) {
      console.error('Error reading categories from localStorage', error);
      return defaultCategories;
    }
  });

  useEffect(() => {
    try {
      // Ensure "General" is always first when saving
      const categoriesToSave = categories.includes('General') 
        ? ['General', ...categories.filter(cat => cat !== 'General')]
        : ['General', ...categories];
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categoriesToSave));
    } catch (error) {
      console.error('Error saving categories to localStorage', error);
    }
  }, [categories]);

  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories(prev => {
        // Keep "General" first, add new category after
        const filtered = prev.filter(cat => cat !== 'General');
        return ['General', ...filtered, category];
      });
    }
  };

  const editCategory = (oldName: string, newName: string) => {
    // Prevent editing the "General" category
    if (oldName === 'General') {
      return;
    }
    if (!categories.includes(newName) && categories.includes(oldName)) {
      setCategories(prev => prev.map(cat => cat === oldName ? newName : cat));
    }
  };

  const removeCategory = (categoryName: string) => {
    // Prevent removing the "General" category
    if (categoryName === 'General') {
      return;
    }
    setCategories(prev => prev.filter(cat => cat !== categoryName));
  };

  const canEditCategory = (categoryName: string) => {
    return categoryName !== 'General';
  };

  const canRemoveCategory = (categoryName: string) => {
    return categoryName !== 'General';
  };

  return { categories, addCategory, editCategory, removeCategory, canEditCategory, canRemoveCategory };
}
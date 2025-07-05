'use client';

import { useState, useCallback, useEffect } from 'react';
import { supabase, getCurrentUserId, handleSupabaseError } from '@/lib/supabase';
import type { Database } from '@/types/database';

type SupabaseCategory = Database['public']['Tables']['categories']['Row'];

const CATEGORIES_STORAGE_KEY = 'supabase-categories-cache';

export function useSupabaseCategories() {
  const [categories, setCategories] = useState<string[]>(['General']);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);

  // Load categories from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const cached = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (cached) {
        const parsedCategories = JSON.parse(cached);
        // Ensure "General" is always first
        const filtered = parsedCategories.filter((cat: string) => cat !== 'General');
        setCategories(['General', ...filtered]);
      }
    } catch (error) {
      console.error('Error loading cached categories:', error);
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

  // Cache categories to localStorage
  const cacheCategories = useCallback((categoriesToCache: string[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categoriesToCache));
    } catch (error) {
      console.error('Error caching categories:', error);
    }
  }, []);

  // Fetch categories from Supabase
  const fetchCategories = useCallback(async () => {
    if (!isOnline) return;
    
    try {
      setSyncing(true);
      setError(null);
      
      const userId = await getCurrentUserId();
      
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('name')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (categoriesError) throw categoriesError;

      const categoryNames = categoriesData?.map(cat => cat.name) || [];
      
      // Ensure "General" is always first
      const filtered = categoryNames.filter(name => name !== 'General');
      const orderedCategories = ['General', ...filtered];
      
      setCategories(orderedCategories);
      cacheCategories(orderedCategories);
      
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      setError(error.message || 'Failed to fetch categories');
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  }, [isOnline, cacheCategories]);

  // Initial load and real-time subscription
  useEffect(() => {
    fetchCategories();

    if (!isOnline) {
      setLoading(false);
      return;
    }

    // Set up real-time subscription
    const channel = supabase
      .channel('categories-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories'
        },
        () => {
          // Refetch categories when changes occur
          fetchCategories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCategories, isOnline]);

  // Add category
  const addCategory = useCallback(async (categoryName: string) => {
    if (!categoryName.trim() || categories.includes(categoryName)) {
      return;
    }

    // Optimistic update
    const newCategories = [...categories, categoryName];
    setCategories(newCategories);
    cacheCategories(newCategories);

    if (!isOnline) return;

    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('categories')
        .insert({
          name: categoryName,
          user_id: userId,
          color: '#6366f1' // Default color
        });

      if (error) throw error;
      
    } catch (error: any) {
      console.error('Error adding category:', error);
      setError(error.message || 'Failed to add category');
      // Revert optimistic update
      setCategories(categories);
      cacheCategories(categories);
    }
  }, [categories, cacheCategories, isOnline]);

  // Edit category
  const editCategory = useCallback(async (oldName: string, newName: string) => {
    // Prevent editing the "General" category
    if (oldName === 'General' || !newName.trim() || categories.includes(newName)) {
      return;
    }

    // Optimistic update
    const updatedCategories = categories.map(cat => cat === oldName ? newName : cat);
    setCategories(updatedCategories);
    cacheCategories(updatedCategories);

    if (!isOnline) return;

    try {
      const userId = await getCurrentUserId();
      
      const { error } = await supabase
        .from('categories')
        .update({ name: newName })
        .eq('name', oldName)
        .eq('user_id', userId);

      if (error) throw error;
      
    } catch (error: any) {
      console.error('Error editing category:', error);
      setError(error.message || 'Failed to edit category');
      // Revert optimistic update
      setCategories(categories);
      cacheCategories(categories);
    }
  }, [categories, cacheCategories, isOnline]);

  // Remove category
  const removeCategory = useCallback(async (categoryName: string) => {
    // Prevent removing the "General" category
    if (categoryName === 'General') {
      return;
    }

    // Optimistic update
    const filteredCategories = categories.filter(cat => cat !== categoryName);
    setCategories(filteredCategories);
    cacheCategories(filteredCategories);

    if (!isOnline) return;

    try {
      const userId = await getCurrentUserId();
      
      // First, get the category ID to be deleted
      const { data: categoryToDelete } = await supabase
        .from('categories')
        .select('id')
        .eq('name', categoryName)
        .eq('user_id', userId)
        .single();

      if (categoryToDelete) {
        // Get the General category ID
        const { data: generalCategory } = await supabase
          .from('categories')
          .select('id')
          .eq('name', 'General')
          .eq('user_id', userId)
          .single();

        if (generalCategory) {
          // Update tasks to use General category
          await supabase
            .from('tasks')
            .update({ category_id: generalCategory.id })
            .eq('user_id', userId)
            .eq('category_id', categoryToDelete.id);
        }
      }

      // Delete the category
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('name', categoryName)
        .eq('user_id', userId);

      if (error) throw error;
      
    } catch (error: any) {
      console.error('Error removing category:', error);
      setError(error.message || 'Failed to remove category');
      // Revert optimistic update
      setCategories(categories);
      cacheCategories(categories);
    }
  }, [categories, cacheCategories, isOnline]);

  // Helper functions
  const canEditCategory = useCallback((categoryName: string) => {
    return categoryName !== 'General';
  }, []);

  const canRemoveCategory = useCallback((categoryName: string) => {
    return categoryName !== 'General';
  }, []);

  return {
    categories,
    loading,
    syncing,
    error,
    isOnline,
    addCategory,
    editCategory,
    removeCategory,
    canEditCategory,
    canRemoveCategory,
    refetch: fetchCategories
  };
}
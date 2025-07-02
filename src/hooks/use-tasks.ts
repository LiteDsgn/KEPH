'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Task, TaskStatus } from '@/types';
import { isBefore, startOfToday } from 'date-fns';

const generateInitialTasks = (): Task[] => {
  const today = startOfToday();
  const initialTasksData: Omit<Task, 'id'>[] = [
    {
      title: 'Review the quarterly report from 2 days ago',
      description: 'Focus on the Q4 growth metrics. The charts on page 5 need verification.',
      status: 'current',
      createdAt: new Date(new Date().setDate(new Date().getDate() - 2)),
      notes: 'John mentioned to double check the figures with the finance team.',
      url: 'https://example.com/reports/q4',
    },
    {
      title: 'Send follow-up email to the design team',
      description: 'Ask about the new mockups for the landing page.',
      status: 'current',
      createdAt: new Date(),
      notes: 'Waiting for their response to proceed.',
    },
    {
      title: 'Prepare presentation for the weekly sync',
      description: 'Slides should cover progress, blockers, and next steps.',
      status: 'completed',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
      {
      title: 'Onboard new marketing intern',
      description: 'Go through the onboarding checklist and introduce them to the team.',
      status: 'pending',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      url: 'https://example.com/onboarding-docs'
    },
  ];

  return initialTasksData.map(taskData => {
    const taskWithId = { ...taskData, id: crypto.randomUUID() };
    if (taskWithId.status === 'current' && isBefore(new Date(taskWithId.createdAt), today)) {
      return { ...taskWithId, status: 'pending' as TaskStatus };
    }
    return taskWithId;
  });
};


export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Generate tasks on client-side only to avoid hydration issues
    setTasks(generateInitialTasks());
  }, []);

  const addTasks = useCallback((newTasksData: Array<{ title: string; description?: string }>) => {
    const newTasks: Task[] = newTasksData.map((data) => ({
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description || '',
      status: 'current',
      createdAt: new Date(),
      notes: '',
      url: ''
    }));
    setTasks((prev) => [...newTasks, ...prev]);
  }, []);

  const addTask = useCallback((taskData: Omit<Task, 'id' | 'status' | 'createdAt'>) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      ...taskData,
      status: 'current',
      createdAt: new Date(),
    };
    setTasks((prev) => [newTask, ...prev]);
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }, []);
  
  const searchedTasks = useMemo(() => {
    if (!search) {
      return tasks;
    }
    return tasks.filter((task) =>
      (task.title.toLowerCase().includes(search.toLowerCase())) ||
      (task.description?.toLowerCase().includes(search.toLowerCase())) ||
      (task.notes?.toLowerCase().includes(search.toLowerCase()))
    );
  }, [tasks, search]);


  return {
    tasks: searchedTasks,
    addTasks,
    addTask,
    updateTask,
    deleteTask,
    search,
    setSearch,
  };
}

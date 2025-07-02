'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Task, TaskStatus } from '@/types';
import { isBefore, startOfToday } from 'date-fns';

const generateInitialTasks = (): Task[] => {
  const today = startOfToday();
  const initialTasksData: Task[] = [
    {
      id: '1',
      content: 'Review the quarterly report from 2 days ago',
      status: 'current',
      createdAt: new Date(new Date().setDate(new Date().getDate() - 2)),
      notes: 'Focus on the Q4 growth metrics. The charts on page 5 need verification.',
      url: 'https://example.com/reports/q4',
    },
    {
      id: '2',
      content: 'Send follow-up email to the design team',
      status: 'current',
      createdAt: new Date(),
      notes: 'Ask about the new mockups for the landing page.',
    },
    {
      id: '3',
      content: 'Prepare presentation for the weekly sync',
      status: 'completed',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
      {
      id: '4',
      content: 'Onboard new marketing intern',
      status: 'pending',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      url: 'https://example.com/onboarding-docs'
    },
  ];

  return initialTasksData.map(task => {
    if (task.status === 'current' && isBefore(new Date(task.createdAt), today)) {
      return { ...task, status: 'pending' as TaskStatus };
    }
    return task;
  });
};


export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setTasks(generateInitialTasks());
  }, []);

  const addTasks = useCallback((newTasksContent: string[]) => {
    const newTasks: Task[] = newTasksContent.map((content) => ({
      id: crypto.randomUUID(),
      content,
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
    return tasks.filter((task) =>
      task.content.toLowerCase().includes(search.toLowerCase())
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

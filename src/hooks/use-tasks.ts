'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Task, TaskStatus } from '@/types';

const initialTasks: Task[] = [
  {
    id: '1',
    content: 'Review the quarterly report',
    status: 'current',
    createdAt: new Date(),
  },
  {
    id: '2',
    content: 'Send follow-up email to the design team',
    status: 'current',
    createdAt: new Date(),
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
  },
];

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [search, setSearch] = useState('');

  const addTasks = useCallback((newTasksContent: string[]) => {
    const newTasks: Task[] = newTasksContent.map((content) => ({
      id: crypto.randomUUID(),
      content,
      status: 'current',
      createdAt: new Date(),
    }));
    setTasks((prev) => [...newTasks, ...prev]);
  }, []);

  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, status } : task))
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
    updateTaskStatus,
    deleteTask,
    search,
    setSearch,
  };
}

'use client';

import { TaskInputArea } from '@/components/taskwise/task-input-area';
import { TaskList } from '@/components/taskwise/task-list';
import { useTasks } from '@/hooks/use-tasks';
import { BrainCircuit } from 'lucide-react';

export default function Home() {
  const { tasks, addTasks, updateTaskStatus, deleteTask, search, setSearch } = useTasks();

  return (
    <div className="min-h-screen bg-background font-body">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex items-center gap-3 mb-8">
          <BrainCircuit className="w-10 h-10 text-primary" />
          <div>
            <h1 className="text-3xl font-bold font-headline text-primary">TaskWise AI</h1>
            <p className="text-muted-foreground">Your intelligent to-do list assistant.</p>
          </div>
        </header>
        <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <TaskInputArea onTasksCreated={addTasks} />
          </div>
          <div className="lg:col-span-3">
            <TaskList
              tasks={tasks}
              onUpdateTask={updateTaskStatus}
              onDeleteTask={deleteTask}
              search={search}
              setSearch={setSearch}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

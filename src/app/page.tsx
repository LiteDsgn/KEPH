'use client';

import { TaskInputArea } from '@/components/taskwise/task-input-area';
import { TaskList } from '@/components/taskwise/task-list';
import { useTasks } from '@/hooks/use-tasks';
import { BrainCircuit, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Notification } from '@/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { NotificationPanel } from '@/components/taskwise/notification-panel';

export default function Home() {
  const {
    tasks,
    addTasks,
    addTask,
    updateTask,
    deleteTask,
    search,
    setSearch,
    overdueTasks,
    updateMultipleTasks,
    clearOverdueTasks,
  } = useTasks();

  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    setNotifications(prevNotifications => {
        const overdueNotification = prevNotifications.find(n => n.type === 'overdue-tasks');

        if (overdueTasks.length > 0) {
            const newNotificationData: Notification = {
                id: 'overdue-tasks',
                type: 'overdue-tasks',
                title: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}`,
                description: 'What would you like to do with them?',
                createdAt: overdueNotification?.createdAt || new Date(),
                read: false,
                data: overdueTasks,
            };

            if (overdueNotification) {
                // Update existing
                return prevNotifications.map(n => n.id === 'overdue-tasks' ? newNotificationData : n);
            } else {
                // Add new
                return [newNotificationData, ...prevNotifications];
            }
        } else {
            // Remove if no overdue tasks
            if (overdueNotification) {
                return prevNotifications.filter(n => n.id !== 'overdue-tasks');
            }
        }
        return prevNotifications;
    });
  }, [overdueTasks]);


  const handleMoveOverdueToToday = (taskIds: string[]) => {
    updateMultipleTasks(taskIds, { dueDate: new Date() });
    clearOverdueTasks();
  };

  const handleMoveOverdueToPending = (taskIds: string[]) => {
    updateMultipleTasks(taskIds, { status: 'pending' });
    clearOverdueTasks();
  };

  const dismissNotification = (notificationId: string) => {
    if (notificationId === 'overdue-tasks') {
        // This will trigger the useEffect to remove the notification
        clearOverdueTasks();
    } else {
       setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }
  };

  return (
    <Sheet>
      <div className="min-h-screen bg-background font-body">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <BrainCircuit className="w-10 h-10 text-primary" />
              <div>
                <h1 className="text-3xl font-bold font-headline text-primary">TaskWise AI</h1>
                <p className="text-muted-foreground">Your intelligent to-do list assistant.</p>
              </div>
            </div>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                            {notifications.length}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
          </header>
          <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <TaskInputArea onTasksCreated={addTasks} onTaskCreated={addTask} />
            </div>
            <div className="lg:col-span-3">
              <TaskList
                tasks={tasks}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                search={search}
                setSearch={setSearch}
              />
            </div>
          </main>
        </div>
        <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
            <SheetHeader className="p-6 pb-2">
                <SheetTitle>Notifications</SheetTitle>
            </SheetHeader>
            <div className="p-6 pt-4 overflow-y-auto flex-1">
                <NotificationPanel
                    notifications={notifications}
                    onDismissNotification={dismissNotification}
                    onMoveOverdueToPending={handleMoveOverdueToPending}
                    onMoveOverdueToToday={handleMoveOverdueToToday}
                />
            </div>
        </SheetContent>
      </div>
    </Sheet>
  );
}

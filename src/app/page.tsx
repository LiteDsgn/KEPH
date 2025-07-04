'use client';

import { useState, useEffect, useRef } from 'react';
import { useTasks } from '@/hooks/use-tasks';
import { TaskList } from '@/components/keph/task-list';
import { TaskInputArea } from '@/components/keph/task-input-area';
import { NotificationPanel } from '@/components/keph/notification-panel';
import { TextToTasksForm } from '@/components/keph/text-to-tasks-form';
import { TranscriptToTasksForm } from '@/components/keph/transcript-to-tasks-form';
import { ManualTaskForm } from '@/components/keph/manual-task-form';
import { KeyboardShortcutsDialog } from '@/components/keph/keyboard-shortcuts-dialog';
import { BrainCircuit, Bell, FileText, ClipboardList, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import type { Task, Notification } from '@/types';

export default function Home() {
  const {
    tasks,
    addTasks,
    addTask,
    updateTask,
    deleteTask,
    duplicateTask,
    search,
    setSearch,
    overdueTasks,
    updateMultipleTasks,
    clearOverdueTasks,
  } = useTasks();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeModal, setActiveModal] = useState<'manual' | 'text' | 'transcript' | null>(null);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
                const existingTaskIds = new Set(overdueNotification.data.map((t: Task) => t.id));
                const newTasksToAdd = overdueTasks.filter(t => !existingTaskIds.has(t.id));
                if (newTasksToAdd.length > 0) {
                    const combinedData = [...overdueNotification.data, ...newTasksToAdd];
                    return prevNotifications.map(n => n.id === 'overdue-tasks' ? {
                        ...newNotificationData,
                        data: combinedData,
                        title: `You have ${combinedData.length} overdue task${combinedData.length > 1 ? 's' : ''}`,
                     } : n);
                }
                return prevNotifications;
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


  const updateNotificationsAfterAction = (actedTaskIds: string[]) => {
      setNotifications(prev => {
        const updated = prev.map(n => {
            if (n.id === 'overdue-tasks') {
                const remainingData = n.data.filter((t: Task) => !actedTaskIds.includes(t.id));
                if (remainingData.length > 0) {
                    return { 
                        ...n, 
                        data: remainingData, 
                        title: `You have ${remainingData.length} overdue task${remainingData.length > 1 ? 's' : ''}` 
                    };
                }
                return null;
            }
            return n;
        }).filter(Boolean);

        if (!updated.some(n => n?.id === 'overdue-tasks')) {
            clearOverdueTasks();
        }

        return updated as Notification[];
      });
  };

  const handleMoveOverdueToToday = (taskIds: string[]) => {
    updateMultipleTasks(taskIds, { dueDate: new Date(), status: 'current' });
    updateNotificationsAfterAction(taskIds);
  };

  const handleKeepInPending = (taskIds: string[]) => {
    // Tasks are already pending, so we just remove them from the notification
    updateNotificationsAfterAction(taskIds);
  };

  // Keyboard shortcuts configuration
  useKeyboardShortcuts({
    'Escape': () => setActiveModal(null),
    'KeyN': () => setActiveModal(activeModal === 'manual' ? null : 'manual'),
    'KeyT': () => setActiveModal(activeModal === 'text' ? null : 'text'),
    'KeyR': () => setActiveModal(activeModal === 'transcript' ? null : 'transcript'),
    'Slash': () => {
      const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    },
    'KeyH': () => setShowKeyboardShortcuts(true),
  });
  
  const dismissNotification = (notificationId: string) => {
    const notificationToDismiss = notifications.find(n => n.id === notificationId);
    if (notificationToDismiss && notificationToDismiss.type === 'overdue-tasks') {
        clearOverdueTasks();
    } else {
       setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }
  };

  const handleManualTaskCreated = (taskData: Omit<Task, 'id' | 'status' | 'createdAt'>) => {
    addTask(taskData);
    setActiveModal(null);
  };

  const handleTasksCreated = (tasks: Array<{ title: string; subtasks?: string[] }>) => {
    addTasks(tasks);
    setActiveModal(null);
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveModal(null);
      }
    };

    if (activeModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeModal]);


  return (
    <Sheet>
      <div className="min-h-screen bg-background font-body">
        {/* Modern Avant-Garde Header with Floating Navigation */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-sm" />
                  <BrainCircuit className="relative w-12 h-12 text-primary p-2 bg-card rounded-2xl shadow-lg" />
                </div>
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold font-headline text-primary tracking-tight">KEPH</h1>
                  <p className="text-sm text-muted-foreground font-medium">Intelligent Productivity</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-muted-foreground">AI Ready</span>
                </div>
                
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative hover:bg-accent/50 rounded-full transition-all duration-200">
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground font-bold animate-bounce">
                        {notifications.length}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
              </div>
            </div>
          </div>
        </header>

        {/* Task-Centric Layout */}
        <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 pb-24 sm:pb-32">
          {/* Full-Width Task List */}
          <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl min-h-[calc(100vh-160px)] sm:min-h-[calc(100vh-200px)]">
            <TaskList
                tasks={tasks}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                onDuplicateTask={duplicateTask}
                search={search}
                setSearch={setSearch}
              />
          </div>
        </main>
        
        {/* Enhanced Notification Panel */}
        <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col border-0 bg-gradient-to-br from-background/95 to-muted/50 backdrop-blur-xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="relative flex flex-col h-full">
            <div className="p-6 pb-4">
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />
              <h2 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Notifications
              </h2>
            </div>
            <div className="p-6 pt-4 overflow-y-auto flex-1">
              <NotificationPanel
                notifications={notifications}
                onDismissNotification={dismissNotification}
                onKeepInPending={handleKeepInPending}
                onMoveOverdueToToday={handleMoveOverdueToToday}
              />
            </div>
          </div>
        </SheetContent>
        
        {/* Progressive Gradient Overlay */}
        {activeModal && (
          <div className="fixed inset-0 bg-gradient-to-t from-black/100 via-black/50 to-transparent z-40 pointer-events-none" />
        )}
        
        {/* Keyboard Shortcuts Dialog */}
        <KeyboardShortcutsDialog 
          open={showKeyboardShortcuts} 
          onOpenChange={setShowKeyboardShortcuts} 
        />
        
        {/* Contextual Bottom Menu Bar */}
        <div ref={dropdownRef} className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          {/* Dropdown Popup - Positioned absolutely above menu */}
          {activeModal && (
            <div className="absolute bottom-full mb-4 left-1/2 transform -translate-x-1/2 w-[48rem] max-w-[90vw]">
              <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-2xl" />
                <div className="relative">
                  {activeModal === 'manual' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Create New Task
                      </h3>
                      <ManualTaskForm
                        onTaskCreated={handleManualTaskCreated}
                        onCancel={() => setActiveModal(null)}
                      />
                    </div>
                  )}
                  
                  {activeModal === 'text' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Text to Tasks
                      </h3>
                      <TextToTasksForm onTasksCreated={handleTasksCreated} />
                    </div>
                  )}
                  
                  {activeModal === 'transcript' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Transcript to Tasks
                      </h3>
                      <TranscriptToTasksForm onTasksCreated={handleTasksCreated} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Menu Bar - Fixed width, independent of dropdown */}
          <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl p-2 shadow-2xl">
            <div className="flex items-center gap-2">
              <Button
                variant={activeModal === 'manual' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveModal(activeModal === 'manual' ? null : 'manual')}
                className="rounded-xl flex items-center gap-2 px-4 py-2 transition-all duration-200"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline font-medium">Manual</span>
              </Button>
              
              <Button
                variant={activeModal === 'text' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveModal(activeModal === 'text' ? null : 'text')}
                className="rounded-xl flex items-center gap-2 px-4 py-2 transition-all duration-200"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline font-medium">Text to Task</span>
              </Button>
              
              <Button
                variant={activeModal === 'transcript' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveModal(activeModal === 'transcript' ? null : 'transcript')}
                className="rounded-xl flex items-center gap-2 px-4 py-2 transition-all duration-200"
              >
                <ClipboardList className="w-4 h-4" />
                <span className="hidden sm:inline font-medium">Transcript</span>
              </Button>
            </div>
          </div>
        </div>


      </div>
    </Sheet>
  );
}

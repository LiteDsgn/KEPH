'use client';

import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseTasks } from '@/hooks/use-supabase-tasks';
import { useSupabaseCategories } from '@/hooks/use-supabase-categories';
import { useAuth } from '@/hooks/use-auth';
import { useTimezone } from '@/hooks/use-timezone';
import { toast } from '@/hooks/use-toast';
import { createTimezoneTaskService } from '@/lib/services/timezone-task-service';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User, Settings } from 'lucide-react';
import { TaskList } from '@/components/keph/task-list';
import { TaskInputArea } from '@/components/keph/task-input-area';
import { NotificationPanel } from '@/components/keph/notification-panel';

// Lazy load heavy components to improve initial load performance
const TextToTasksForm = lazy(() => import('@/components/keph/text-to-tasks-form').then(m => ({ default: m.TextToTasksForm })));
const TranscriptToTasksForm = lazy(() => import('@/components/keph/transcript-to-tasks-form').then(m => ({ default: m.TranscriptToTasksForm })));
const ManualTaskForm = lazy(() => import('@/components/keph/manual-task-form').then(m => ({ default: m.ManualTaskForm })));
const CategoryManager = lazy(() => import('@/components/keph/category-manager').then(m => ({ default: m.CategoryManager })));
const KeyboardShortcutsDialog = lazy(() => import('@/components/keph/keyboard-shortcuts-dialog').then(m => ({ default: m.KeyboardShortcutsDialog })));
const CommandPalette = lazy(() => import('@/components/keph/command-palette').then(m => ({ default: m.CommandPalette })));
import { FolderKanban, BarChart3 } from 'lucide-react';
import { BrainCircuit, Bell, FileText, ClipboardList, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import type { Task, Notification } from '@/types';

// Custom hook for responsive sheet side
function useResponsiveSheetSide() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return isMobile ? 'bottom' : 'right';
}

export default function DashboardPage() {
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
  } = useSupabaseTasks();
  const { categories, addCategory, editCategory, removeCategory, canEditCategory, canRemoveCategory } = useSupabaseCategories();
  const { user, signOut } = useAuth();
  const timezoneHook = useTimezone();
  const router = useRouter();
  const sheetSide = useResponsiveSheetSide();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Sign Out Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeModal, setActiveModal] = useState<'manual' | 'text' | 'transcript' | null>(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Helper functions for command palette
  const handleOpenNotifications = () => {
    const sheetTrigger = document.querySelector('[data-sheet-trigger]') as HTMLButtonElement;
    if (sheetTrigger) {
      sheetTrigger.click();
    }
  };

  const handleFocusSearch = () => {
    const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  };

  // Keyboard shortcuts configuration
  useKeyboardShortcuts({
    'Escape': () => setActiveModal(null),
    'KeyN': () => setActiveModal(activeModal === 'manual' ? null : 'manual'),
    'KeyT': () => setActiveModal(activeModal === 'text' ? null : 'text'),
    'KeyR': () => setActiveModal(activeModal === 'transcript' ? null : 'transcript'),
    'KeyK': () => setShowCommandPalette(true),
    'Slash': () => handleFocusSearch(),
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
    addTask({
      ...taskData,
      status: 'current' as const,
      createdAt: new Date()
    });
    setActiveModal(null);
  };

  const handleTasksCreated = (tasks: Array<{ title: string; subtasks?: string[], category?: string }>) => {
    addTasks(tasks);
    setActiveModal(null);
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check if click is outside the dropdown container
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        // Check if the click is on a Select dropdown or its content
        const selectDropdown = document.querySelector('[data-radix-popper-content-wrapper]');
        const selectTrigger = (target as Element)?.closest('[data-radix-select-trigger]');
        const selectContent = (target as Element)?.closest('[data-radix-select-content]');
        const selectItem = (target as Element)?.closest('[data-radix-select-item]');
        
        // Don't close if clicking on Select components
        if (selectDropdown?.contains(target) || selectTrigger || selectContent || selectItem) {
          return;
        }
        
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
        {/* Main Navigation Header */}
        <header className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 pointer-events-none">
        <div 
          className={`
            container mx-auto px-4 sm:px-6 py-2 transition-all duration-300 pointer-events-auto mt-0 max-w-full
            ${isScrolled 
              ? 'bg-[#0D0D0D]/40 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]' 
              : 'bg-transparent border-b border-transparent'
            }
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative group cursor-pointer" onClick={() => router.push('/')}>
                <div className="absolute inset-0 bg-primary/20 rounded-xl blur-sm transition-all duration-300 group-hover:blur-md" />
                <div className={`
                  relative bg-primary/10 rounded-xl flex items-center justify-center ring-1 ring-primary/20 
                  group-hover:scale-110 transition-all duration-300 shadow-lg shadow-primary/5
                  ${isScrolled ? 'w-8 h-8' : 'w-10 h-10'}
                `}>
                  <BrainCircuit className={`${isScrolled ? 'w-5 h-5' : 'w-6 h-6'} text-primary`} />
                </div>
              </div>
              
              <div className="flex flex-col opacity-100">
                <h1 className={`
                  font-bold font-headline bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 tracking-tight transition-all duration-300
                  ${isScrolled ? 'text-xl' : 'text-2xl'}
                `}>
                  KEPH
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowCategoryManager(true)} 
                className={`rounded-full transition-all duration-200 hover:bg-white/5 hover:text-primary ${isScrolled ? 'h-8 w-8' : 'h-10 w-10'}`}
              >
                <FolderKanban className={`${isScrolled ? 'h-4 w-4' : 'h-5 w-5'}`} />
                <span className="sr-only">Manage Categories</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.push('/dashboard/reports')} 
                className={`rounded-full transition-all duration-200 hover:bg-white/5 hover:text-primary ${isScrolled ? 'h-8 w-8' : 'h-10 w-10'}`}
              >
                <BarChart3 className={`${isScrolled ? 'h-4 w-4' : 'h-5 w-5'}`} />
                <span className="sr-only">View Reports</span>
              </Button>
              
              <div className="w-px h-4 bg-white/10 mx-1 hidden sm:block" />
              
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`relative hover:bg-white/5 hover:text-primary rounded-full transition-all duration-200 ${isScrolled ? 'h-8 w-8' : 'h-10 w-10'}`} 
                  data-sheet-trigger
                >
                  <Bell className={`${isScrolled ? 'h-4 w-4' : 'h-5 w-5'}`} />
                  {notifications.length > 0 && (
                    <span className="absolute flex items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold -top-1 -right-1 h-4 w-4">
                      {notifications.length}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`relative hover:bg-white/5 rounded-full transition-all duration-200 ${isScrolled ? 'h-8 w-8' : 'h-10 w-10'}`}
                  >
                    <Avatar className={`ring-1 ring-white/10 transition-all duration-300 group-hover:ring-primary/50 ${isScrolled ? 'h-6 w-6' : 'h-8 w-8'}`}>
                      <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || 'User'} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold text-xs">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-[#0D0D0D]/95 backdrop-blur-xl border-white/[0.08] text-white">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.user_metadata?.full_name || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/[0.08]" />
                    <DropdownMenuItem className="cursor-pointer hover:bg-white/5 transition-colors" onClick={() => { router.push('/dashboard/profile'); setDropdownOpen(false); }}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer hover:bg-white/5 transition-colors" onClick={() => { router.push('/dashboard/settings'); setDropdownOpen(false); }}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/[0.08]" />
                    <DropdownMenuItem 
                      className="cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10 transition-colors"
                      onClick={() => { signOut(); setDropdownOpen(false); }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Task-Centric Layout */}
        <main className="container mx-auto px-4 sm:px-6 py-20 sm:py-24 pb-24 sm:pb-32">
          {/* Full-Width Task List */}
          <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl min-h-[calc(100vh-160px)] sm:min-h-[calc(100vh-200px)]">
            <TaskList
                categories={categories}
                onAddCategory={addCategory}
                tasks={tasks.filter(task => selectedCategory === 'all' || task.category === selectedCategory)}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                onDuplicateTask={duplicateTask}
                search={search}
                setSearch={setSearch}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
          </div>
        </main>
        
        {/* Enhanced Notification Panel - Bottom drawer on mobile, side panel on desktop */}
        <SheetContent className={`w-full sm:max-w-lg p-0 flex flex-col border-0 bg-gradient-to-br from-background/95 to-muted/50 backdrop-blur-xl shadow-2xl ${sheetSide === 'bottom' ? 'h-[70vh] rounded-t-3xl' : 'h-full rounded-none'}`} side={sheetSide}>
          <div className={`absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 ${sheetSide === 'bottom' ? 'rounded-t-3xl' : 'rounded-none'}`} />
          <div className="relative flex flex-col h-full">
            <div className={`${sheetSide === 'bottom' ? 'px-4 py-6' : 'p-6'} pb-4`}>
              {sheetSide === 'bottom' && <div className="w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-4" />}
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />
              <h2 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Notifications
              </h2>
            </div>
            <div className={`${sheetSide === 'bottom' ? 'px-4 py-4' : 'p-6'} pt-4 overflow-y-auto flex-1`}>
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
        <Suspense fallback={null}>
          <KeyboardShortcutsDialog 
            open={showKeyboardShortcuts} 
            onOpenChange={setShowKeyboardShortcuts} 
          />
        </Suspense>

        {/* Command Palette */}
        <Suspense fallback={null}>
          <CommandPalette
            open={showCommandPalette}
            onOpenChange={setShowCommandPalette}
            onCreateManualTask={() => setActiveModal('manual')}
            onCreateTextTask={() => setActiveModal('text')}
            onCreateTranscriptTask={() => setActiveModal('transcript')}
            onOpenCategoryManager={() => setShowCategoryManager(true)}
            onOpenNotifications={handleOpenNotifications}
            onOpenKeyboardShortcuts={() => setShowKeyboardShortcuts(true)}
            onFocusSearch={handleFocusSearch}
            tasks={tasks}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            onDuplicateTask={duplicateTask}
            selectedCategory={selectedCategory}
            onSetSelectedCategory={setSelectedCategory}
            categories={categories}
          />
        </Suspense>

        <Sheet open={showCategoryManager} onOpenChange={setShowCategoryManager}>
          <SheetContent className={`w-full sm:max-w-lg p-0 flex flex-col border-0 bg-gradient-to-br from-background/95 to-muted/50 backdrop-blur-xl shadow-2xl ${sheetSide === 'bottom' ? 'h-[80vh] rounded-t-3xl' : 'h-full rounded-none'}`} side={sheetSide}>
            <div className={`absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 ${sheetSide === 'bottom' ? 'rounded-t-3xl' : 'rounded-none'}`} />
            <div className="relative flex flex-col h-full">
              <div className={`${sheetSide === 'bottom' ? 'px-4 py-6' : 'p-6'} pb-4`}>
                {sheetSide === 'bottom' && <div className="w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-4" />}
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />
                <h2 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Manage Categories
                </h2>
              </div>
              <div className={`${sheetSide === 'bottom' ? 'px-4 py-4' : 'p-6'} pt-4 overflow-y-auto flex-1`}>
                <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>}>
                  <CategoryManager 
                    categories={categories} 
                    onAddCategory={addCategory}
                    onEditCategory={(oldName, newName) => {
                       // Update category name in tasks
                       const tasksToUpdate = tasks.filter(task => task.category === oldName);
                       tasksToUpdate.forEach(task => {
                         updateTask(task.id, { category: newName });
                       });
                       
                       // Update categories list
                       editCategory(oldName, newName);
                     }}
                    onArchiveCategory={(categoryName) => {
                       // Remove category from categories list
                       removeCategory(categoryName);
                       
                       // Update tasks to remove the category (set to empty string)
                       const tasksToUpdate = tasks.filter(task => task.category === categoryName);
                       tasksToUpdate.forEach(task => {
                         updateTask(task.id, { category: '' });
                       });
                     }}
                    canEditCategory={canEditCategory}
                  canRemoveCategory={canRemoveCategory}
                  tasks={tasks}
                />
                </Suspense>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Contextual Bottom Menu Bar */}
        <div ref={dropdownRef} className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          {/* Dropdown Popup - Positioned absolutely above menu */}
          {activeModal && (
            <div className="absolute bottom-full mb-4 left-1/2 transform -translate-x-1/2 w-[48rem] max-w-[90vw]">
              <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-2xl" />
                <div className="relative">
                  {activeModal === 'manual' && (
                    <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>}>
                      <ManualTaskForm
                        onTaskCreated={handleManualTaskCreated}
                        onCancel={() => setActiveModal(null)}
                        categories={categories}
                        onAddCategory={addCategory}
                      />
                    </Suspense>
                  )}
                  
                  {activeModal === 'text' && (
                    <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>}>
                      <div>
                        <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                          Text to Tasks
                        </h3>
                        <TextToTasksForm onTasksCreated={handleTasksCreated} categories={categories} />
                      </div>
                    </Suspense>
                  )}
                  
                  {activeModal === 'transcript' && (
                    <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>}>
                      <div>
                        <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                          Transcript to Tasks
                        </h3>
                        <TranscriptToTasksForm onTasksCreated={handleTasksCreated} categories={categories} />
                      </div>
                    </Suspense>
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
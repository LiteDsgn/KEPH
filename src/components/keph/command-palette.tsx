'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
} from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  PlusCircle,
  FileText,
  ClipboardList,
  FolderKanban,
  Bell,
  Keyboard,
  Settings,
  Archive,
  CheckCircle2,
  Circle,
  Trash2,
  Copy,
  Calendar,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import type { Task } from '@/types';

interface Command {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  category: 'actions' | 'navigation' | 'tasks' | 'settings';
  keywords?: string[];
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateManualTask: () => void;
  onCreateTextTask: () => void;
  onCreateTranscriptTask: () => void;
  onOpenCategoryManager: () => void;
  onOpenNotifications: () => void;
  onOpenKeyboardShortcuts: () => void;
  onFocusSearch: () => void;
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onDuplicateTask: (id: string) => void;
  selectedCategory: string;
  onSetSelectedCategory: (category: string) => void;
  categories: string[];
}

export function CommandPalette({
  open,
  onOpenChange,
  onCreateManualTask,
  onCreateTextTask,
  onCreateTranscriptTask,
  onOpenCategoryManager,
  onOpenNotifications,
  onOpenKeyboardShortcuts,
  onFocusSearch,
  tasks,
  onUpdateTask,
  onDeleteTask,
  onDuplicateTask,
  selectedCategory,
  onSetSelectedCategory,
  categories,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  // Generate commands
  const commands = useMemo((): Command[] => {
    const baseCommands: Command[] = [
      // Actions
      {
        id: 'create-manual-task',
        title: 'Create New Task',
        description: 'Create a new task manually',
        icon: <PlusCircle className="w-4 h-4" />,
        action: () => {
          onCreateManualTask();
          onOpenChange(false);
        },
        category: 'actions',
        keywords: ['new', 'add', 'create', 'task', 'manual'],
      },
      {
        id: 'create-text-task',
        title: 'Text to Tasks',
        description: 'Create tasks from text using AI',
        icon: <FileText className="w-4 h-4" />,
        action: () => {
          onCreateTextTask();
          onOpenChange(false);
        },
        category: 'actions',
        keywords: ['text', 'ai', 'generate', 'create', 'tasks'],
      },
      {
        id: 'create-transcript-task',
        title: 'Transcript to Tasks',
        description: 'Create tasks from transcript using AI',
        icon: <ClipboardList className="w-4 h-4" />,
        action: () => {
          onCreateTranscriptTask();
          onOpenChange(false);
        },
        category: 'actions',
        keywords: ['transcript', 'ai', 'generate', 'create', 'tasks'],
      },
      // Navigation
      {
        id: 'open-categories',
        title: 'Manage Categories',
        description: 'Open category management panel',
        icon: <FolderKanban className="w-4 h-4" />,
        action: () => {
          onOpenCategoryManager();
          onOpenChange(false);
        },
        category: 'navigation',
        keywords: ['categories', 'manage', 'organize', 'folders'],
      },
      {
        id: 'open-notifications',
        title: 'Open Notifications',
        description: 'View notifications and alerts',
        icon: <Bell className="w-4 h-4" />,
        action: () => {
          onOpenNotifications();
          onOpenChange(false);
        },
        category: 'navigation',
        keywords: ['notifications', 'alerts', 'overdue'],
      },
      {
        id: 'focus-search',
        title: 'Focus Search',
        description: 'Focus on the search input',
        icon: <Search className="w-4 h-4" />,
        action: () => {
          onFocusSearch();
          onOpenChange(false);
        },
        category: 'navigation',
        keywords: ['search', 'find', 'filter'],
      },
      // Settings
      {
        id: 'keyboard-shortcuts',
        title: 'Keyboard Shortcuts',
        description: 'View all keyboard shortcuts',
        icon: <Keyboard className="w-4 h-4" />,
        action: () => {
          onOpenKeyboardShortcuts();
          onOpenChange(false);
        },
        category: 'settings',
        keywords: ['shortcuts', 'hotkeys', 'keyboard', 'help'],
      },
    ];

    // Add category filter commands
    const categoryCommands: Command[] = [
      {
        id: 'filter-all',
        title: 'Show All Tasks',
        description: 'View tasks from all categories',
        icon: <Filter className="w-4 h-4" />,
        action: () => {
          onSetSelectedCategory('all');
          onOpenChange(false);
        },
        category: 'navigation',
        keywords: ['all', 'filter', 'category', 'view'],
      },
      ...categories.map(category => ({
        id: `filter-${category}`,
        title: `Show ${category} Tasks`,
        description: `Filter tasks by ${category} category`,
        icon: <FolderKanban className="w-4 h-4" />,
        action: () => {
          onSetSelectedCategory(category);
          onOpenChange(false);
        },
        category: 'navigation' as const,
        keywords: [category, 'filter', 'category', 'view'],
      })),
    ];

    // Add task-specific commands for current tasks
    const taskCommands: Command[] = tasks
      .filter(task => task.status === 'current')
      .slice(0, 10) // Limit to first 10 tasks to avoid overwhelming the palette
      .map(task => [
        {
          id: `complete-${task.id}`,
          title: `Complete: ${task.title}`,
          description: 'Mark this task as completed',
          icon: <CheckCircle2 className="w-4 h-4" />,
          action: () => {
            onUpdateTask(task.id, { status: 'completed' });
            onOpenChange(false);
          },
          category: 'tasks' as const,
          keywords: ['complete', 'done', 'finish', task.title.toLowerCase()],
        },
        {
          id: `duplicate-${task.id}`,
          title: `Duplicate: ${task.title}`,
          description: 'Create a copy of this task',
          icon: <Copy className="w-4 h-4" />,
          action: () => {
            onDuplicateTask(task.id);
            onOpenChange(false);
          },
          category: 'tasks' as const,
          keywords: ['duplicate', 'copy', 'clone', task.title.toLowerCase()],
        },
        {
          id: `delete-${task.id}`,
          title: `Delete: ${task.title}`,
          description: 'Delete this task permanently',
          icon: <Trash2 className="w-4 h-4" />,
          action: () => {
            onDeleteTask(task.id);
            onOpenChange(false);
          },
          category: 'tasks' as const,
          keywords: ['delete', 'remove', 'trash', task.title.toLowerCase()],
        },
      ])
      .flat();

    return [...baseCommands, ...categoryCommands, ...taskCommands];
  }, [tasks, categories, onCreateManualTask, onCreateTextTask, onCreateTranscriptTask, onOpenCategoryManager, onOpenNotifications, onOpenKeyboardShortcuts, onFocusSearch, onUpdateTask, onDeleteTask, onDuplicateTask, onSetSelectedCategory, onOpenChange]);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;

    const lowerQuery = query.toLowerCase();
    return commands.filter(command => {
      const searchText = [
        command.title,
        command.description || '',
        ...(command.keywords || []),
      ].join(' ').toLowerCase();
      
      return searchText.includes(lowerQuery);
    });
  }, [commands, query]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    filteredCommands.forEach(command => {
      if (!groups[command.category]) {
        groups[command.category] = [];
      }
      groups[command.category].push(command);
    });
    return groups;
  }, [filteredCommands]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onOpenChange(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, filteredCommands, selectedIndex, onOpenChange]);

  // Reset selected index when filtered commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands]);

  const categoryLabels = {
    actions: 'Actions',
    navigation: 'Navigation',
    tasks: 'Tasks',
    settings: 'Settings',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content className="fixed bottom-32 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 border-0 bg-gradient-to-br from-background/95 to-muted/50 backdrop-blur-xl shadow-2xl data-[state=open]:animate-command-palette-enter data-[state=closed]:animate-command-palette-exit sm:rounded-lg flex flex-col-reverse">
          <VisuallyHidden>
            <DialogTitle>Command Palette</DialogTitle>
          </VisuallyHidden>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-lg" />
          <div className="relative flex flex-col-reverse">
          {/* Search Input - Now at bottom */}
          <div className="flex items-center border-t border-border/30 px-4 py-3">
            <Search className="w-4 h-4 text-muted-foreground mr-3" />
            <Input
              placeholder="Type a command or search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
              autoFocus
            />
            <div className="flex items-center gap-1 text-xs text-muted-foreground ml-3">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↑↓</kbd>
              <span>navigate</span>
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs ml-2">↵</kbd>
              <span>select</span>
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs ml-2">Esc</kbd>
              <span>close</span>
            </div>
          </div>

          {/* Commands List - Now at top, expanding upward */}
          <ScrollArea className="max-h-96 overflow-y-auto">
            <div className="p-2 space-y-1">
              {Object.keys(groupedCommands).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No commands found</p>
                  <p className="text-xs mt-1">Try a different search term</p>
                </div>
              ) : (
                Object.entries(groupedCommands).map(([category, commands]) => {
                  let commandIndex = 0;
                  // Calculate the starting index for this category
                  for (const [cat, cmds] of Object.entries(groupedCommands)) {
                    if (cat === category) break;
                    commandIndex += cmds.length;
                  }

                  return (
                    <div key={category} className="mb-4 last:mb-0">
                      <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {categoryLabels[category as keyof typeof categoryLabels]}
                      </div>
                      <div>
                        {commands.map((command, index) => {
                          const globalIndex = commandIndex + index;
                          return (
                            <Button
                              key={command.id}
                              variant="ghost"
                              className={cn(
                                "w-full justify-start h-auto p-3 text-left transition-colors",
                                globalIndex === selectedIndex && "bg-accent text-accent-foreground"
                              )}
                              onClick={command.action}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                            >
                              <div className="flex items-center gap-3 w-full">
                                <div className="flex-shrink-0">
                                  {command.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm truncate">
                                    {command.title}
                                  </div>
                                  {command.description && (
                                    <div className="text-xs text-muted-foreground truncate mt-0.5">
                                      {command.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
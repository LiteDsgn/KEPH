'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Keyboard, X } from 'lucide-react';
import { formatShortcut } from '@/hooks/use-keyboard-shortcuts';

type ShortcutGroup = {
  title: string;
  shortcuts: Array<{
    key: string;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
    description: string;
  }>;
};

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'General',
    shortcuts: [
      { key: 'H', description: 'Show keyboard shortcuts' },
      { key: 'Esc', description: 'Close dialog/menu' },
      { key: '/', description: 'Focus search' },
    ],
  },
  {
    title: 'Task Management',
    shortcuts: [
      { key: 'n', description: 'Create new task' },
      { key: 's', ctrlKey: true, description: 'Save current form' },
      { key: 'd', ctrlKey: true, description: 'Open daily summary' },
    ],
  },
  {
    title: 'Navigation',
    shortcuts: [
      { key: '1', ctrlKey: true, description: 'Switch to Current tasks' },
      { key: '2', ctrlKey: true, description: 'Switch to Completed tasks' },
      { key: '3', ctrlKey: true, description: 'Switch to Pending tasks' },
      { key: 'b', ctrlKey: true, description: 'Toggle notifications panel' },
    ],
  },
  {
    title: 'Task Actions',
    shortcuts: [
      { key: 'Enter', description: 'Edit selected task' },
      { key: 'Space', description: 'Toggle task completion' },
      { key: 'Delete', description: 'Delete selected task' },
      { key: 'ArrowUp', description: 'Navigate to previous task' },
      { key: 'ArrowDown', description: 'Navigate to next task' },
    ],
  },
];

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto border-0 bg-gradient-to-br from-background/95 to-muted/50 backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-lg" />
        <div className="relative">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Use these keyboard shortcuts to navigate and manage tasks more efficiently.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-6">
            {shortcutGroups.map((group, groupIndex) => (
              <div key={group.title}>
                <h3 className="font-semibold text-sm text-muted-foreground mb-3 px-1">
                  {group.title}
                </h3>
                <Card className="bg-muted/50 border border-border/50 transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {group.shortcuts.map((shortcut, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-foreground">{shortcut.description}</span>
                          <kbd className="px-2 py-1 text-xs font-mono bg-background/80 border border-border/50 rounded shadow-sm">
                            {formatShortcut(shortcut)}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                {groupIndex < shortcutGroups.length - 1 && <Separator className="mt-4 opacity-50" />}
              </div>
            ))}
          </div>
          
          <div className="flex justify-end pt-6">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="bg-background/80 border-border/50 hover:bg-muted/95 transition-all duration-200"
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Trigger button component
interface KeyboardShortcutsTriggerProps {
  onClick: () => void;
}

export function KeyboardShortcutsTrigger({ onClick }: KeyboardShortcutsTriggerProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="text-muted-foreground hover:text-foreground"
    >
      <Keyboard className="h-4 w-4 mr-2" />
      Shortcuts
    </Button>
  );
}
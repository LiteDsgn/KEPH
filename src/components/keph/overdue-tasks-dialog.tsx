'use client';

import type { Task } from '@/types';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface OverdueTasksDialogProps {
  overdueTasks: Task[];
  onMoveToToday: (taskIds: string[]) => void;
  onMoveToPending: (taskIds: string[]) => void;
  onClose: () => void;
}

export function OverdueTasksDialog({ overdueTasks, onMoveToToday, onMoveToPending, onClose }: OverdueTasksDialogProps) {
  const taskIds = overdueTasks.map(t => t.id);

  const handleMoveToToday = () => {
    onMoveToToday(taskIds);
    onClose();
  };

  const handleMoveToPending = () => {
    onMoveToPending(taskIds);
    onClose();
  };
  
  // This component is no longer used directly, but kept for potential future use.
  // The logic has been moved to the NotificationPanel.
  if (overdueTasks.length === 0) {
    return null;
  }
  
  return (
    <AlertDialog open={overdueTasks.length > 0} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent className="border-0 bg-gradient-to-br from-background/95 to-muted/50 backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-warning/5 rounded-lg" />
        <div className="relative">
          <AlertDialogHeader className="pb-6">
            <AlertDialogTitle className="text-2xl font-bold bg-gradient-to-r from-destructive to-warning bg-clip-text text-transparent">
              You have {overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground/80">
              What would you like to do with the tasks from previous days that were not completed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-h-60 overflow-y-auto rounded-xl border border-border/30 p-4 space-y-2 bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm">
              {overdueTasks.map(task => (
                  <div key={task.id} className="text-sm p-3 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg border border-border/20 backdrop-blur-sm">
                      {task.title}
                  </div>
              ))}
          </div>
          <div className="relative mt-6">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-border/30 to-transparent h-px top-0" />
            <div className="flex justify-end gap-4 pt-6">
              <Button variant="outline" onClick={handleMoveToPending} className="rounded-xl border-border/50 hover:border-border">
                Move to Pending
              </Button>
              <Button onClick={handleMoveToToday} className="rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                Move to Today
              </Button>
            </div>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

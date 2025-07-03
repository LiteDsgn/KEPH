'use client';

import type { Task } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, Circle } from 'lucide-react';

interface DailySummaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  formattedDate: string;
}

export function DailySummaryDialog({ isOpen, onClose, tasks, formattedDate }: DailySummaryDialogProps) {
  if (!isOpen) return null;

  let totalChecklistItems = 0;
  let completedChecklistItems = 0;

  tasks.forEach(task => {
    if (task.subtasks && task.subtasks.length > 0) {
      totalChecklistItems += task.subtasks.length;
      completedChecklistItems += task.subtasks.filter(st => st.completed).length;
    } else {
      totalChecklistItems += 1;
      if (task.status === 'completed') {
        completedChecklistItems += 1;
      }
    }
  });

  const completionRate = totalChecklistItems > 0 ? (completedChecklistItems / totalChecklistItems) * 100 : 0;
  
  const completedTasks = tasks.filter(t => {
      if(t.subtasks && t.subtasks.length > 0) {
          return t.subtasks.every(st => st.completed);
      }
      return t.status === 'completed';
  });

  const incompleteTasks = tasks.filter(t => !completedTasks.some(ct => ct.id === t.id));

  const renderTaskWithSubtasks = (task: Task) => (
    <li key={task.id} className="mb-3">
        <div className="flex items-center gap-2 font-medium">
            {task.status === 'completed' ? <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> : <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
            <span>{task.title}</span>
        </div>
        {task.subtasks && task.subtasks.length > 0 && (
            <ul className="pl-6 mt-1 space-y-1">
                {task.subtasks.map(subtask => (
                    <li key={subtask.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                         {subtask.completed ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> : <Circle className="h-3.5 w-3.5 flex-shrink-0" />}
                         <span>{subtask.title}</span>
                    </li>
                ))}
            </ul>
        )}
    </li>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Summary for {formattedDate}</DialogTitle>
          <DialogDescription>
            An overview of your productivity and tasks for the day.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
            <div>
                <div className="flex justify-between items-center mb-1 text-sm">
                    <span className="font-medium">Overall Progress</span>
                    <span className="text-muted-foreground">{completionRate.toFixed(0)}%</span>
                </div>
                <Progress value={completionRate} />
            </div>
            <Separator />
            <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                    {completedTasks.length > 0 && (
                        <div>
                            <h4 className="font-semibold mb-2">Completed</h4>
                            <ul className="list-inside">
                                {completedTasks.map(renderTaskWithSubtasks)}
                            </ul>
                        </div>
                    )}
                    {incompleteTasks.length > 0 && (
                         <div>
                            <h4 className="font-semibold mb-2">Incomplete</h4>
                            <ul className="list-inside">
                                {incompleteTasks.map(renderTaskWithSubtasks)}
                            </ul>
                        </div>
                    )}
                    {tasks.length === 0 && (
                        <p className="text-muted-foreground text-center py-8">No tasks for this day.</p>
                    )}
                </div>
            </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

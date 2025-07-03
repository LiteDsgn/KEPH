'use client';

import type { Task } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, Circle, NotebookText, Link as LinkIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DailySummaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  formattedDate: string;
}

export function DailySummaryDialog({ isOpen, onClose, tasks, formattedDate }: DailySummaryDialogProps) {
  if (!isOpen) return null;

  const totalTasks = tasks.length;
  
  const completedTasksList = tasks.filter(t => {
      if (t.subtasks && t.subtasks.length > 0) {
          return t.subtasks.every(st => st.completed);
      }
      return t.status === 'completed';
  });

  const incompleteTasksList = tasks.filter(t => !completedTasksList.some(ct => ct.id === t.id));
  const completedTasksCount = completedTasksList.length;
  
  let totalSubtasks = 0;
  let completedSubtasks = 0;
  tasks.forEach(task => {
    if (task.subtasks && task.subtasks.length > 0) {
      totalSubtasks += task.subtasks.length;
      completedSubtasks += task.subtasks.filter(st => st.completed).length;
    }
  });
  
  let itemsForCompletion = 0;
  let completedItemsForCompletion = 0;
  tasks.forEach(task => {
    if (task.subtasks && task.subtasks.length > 0) {
        itemsForCompletion += task.subtasks.length;
        completedItemsForCompletion += task.subtasks.filter(st => st.completed).length;
    } else {
        itemsForCompletion += 1;
        if (task.status === 'completed') {
            completedItemsForCompletion += 1;
        }
    }
  });
  const completionRate = itemsForCompletion > 0 ? (completedItemsForCompletion / itemsForCompletion) * 100 : 0;


  const renderTaskDetails = (task: Task) => (
    <div key={task.id} className="p-4 rounded-lg bg-muted/50 border">
        <div className="flex items-center gap-3">
            {task.status === 'completed' ? <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" /> : <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />}
            <span className="font-semibold">{task.title}</span>
        </div>
        {task.subtasks && task.subtasks.length > 0 && (
            <ul className="pl-8 mt-2 space-y-1.5">
                {task.subtasks.map(subtask => (
                    <li key={subtask.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                         {subtask.completed ? <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> : <Circle className="h-4 w-4 flex-shrink-0" />}
                         <span className={cn(subtask.completed && 'line-through')}>{subtask.title}</span>
                    </li>
                ))}
            </ul>
        )}
        {task.notes && (
             <p className="text-sm text-muted-foreground flex items-start gap-2 mt-2 pl-8">
                <NotebookText className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="whitespace-pre-wrap">{task.notes}</span>
            </p>
        )}
        {task.urls && task.urls.length > 0 && (
            <div className="space-y-1 mt-2 pl-8">
            {task.urls.map(url => (
                <a 
                    key={url.id}
                    href={url.value} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-link hover:underline flex items-center gap-2"
                >
                    <LinkIcon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{url.value}</span>
                </a>
            ))}
            </div>
        )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">End of Day Report: {formattedDate}</DialogTitle>
          <DialogDescription>
            A summary of your activities and progress for the day.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 mt-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Daily Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div>
                        <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="font-medium">Overall Progress</span>
                            <span className="text-muted-foreground">{completionRate.toFixed(0)}%</span>
                        </div>
                        <Progress value={completionRate} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="p-3 bg-muted rounded-md">
                            <div className="text-muted-foreground">Tasks Completed</div>
                            <div className="text-2xl font-bold">{completedTasksCount} / {totalTasks}</div>
                        </div>
                        <div className="p-3 bg-muted rounded-md">
                            <div className="text-muted-foreground">Subtasks Checked</div>
                            <div className="text-2xl font-bold">{completedSubtasks} / {totalSubtasks}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <ScrollArea className="h-[45vh] pr-4">
                <div className="space-y-6">
                    {completedTasksList.length > 0 && (
                        <div>
                            <h3 className="text-xl font-semibold mb-3 text-green-500">Accomplishments</h3>
                            <div className="space-y-3">
                                {completedTasksList.map(renderTaskDetails)}
                            </div>
                        </div>
                    )}
                     {incompleteTasksList.length > 0 && (
                        <div>
                            <Separator className="my-6" />
                            <h3 className="text-xl font-semibold mb-3 text-amber-500">Outstanding Items</h3>
                            <div className="space-y-3">
                                {incompleteTasksList.map(renderTaskDetails)}
                            </div>
                        </div>
                    )}
                    {tasks.length === 0 && (
                        <p className="text-muted-foreground text-center py-8">No tasks recorded for this day.</p>
                    )}
                </div>
            </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

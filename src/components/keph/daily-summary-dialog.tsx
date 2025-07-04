'use client';

import { useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Task } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Circle, NotebookText, Link as LinkIcon, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { format } from 'date-fns';

interface DailySummaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  formattedDate: string;
  dateKey?: string;
}

export function DailySummaryDialog({ isOpen, onClose, tasks, formattedDate, dateKey }: DailySummaryDialogProps) {
  const reportContentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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

  const getReportTitle = () => {
    if (formattedDate === 'Today' && dateKey) {
      const [year, month, day] = dateKey.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return `End of Day Report: Today - ${format(date, 'MMMM d, yyyy')}`;
    }
    return `End of Day Report: ${formattedDate}`;
  };

  const reportTitle = getReportTitle();

  const generateHtmlReport = () => {
    let html = `<h1>${reportTitle}</h1>`;

    html += `<h2>Daily Statistics</h2>`;
    html += `<ul><li><strong>Overall Progress</strong>: ${completionRate.toFixed(0)}%</li>`;
    html += `<li><strong>Tasks Completed</strong>: ${completedTasksCount} / ${totalTasks}</li>`;
    html += `<li><strong>Subtasks Checked</strong>: ${completedSubtasks} / ${totalSubtasks}</li></ul>`;
    html += '<hr>';

    const renderTaskToHtml = (task: Task) => {
        let taskHtml = `<h3>${task.status === 'completed' ? '✅' : '⬜️'} ${task.title}</h3>`;
        if (task.subtasks && task.subtasks.length > 0) {
            taskHtml += `<ul>${task.subtasks.map(st => `<li>${st.completed ? '☑️' : '☐'} ${st.title}</li>`).join('')}</ul>`;
        }
        if (task.notes) {
            taskHtml += `<p><strong>Notes:</strong><br/>${task.notes.replace(/\n/g, '<br/>')}</p>`;
        }
        if (task.urls && task.urls.length > 0) {
            taskHtml += `<p><strong>URLs:</strong></p><ul>${task.urls.map(url => `<li><a href="${url.value}">${url.value}</a></li>`).join('')}</ul>`;
        }
        return taskHtml;
    }

    if (completedTasksList.length > 0) {
        html += '<h2>Accomplishments</h2>';
        html += completedTasksList.map(renderTaskToHtml).join('<hr>');
    }

    if (incompleteTasksList.length > 0) {
        html += '<h2>Outstanding Items</h2>';
        html += incompleteTasksList.map(renderTaskToHtml).join('<hr>');
    }

    if (tasks.length === 0) {
        html += '<p>No tasks recorded for this day.</p>';
    }
    
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Powered by KEPH</title></head><body>${html}</body></html>`;
  };

  const generatePlainTextReport = () => {
    let text = `${reportTitle}\n\n`;

    text += `== Daily Statistics ==\n`;
    text += `- Overall Progress: ${completionRate.toFixed(0)}%\n`;
    text += `- Tasks Completed: ${completedTasksCount} / ${totalTasks}\n`;
    text += `- Subtasks Checked: ${completedSubtasks} / ${totalSubtasks}\n\n`;
    text += '-----------------\n\n';

    const renderTaskToText = (task: Task) => {
        let taskText = `${task.status === 'completed' ? '✅' : '🔲'} ${task.title}\n\n`;
        if (task.subtasks && task.subtasks.length > 0) {
            taskText += task.subtasks.map(st => `  - [${st.completed ? 'x' : ' '}] ${st.title}`).join('\n') + '\n\n';
        }
        if (task.notes) {
            taskText += `Notes:\n${task.notes}\n\n`;
        }
        if (task.urls && task.urls.length > 0) {
            taskText += `URLs:\n` + task.urls.map(url => `- ${url.value}`).join('\n') + '\n\n';
        }
        return taskText;
    }

    if (completedTasksList.length > 0) {
        text += '== Accomplishments ==\n\n';
        text += completedTasksList.map(renderTaskToText).join('---\n');
    }

    if (incompleteTasksList.length > 0) {
        text += '\n== Outstanding Items ==\n\n';
        text += incompleteTasksList.map(renderTaskToText).join('---\n');
    }

    if (tasks.length === 0) {
        text += 'No tasks recorded for this day.\n';
    }

    return text;
  };

  const handleCopyToClipboard = () => {
    const html = generateHtmlReport();
    const text = generatePlainTextReport();
    const htmlBlob = new Blob([html], { type: 'text/html' });
    const textBlob = new Blob([text], { type: 'text/plain' });

    navigator.clipboard.write([
        new ClipboardItem({
            'text/html': htmlBlob,
            'text/plain': textBlob,
        })
    ]).then(() => {
        toast({
            title: "Copied to clipboard!",
            description: "The report can be pasted into editors like Google Docs."
        });
    }, (err) => {
        toast({
            variant: "destructive",
            title: "Copy Failed",
            description: "Could not copy to clipboard. Please try again."
        });
        console.error('Could not copy text: ', err);
    });
  };



  const renderTaskDetails = (task: Task) => (
    <div key={task.id} className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-accent/5 rounded-xl blur-sm" />
        <div className="relative p-5 rounded-xl bg-card/60 backdrop-blur-sm border border-border/30 hover:border-border/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
                {task.status === 'completed' ? <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" /> : <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />}
                <span className="font-semibold text-foreground">{task.title}</span>
            </div>
            {task.subtasks && task.subtasks.length > 0 && (
                <ul className="pl-8 mt-3 space-y-2">
                    {task.subtasks.map(subtask => (
                        <li key={subtask.id} className="flex items-center gap-3 text-sm">
                             {subtask.completed ? <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> : <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                             <span className={cn("transition-colors", subtask.completed ? 'line-through text-muted-foreground' : 'text-foreground')}>{subtask.title}</span>
                        </li>
                    ))}
                </ul>
            )}
            {task.notes && (
                 <div className="mt-4 pl-8">
                    <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg border border-border/20">
                        <NotebookText className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground whitespace-pre-wrap">{task.notes}</span>
                    </div>
                 </div>
            )}
            {task.urls && task.urls.length > 0 && (
                <div className="space-y-2 mt-4 pl-8">
                {task.urls.map(url => (
                    <a 
                        key={url.id}
                        href={url.value} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm text-link hover:text-link/80 flex items-center gap-3 p-2 bg-muted/10 rounded-lg border border-border/20 hover:border-border/40 transition-colors"
                    >
                        <LinkIcon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{url.value}</span>
                    </a>
                ))}
                </div>
            )}
        </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl flex flex-col max-h-[90vh] bg-card/95 backdrop-blur-xl border border-border/50 rounded-3xl p-0 overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-t-3xl" />
          <DialogHeader className="relative p-8 pb-6">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">{reportTitle}</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              A comprehensive summary of your activities and progress for the day.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-8" ref={reportContentRef}>
            <div className="space-y-8">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl blur-xs" />
                    <div className="relative bg-card/80 backdrop-blur-xs border border-border/30 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold mb-6 text-foreground">Daily Statistics</h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-3 text-sm">
                                    <span className="font-medium text-foreground">Overall Progress</span>
                                    <span className="text-lg font-bold text-primary">{completionRate.toFixed(0)}%</span>
                                </div>
                                <Progress value={completionRate} className="h-3" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl blur-xs" />
                                    <div className="relative p-4 bg-muted/30 rounded-xl border border-border/30 hover:border-border/50 transition-colors">
                                        <div className="text-sm text-muted-foreground mb-1">Tasks Completed</div>
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completedTasksCount} / {totalTasks}</div>
                                    </div>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl blur-xs" />
                                    <div className="relative p-4 bg-muted/30 rounded-xl border border-border/30 hover:border-border/50 transition-colors">
                                        <div className="text-sm text-muted-foreground mb-1">Subtasks Checked</div>
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{completedSubtasks} / {totalSubtasks}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
            </div>
        </div>
        <div className="relative mt-6">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-border/30 to-transparent h-px top-0" />
            <div className="flex justify-end gap-4 p-8 pt-6">
                <Button onClick={handleCopyToClipboard} className="rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy for Docs
                </Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

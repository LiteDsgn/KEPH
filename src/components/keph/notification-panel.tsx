'use client';

import { useState } from 'react';
import type { Notification, Task } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Bell, ChevronDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

interface NotificationPanelProps {
  notifications: Notification[];
  onMoveOverdueToToday: (taskIds: string[]) => void;
  onKeepInPending: (taskIds: string[]) => void;
  onDismissNotification: (notificationId: string) => void;
}

export function NotificationPanel({
  notifications,
  onMoveOverdueToToday,
  onKeepInPending,
  onDismissNotification,
}: NotificationPanelProps) {
  
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  
  if (notifications.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl blur-xl" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-muted/30 to-accent/20 rounded-3xl flex items-center justify-center">
                    <Bell className="w-8 h-8 text-muted-foreground" />
                </div>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">All Clear!</h3>
            <p className="text-sm text-muted-foreground">No new notifications to review</p>
        </div>
    );
  }

  const handleToggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const handleMoveSelected = () => {
    onMoveOverdueToToday(selectedTaskIds);
    setSelectedTaskIds([]);
  }

  const handleKeepSelected = () => {
    onKeepInPending(selectedTaskIds);
    setSelectedTaskIds([]);
  }

  const renderOverdueTasksNotification = (notification: Notification) => {
    const isSingleTask = notification.data.length === 1;
    const singleTask = isSingleTask ? notification.data[0] : null;

    if (isSingleTask && singleTask) {
        return (
            <div key={notification.id} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-orange-500/5 rounded-2xl blur-sm" />
                <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:border-border">
                    <div className="flex items-start justify-between mb-4">
                        <div className="space-y-2">
                            <h3 className="text-base font-semibold text-foreground">{notification.title}</h3>
                            <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                            </p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-60 hover:opacity-100 transition-opacity" onClick={() => onDismissNotification(notification.id)}>
                            <X className="h-4 w-4" />
                            <span className="sr-only">Dismiss</span>
                        </Button>
                    </div>
                    <div className="space-y-4">
                        <div className="p-3 bg-muted/30 rounded-xl border border-border/30">
                            <p className="text-sm font-medium text-foreground">"{singleTask.title}"</p>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => onKeepInPending([singleTask.id])}>
                                Keep in Pending
                            </Button>
                            <Button size="sm" className="rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" onClick={() => onMoveOverdueToToday([singleTask.id])}>
                                Move to Today
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
      <Collapsible 
        key={notification.id}
        open={expandedId === notification.id}
        onOpenChange={(isOpen) => {
          setExpandedId(isOpen ? notification.id : null);
          if (!isOpen) {
            setSelectedTaskIds([]);
          }
        }}
        asChild
      >
        <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-orange-500/5 rounded-2xl blur-sm" />
            <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-border">
                <CollapsibleTrigger asChild>
                    <div className="p-6 cursor-pointer hover:bg-muted/20 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                              <h3 className="text-base font-semibold text-foreground">{notification.title}</h3>
                              <p className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                              </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <ChevronDown className={cn("h-4 w-4 transition-transform text-muted-foreground", expandedId === notification.id && "rotate-180")} />
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-60 hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); onDismissNotification(notification.id); }}>
                                <X className="h-4 w-4" />
                                <span className="sr-only">Dismiss</span>
                            </Button>
                          </div>
                        </div>
                        <div className="mt-3">
                            <p className="text-sm text-muted-foreground">{notification.description}</p>
                        </div>
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="px-6 pb-4 space-y-4">
                      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                       <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                        {notification.data.map((task: Task) => (
                          <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/30 hover:bg-muted/30 transition-colors">
                            <Checkbox 
                              id={`select-${task.id}`}
                              checked={selectedTaskIds.includes(task.id)}
                              onCheckedChange={() => handleToggleTaskSelection(task.id)}
                            />
                            <label htmlFor={`select-${task.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1">
                              {task.title}
                            </label>
                          </div>
                        ))}
                       </div>
                    </div>
                    <div className="flex justify-end gap-3 px-6 py-4 bg-muted/10 border-t border-border/30">
                        <Button variant="outline" size="sm" className="rounded-xl" onClick={handleKeepSelected} disabled={selectedTaskIds.length === 0}>
                            Keep Selected
                        </Button>
                        <Button size="sm" className="rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" onClick={handleMoveSelected} disabled={selectedTaskIds.length === 0}>
                            Move Selected
                        </Button>
                    </div>
                </CollapsibleContent>
            </div>
        </div>
      </Collapsible>
    )

  }

  return (
    <div className="space-y-4">
        {notifications.map((notification) => {
            if (notification.type === 'overdue-tasks') {
                return renderOverdueTasksNotification(notification);
            }
            // Future-proofing for other notification types
            return (
                <div key={notification.id} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl blur-sm" />
                    <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:border-border">
                        <div className="flex items-start justify-between mb-4">
                          <div className="space-y-2">
                            <h3 className="text-base font-semibold text-foreground">{notification.title}</h3>
                            <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-60 hover:opacity-100 transition-opacity" onClick={() => onDismissNotification(notification.id)}>
                              <X className="h-4 w-4" />
                              <span className="sr-only">Dismiss</span>
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                    </div>
                </div>
            );
        })}
    </div>
  );
}

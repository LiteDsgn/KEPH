'use client';

import type { Notification, Task } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationPanelProps {
  notifications: Notification[];
  onMoveOverdueToToday: (taskIds: string[]) => void;
  onMoveOverdueToPending: (taskIds: string[]) => void;
  onDismissNotification: (notificationId: string) => void;
}

export function NotificationPanel({
  notifications,
  onMoveOverdueToToday,
  onMoveOverdueToPending,
  onDismissNotification,
}: NotificationPanelProps) {
  
  if (notifications.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Bell className="w-12 h-12 mb-4" />
            <h3 className="text-lg font-semibold">No new notifications</h3>
            <p className="text-sm">You're all caught up!</p>
        </div>
    );
  }

  const handleMoveToToday = (notification: Notification) => {
    const taskIds = notification.data.map((t: Task) => t.id);
    onMoveOverdueToToday(taskIds);
    onDismissNotification(notification.id);
  };

  const handleMoveToPending = (notification: Notification) => {
    const taskIds = notification.data.map((t: Task) => t.id);
    onMoveOverdueToPending(taskIds);
    onDismissNotification(notification.id);
  };

  return (
    <div className="space-y-4">
        {notifications.map((notification) => (
            <Card key={notification.id} className="bg-muted/50">
                <CardHeader className="flex flex-row items-start justify-between pb-4">
                   <div className="space-y-1.5">
                     <CardTitle className="text-base">{notification.title}</CardTitle>
                     <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                     </p>
                   </div>
                   <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-2" onClick={() => onDismissNotification(notification.id)}>
                       <X className="h-4 w-4" />
                       <span className="sr-only">Dismiss</span>
                   </Button>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{notification.description}</p>
                    {notification.type === 'overdue-tasks' && (
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleMoveToPending(notification)}>
                                Move to Pending
                            </Button>
                            <Button size="sm" onClick={() => handleMoveToToday(notification)}>
                                Move to Today
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        ))}
    </div>
  );
}

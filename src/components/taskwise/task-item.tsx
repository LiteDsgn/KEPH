'use client';

import type { Task, TaskStatus } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, Archive, Circle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface TaskItemProps {
  task: Task;
  onUpdateStatus: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onUpdateStatus, onDelete }: TaskItemProps) {
  const handleCheck = (checked: boolean) => {
    onUpdateStatus(task.id, checked ? 'completed' : 'current');
  };

  return (
    <Card
      className={cn(
        'transition-all duration-300 ease-in-out',
        task.status === 'completed' && 'bg-muted/50'
      )}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <Checkbox
          id={`task-${task.id}`}
          checked={task.status === 'completed'}
          onCheckedChange={handleCheck}
          aria-label={`Mark task as ${task.status === 'completed' ? 'current' : 'completed'}`}
        />
        <div className="flex-grow">
          <label
            htmlFor={`task-${task.id}`}
            className={cn(
              'font-medium transition-colors',
              task.status === 'completed' && 'line-through text-muted-foreground'
            )}
          >
            {task.content}
          </label>
          <p className="text-xs text-muted-foreground">
             {formatDistanceToNow(task.createdAt, { addSuffix: true })}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {task.status !== 'current' && (
              <DropdownMenuItem onClick={() => onUpdateStatus(task.id, 'current')}>
                <Circle className="mr-2 h-4 w-4" />
                <span>Mark as Current</span>
              </DropdownMenuItem>
            )}
            {task.status !== 'completed' && (
               <DropdownMenuItem onClick={() => onUpdateStatus(task.id, 'completed')}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                <span>Mark as Completed</span>
              </DropdownMenuItem>
            )}
            {task.status !== 'pending' && (
              <DropdownMenuItem onClick={() => onUpdateStatus(task.id, 'pending')}>
                <Archive className="mr-2 h-4 w-4" />
                <span>Move to Pending</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}

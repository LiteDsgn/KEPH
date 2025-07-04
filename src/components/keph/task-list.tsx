'use client';

import { useState } from 'react';
import type { Task, TaskStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskItem } from './task-item';
import { Search, Circle, CheckCircle2, Archive } from 'lucide-react';
import { isToday, isYesterday, format } from 'date-fns';
import { DailySummaryDialog } from './daily-summary-dialog';

interface TaskListProps {
  categories: string[];
  onAddCategory: (category: string) => void;
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  onDeleteTask: (id: string) => void;
  onDuplicateTask: (id: string) => void;
  search: string;
  setSearch: (search: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const formatDateHeading = (dateKey: string): string => {
    if (dateKey === 'No Date') {
        return 'No Due Date';
    }
    // The key is 'yyyy-MM-dd'. Split it to avoid timezone issues with new Date().
    const [year, month, day] = dateKey.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
};

export function TaskList({ tasks, onUpdateTask, onDeleteTask, onDuplicateTask, search, setSearch, categories, onAddCategory, selectedCategory, setSelectedCategory }: TaskListProps) {
  const [activeTab, setActiveTab] = useState<TaskStatus>('current');
  const [summaryData, setSummaryData] = useState<{ tasks: Task[], dateKey: string } | null>(null);


  const filteredTasks = tasks.filter((task) => {
    if (activeTab === 'current') {
      return (
        task.status === 'current' ||
        (task.status === 'completed' && task.completedAt && isToday(task.completedAt))
      );
    }
    if (activeTab === 'completed') {
      return task.status === 'completed' && task.completedAt && !isToday(task.completedAt);
    }
    if (activeTab === 'pending') {
      return task.status === 'pending';
    }
    return false;
  });

  const sortTasks = (tasksToSort: Task[]) => {
    return tasksToSort.sort((a, b) => {
        if (activeTab === 'completed') {
            return (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0);
        }
        // Sort by due date, tasks with no due date last
        if (a.dueDate && b.dueDate) return a.dueDate.getTime() - b.dueDate.getTime();
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  const renderTaskList = (tasksToRender: Task[]) => {
    if (tasksToRender.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-10">
          <p>No tasks here. ✨</p>
        </div>
      );
    }

    const groupedTasks = tasksToRender.reduce((acc, task) => {
        let dateKeySource: Date | undefined;
        if (activeTab === 'completed') {
            dateKeySource = task.completedAt;
        } else {
            dateKeySource = task.dueDate;
        }

        const dateKey = dateKeySource ? format(dateKeySource, 'yyyy-MM-dd') : 'No Date';

        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(task);
        return acc;
    }, {} as Record<string, Task[]>);

    const sortedGroupKeys = Object.keys(groupedTasks).sort((a, b) => {
        if (a === 'No Date') return 1;
        if (b === 'No Date') return -1;
        return new Date(b).getTime() - new Date(a).getTime();
    });

    return (
      <div className="space-y-4 sm:space-y-6">
        {sortedGroupKeys.map((dateKey) => {
            const groupTasks = groupedTasks[dateKey];
            const sortedGroupTasks = sortTasks(groupTasks);
            
            return (
                <div key={dateKey}>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-md font-semibold text-muted-foreground px-1">
                           {formatDateHeading(dateKey)}
                        </h3>
                        {dateKey !== 'No Date' && (
                            <Button
                                variant="link"
                                className="text-xs h-auto p-0"
                                onClick={() => setSummaryData({ dateKey, tasks: groupTasks })}
                            >
                                Generate Summary
                            </Button>
                        )}
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                        {sortedGroupTasks.map(task => (
                            <TaskItem
                                categories={categories}
                                onAddCategory={onAddCategory}
                                key={task.id}
                                task={task}
                                onUpdate={onUpdateTask}
                                onDelete={onDeleteTask}
                                onDuplicate={onDuplicateTask}
                            />
                        ))}
                    </div>
                </div>
            )
        })}
      </div>
    );
  };

  const getCount = (status: TaskStatus) => {
    if (status === 'current') {
      return tasks.filter(
        (t) =>
          t.status === 'current' ||
          (t.status === 'completed' && t.completedAt && isToday(t.completedAt))
      ).length;
    }
    if (status === 'completed') {
      return tasks.filter(
        (t) => t.status === 'completed' && t.completedAt && !isToday(t.completedAt)
      ).length;
    }
    return tasks.filter((t) => t.status === status).length;
  };

  return (
    <>
        <div className="h-full flex flex-col">
            {/* Modern Header with Search */}
            <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-border/30">

                
                {/* Enhanced Search Bar & Filter */}
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <div className="absolute inset-0 bg-gradient-to-r from-muted/20 to-accent/10 rounded-2xl" />
                        <div className="relative flex items-center">
                            <Search className="absolute left-4 h-4 w-4 text-muted-foreground z-10" />
                            <Input
                                placeholder="Search across all tasks..."
                                className="w-full pl-12 pr-4 h-12 bg-background/80 backdrop-blur-sm border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="relative">
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="h-12 w-full sm:w-[180px] bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl px-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all duration-200">
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Modern Tab Navigation */}
            <div className="px-4 sm:px-6 py-3 sm:py-4">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TaskStatus)} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-muted/20 p-1 rounded-2xl h-12">
                        <TabsTrigger 
                            value="current"
                            className="rounded-xl data-[state=active]:bg-muted/90 data-[state=active]:shadow-sm data-[state=active]:text-foreground flex items-center gap-2"
                        >
                            <Circle className="w-4 h-4" />
                            <span className="font-medium hidden sm:inline">Current</span>
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
                                {getCount('current')}
                            </span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="completed"
                            className="rounded-xl data-[state=active]:bg-muted/90 data-[state=active]:shadow-sm data-[state=active]:text-foreground flex items-center gap-2"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="font-medium hidden sm:inline">Done</span>
                            <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-bold">
                                {getCount('completed')}
                            </span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="pending"
                            className="rounded-xl data-[state=active]:bg-muted/90 data-[state=active]:shadow-sm data-[state=active]:text-foreground flex items-center gap-2"
                        >
                            <Archive className="w-4 h-4" />
                            <span className="font-medium hidden sm:inline">Pending</span>
                            <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full text-xs font-bold">
                                {getCount('pending')}
                            </span>
                        </TabsTrigger>
                    </TabsList>
                    
                    {/* Scrollable Content Area */}
                    <div className="mt-4 sm:mt-6 flex-1 overflow-hidden">
                        <TabsContent value="current" className="h-full overflow-y-auto px-0.5 space-y-1">
                            <div className="pb-4 sm:pb-6">
                                {renderTaskList(filteredTasks)}
                            </div>
                        </TabsContent>
                        <TabsContent value="completed" className="h-full overflow-y-auto px-0.5 space-y-1">
                            <div className="pb-4 sm:pb-6">
                                {renderTaskList(filteredTasks)}
                            </div>
                        </TabsContent>
                        <TabsContent value="pending" className="h-full overflow-y-auto px-0.5 space-y-1">
                            <div className="pb-4 sm:pb-6">
                                {renderTaskList(filteredTasks)}
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
        <DailySummaryDialog
            isOpen={!!summaryData}
            onClose={() => setSummaryData(null)}
            tasks={summaryData?.tasks || []}
            formattedDate={summaryData ? formatDateHeading(summaryData.dateKey) : ''}
            dateKey={summaryData?.dateKey}
        />
    </>
  );
}

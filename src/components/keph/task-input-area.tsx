'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TextToTasksForm } from './text-to-tasks-form';
import { TranscriptToTasksForm } from './transcript-to-tasks-form';
import { FileText, ClipboardList, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { ManualTaskForm } from './manual-task-form';
import type { Task } from '@/types';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface TaskInputAreaProps {
  onTasksCreated: (tasks: Array<{ title: string; subtasks?: string[] }>) => void;
  onTaskCreated: (taskData: Omit<Task, 'id' | 'status' | 'createdAt'>) => void;
}

export function TaskInputArea({ onTasksCreated, onTaskCreated }: TaskInputAreaProps) {
  const [isManualFormOpen, setIsManualFormOpen] = useState(false);

  const handleManualTaskCreated = (taskData: Omit<Task, 'id' | 'status' | 'createdAt'>) => {
    onTaskCreated(taskData);
    setIsManualFormOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Create Tasks</h2>
        </div>
        <p className="text-sm text-muted-foreground">Transform your ideas into actionable tasks using AI</p>
      </div>

      {/* AI Input Methods */}
      <div className="px-6">
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/30 p-1 rounded-2xl">
            <TabsTrigger 
              value="text" 
              className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all duration-200"
            >
              <FileText className="w-4 h-4 mr-2" />
              <span className="font-medium">Text</span>
            </TabsTrigger>
            <TabsTrigger 
              value="transcript"
              className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all duration-200"
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              <span className="font-medium">Transcript</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="text" className="mt-6 space-y-4">
            <div className="bg-gradient-to-br from-muted/20 to-accent/5 rounded-2xl p-4 border border-border/30">
              <TextToTasksForm onTasksCreated={onTasksCreated} />
            </div>
          </TabsContent>
          
          <TabsContent value="transcript" className="mt-6 space-y-4">
            <div className="bg-gradient-to-br from-muted/20 to-accent/5 rounded-2xl p-4 border border-border/30">
              <TranscriptToTasksForm onTasksCreated={onTasksCreated} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Divider with Gradient */}
      <div className="px-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gradient-to-r from-transparent via-border to-transparent" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-4 text-muted-foreground font-medium">Or</span>
          </div>
        </div>
      </div>

      {/* Manual Task Creation */}
      <div className="px-6 pb-6">
        <Dialog open={isManualFormOpen} onOpenChange={setIsManualFormOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full h-12 bg-gradient-to-r from-muted/30 to-accent/10 hover:from-muted/40 hover:to-accent/20 border border-border/30 rounded-2xl transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <PlusCircle className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium">Add task manually</span>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl border-0 bg-gradient-to-br from-background/95 to-muted/50 backdrop-blur-xl shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-lg" />
            <div className="relative">
              <DialogHeader className="pb-6">
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Create New Task
                </DialogTitle>
              </DialogHeader>
              <ManualTaskForm
                onTaskCreated={handleManualTaskCreated}
                onCancel={() => setIsManualFormOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

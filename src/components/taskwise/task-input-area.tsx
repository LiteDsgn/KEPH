'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TextToTasksForm } from './text-to-tasks-form';
import { TranscriptToTasksForm } from './transcript-to-tasks-form';
import { VoiceRecorder } from './voice-recorder';
import { FileText, ClipboardList, Mic } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface TaskInputAreaProps {
  onTasksCreated: (tasks: string[]) => void;
}

export function TaskInputArea({ onTasksCreated }: TaskInputAreaProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="text">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text">
              <FileText className="w-4 h-4 mr-2" />
              Text
            </TabsTrigger>
            <TabsTrigger value="transcript">
              <ClipboardList className="w-4 h-4 mr-2" />
              Transcript
            </TabsTrigger>
            <TabsTrigger value="voice">
              <Mic className="w-4 h-4 mr-2" />
              Voice
            </TabsTrigger>
          </TabsList>
          <TabsContent value="text" className="mt-4">
            <TextToTasksForm onTasksCreated={onTasksCreated} />
          </TabsContent>
          <TabsContent value="transcript" className="mt-4">
            <TranscriptToTasksForm onTasksCreated={onTasksCreated} />
          </TabsContent>
          <TabsContent value="voice" className="mt-4">
            <VoiceRecorder onTasksCreated={onTasksCreated} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { transcriptToTasks } from '@/ai/flows/transcript-to-tasks';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  transcript: z
    .string()
    .min(20, { message: 'Please enter a transcript of at least 20 characters.' })
    .max(5000, { message: 'Transcript cannot exceed 5000 characters.' }),
});

interface TranscriptToTasksFormProps {
  onTasksCreated: (tasks: string[]) => void;
}

export function TranscriptToTasksForm({ onTasksCreated }: TranscriptToTasksFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transcript: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const result = await transcriptToTasks({ transcript: values.transcript });
      onTasksCreated(result.tasks);
      form.reset();
    } catch (error) {
      console.error('Error generating tasks from transcript:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate tasks from transcript. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="transcript"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Paste meeting transcript</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Paste the full meeting transcript here..."
                  {...field}
                  rows={8}
                />
              </FormControl>
              <FormDescription>
                The AI will identify action items and create tasks.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Tasks from Transcript
        </Button>
      </form>
    </Form>
  );
}

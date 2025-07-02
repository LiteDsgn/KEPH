'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { textToTasks } from '@/ai/flows/text-to-tasks';
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
  description: z
    .string()
    .min(10, { message: 'Please enter at least 10 characters.' })
    .max(500, { message: 'Description cannot exceed 500 characters.' }),
});

interface TextToTasksFormProps {
  onTasksCreated: (tasks: Array<{ title: string; subtasks?: string[] }>) => void;
}

export function TextToTasksForm({ onTasksCreated }: TextToTasksFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const result = await textToTasks({ description: values.description });
      onTasksCreated(result.tasks);
      form.reset();
    } catch (error) {
      console.error('Error generating tasks from text:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate tasks. Please try again.',
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Describe your goals</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., I need to prepare for the client meeting tomorrow, then pick up groceries and book a flight for my trip next month."
                  {...field}
                  rows={5}
                />
              </FormControl>
              <FormDescription>
                The AI will extract actionable tasks from your text.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Tasks
        </Button>
      </form>
    </Form>
  );
}

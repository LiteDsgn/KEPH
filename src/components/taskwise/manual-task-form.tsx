'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, X } from 'lucide-react';
import type { Task } from '@/types';

const formSchema = z.object({
  title: z.string().min(1, 'Task title cannot be empty.'),
  subtasks: z.array(z.object({
    title: z.string().min(1, 'Subtask cannot be empty.'),
  })).optional(),
  notes: z.string().optional(),
  urls: z.array(z.object({
    value: z.string().url({ message: "Please enter a valid URL." }).min(1, 'URL cannot be empty.'),
  })).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ManualTaskFormProps {
  onTaskCreated: (taskData: Omit<Task, 'id' | 'status' | 'createdAt'>) => void;
}

export function ManualTaskForm({ onTaskCreated }: ManualTaskFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      subtasks: [],
      notes: '',
      urls: [],
    },
  });

  const { fields: subtaskFields, append: appendSubtask, remove: removeSubtask } = useFieldArray({
    control: form.control,
    name: 'subtasks',
  });

  const { fields: urlFields, append: appendUrl, remove: removeUrl } = useFieldArray({
    control: form.control,
    name: 'urls',
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      onTaskCreated({
        title: values.title,
        notes: values.notes,
        urls: values.urls?.map(u => ({
            id: crypto.randomUUID(),
            value: u.value,
        })),
        subtasks: values.subtasks?.map(st => ({
            id: crypto.randomUUID(),
            title: st.title,
            completed: false,
        })),
      });
      form.reset();
      toast({
          title: 'Task Added',
          description: 'Your new task has been created.',
      })
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create task. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4 pt-2">
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                      <Input placeholder="e.g., Buy milk" {...field} />
                  </FormControl>
                  <FormMessage />
                  </FormItem>
              )}
            />
            
            <FormItem>
                <FormLabel>Subtasks (Optional)</FormLabel>
                <div className="space-y-2">
                    {subtaskFields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-2">
                            <FormField
                                control={form.control}
                                name={`subtasks.${index}.title`}
                                render={({ field }) => (
                                  <FormControl>
                                      <Input {...field} placeholder={`Subtask ${index + 1}`} />
                                  </FormControl>
                                )}
                            />
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeSubtask(index)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => appendSubtask({ title: '' })}
                >
                    Add Subtask
                </Button>
            </FormItem>

             <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                        <Textarea {...field} placeholder="Add feedback or other notes here" />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            
            <FormItem>
                <FormLabel>URLs (Optional)</FormLabel>
                <div className="space-y-2">
                    {urlFields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-2">
                            <FormField
                                control={form.control}
                                name={`urls.${index}.value`}
                                render={({ field }) => (
                                  <FormControl>
                                      <Input {...field} placeholder="https://related-link.com" />
                                  </FormControl>
                                )}
                            />
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeUrl(index)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => appendUrl({ value: '' })}
                >
                    Add URL
                </Button>
            </FormItem>

            <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            Add Task
            </Button>
        </form>
        </Form>
    </div>
  );
}

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
import type { Task } from '@/types';
import { Loader2, X, Sparkles } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { generateSubtasks } from '@/ai/flows/generate-subtasks';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  title: z.string().min(1, 'Task title cannot be empty.'),
  subtasks: z.array(z.object({
    id: z.string(),
    title: z.string().min(1, 'Subtask cannot be empty.'),
    completed: z.boolean(),
  })).optional(),
  notes: z.string().optional(),
  url: z.string().url('Please enter a valid URL.').or(z.literal('')).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditTaskFormProps {
  task: Task;
  onSubmit: (values: FormValues) => Promise<void>;
  onCancel: () => void;
}

export function EditTaskForm({ task, onSubmit, onCancel }: EditTaskFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPrompt, setGenerationPrompt] = useState('');
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task.title,
      subtasks: task.subtasks || [],
      notes: task.notes || '',
      url: task.url || '',
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'subtasks',
  });

  const { isSubmitting } = form.formState;

  const handleSubmit = async (values: FormValues) => {
    await onSubmit(values);
    form.reset();
  }

  const handleGenerateSubtasks = async () => {
    if (!generationPrompt.trim()) {
        toast({
            variant: 'destructive',
            title: 'Prompt is empty',
            description: 'Please describe the subtasks you want to generate.',
        });
        return;
    }
    setIsGenerating(true);
    try {
        const result = await generateSubtasks({
            taskTitle: form.getValues('title'),
            description: generationPrompt
        });
        
        if (result.subtasks && result.subtasks.length > 0) {
            const newSubtasks = result.subtasks.map(title => ({
                id: crypto.randomUUID(),
                title: title,
                completed: false,
            }));
            replace(newSubtasks);
            setGenerationPrompt('');
            toast({
                title: 'Subtasks Generated',
                description: `${newSubtasks.length} subtasks have been added to your task.`
            })
        } else {
            toast({
                title: 'No Subtasks Generated',
                description: 'The AI could not generate any subtasks from your prompt.'
            })
        }

    } catch(error) {
        console.error("Error generating subtasks:", error);
        toast({
            variant: 'destructive',
            title: 'Generation Failed',
            description: 'An error occurred while generating subtasks. Please try again.',
        });
    } finally {
        setIsGenerating(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormItem>
            <FormLabel>Subtasks</FormLabel>
            <div className="space-y-2">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                         <FormField
                            control={form.control}
                            name={`subtasks.${index}.completed`}
                            render={({ field: checkboxField }) => (
                              <FormControl>
                                  <Input type="checkbox" checked={checkboxField.value} onChange={checkboxField.onChange} className="hidden" />
                              </FormControl>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`subtasks.${index}.title`}
                            render={({ field: inputField }) => (
                                <FormControl>
                                  <Input {...inputField} placeholder={`Subtask ${index + 1}`} />
                                </FormControl>
                            )}
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
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
                onClick={() => append({ id: crypto.randomUUID(), title: '', completed: false })}
            >
                Add Subtask
            </Button>
        </FormItem>
        
        <Separator />

        <div className="space-y-2">
          <FormLabel>Generate Subtasks with AI</FormLabel>
          <Textarea 
            placeholder="Provide a detailed description of what needs to be done, and the AI will break it down into subtasks..."
            value={generationPrompt}
            onChange={(e) => setGenerationPrompt(e.target.value)}
            rows={3}
          />
          <Button type="button" onClick={handleGenerateSubtasks} disabled={isGenerating} className="w-full">
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generate Subtasks
          </Button>
        </div>
        
        <Separator />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Add some notes or feedback..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://example.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting || isGenerating}>
                Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isGenerating}>
                {(isSubmitting || isGenerating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
        </div>
      </form>
    </Form>
  );
}

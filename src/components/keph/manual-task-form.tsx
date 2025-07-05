'use client';

import { useState, useRef } from 'react';
import { useForm, useFieldArray, type ControllerRenderProps, type FieldPath } from 'react-hook-form';
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
import { Loader2, PlusCircle, X, CalendarIcon, Sparkles, GripVertical, Repeat } from 'lucide-react';
import type { Task, TaskStatus, RecurrenceType } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { Separator } from '../ui/separator';
import { generateSubtasks } from '@/ai/flows/generate-subtasks';
import { RecurrencePanel } from './recurrence-panel';
import { formatRecurrenceDisplay } from '@/lib/recurring-tasks';

import type { Category } from '@/types/categories';

const formSchema = z.object({
  title: z.string().min(1, 'Task title cannot be empty.'),
  subtasks: z.array(z.object({
    title: z.string().min(1, 'Subtask cannot be empty.'),
  })).optional(),
  notes: z.string().optional(),
  urls: z.array(z.object({
    value: z.string().url({ message: "Please enter a valid URL." }).min(1, 'URL cannot be empty.'),
  })).optional(),
  dueDate: z.date().optional(),
  recurrenceType: z.enum(['none', 'daily', 'weekly', 'monthly', 'yearly']).default('none'),
  recurrenceInterval: z.number().min(1, 'Interval must be at least 1').default(1),
  recurrenceEndDate: z.date().optional(),
  recurrenceMaxOccurrences: z.number().min(1, 'Max occurrences must be at least 1').optional(),
      category: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ManualTaskFormProps {
  categories?: string[];
  onAddCategory?: (category: string) => void;
  onTaskCreated: (taskData: Omit<Task, 'id'>) => void;
  onCancel: () => void;
}

export function ManualTaskForm({ onTaskCreated, onCancel, categories, onAddCategory }: ManualTaskFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [isRecurrencePanelOpen, setIsRecurrencePanelOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [suggestedSubtasks, setSuggestedSubtasks] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      subtasks: [],
      notes: '',
      urls: [],
      dueDate: undefined,
      recurrenceType: 'none',
      recurrenceInterval: 1,
      recurrenceEndDate: undefined,
      recurrenceMaxOccurrences: undefined,
      category: 'General',
    },
  });

  const { fields: subtaskFields, append: appendSubtask, remove: removeSubtask, move: moveSubtask } = useFieldArray({
    control: form.control,
    name: 'subtasks',
  });

  const { fields: urlFields, append: appendUrl, remove: removeUrl } = useFieldArray({
    control: form.control,
    name: 'urls',
  });

  const subtaskDragItem = useRef<number | null>(null);
  const subtaskDragOverItem = useRef<number | null>(null);

  const handleSubtaskDragStart = (index: number) => {
    subtaskDragItem.current = index;
  };

  const handleSubtaskDragEnter = (index: number) => {
    subtaskDragOverItem.current = index;
  };

  const handleSubtaskDrop = () => {
    if (subtaskDragItem.current !== null && subtaskDragOverItem.current !== null) {
      moveSubtask(subtaskDragItem.current, subtaskDragOverItem.current);
    }
    subtaskDragItem.current = null;
    subtaskDragOverItem.current = null;
  };

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      const taskData: Omit<Task, 'id'> = {
        title: values.title,
        notes: values.notes,
        status: 'pending' as TaskStatus,
        createdAt: new Date(),
        dueDate: values.dueDate || new Date(),
        completedAt: undefined,
        category: values.category,
        urls: values.urls?.map(u => ({
            id: crypto.randomUUID(),
            value: u.value,
        })) || [],
        subtasks: values.subtasks?.map(st => ({
            id: crypto.randomUUID(),
            title: st.title,
            completed: false,
        })) || [],
      };

      // Add recurrence configuration if not 'none'
      if (values.recurrenceType !== 'none') {
        taskData.recurrence = {
          type: values.recurrenceType,
          interval: values.recurrenceInterval,
          endDate: values.recurrenceEndDate,
          maxOccurrences: values.recurrenceMaxOccurrences,
        };
      }

      onTaskCreated(taskData);
      form.reset();
      toast({
          title: 'Task Added',
          description: values.recurrenceType !== 'none' 
            ? 'Your recurring task has been created.' 
            : 'Your new task has been created.',
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

  const handleGenerateSubtasks = async () => {
    const title = form.getValues('title');
    if (!title.trim()) {
        toast({
            variant: 'destructive',
            title: 'Task Title is empty',
            description: 'Please provide a title for the task before generating subtasks.',
        });
        return;
    }
    if (!generationPrompt.trim()) {
        toast({
            variant: 'destructive',
            title: 'Prompt is empty',
            description: 'Please describe the subtasks you want to generate.',
        });
        return;
    }
    setIsGenerating(true);
    setSuggestedSubtasks([]);
    try {
        const result = await generateSubtasks({
            taskTitle: title,
            description: generationPrompt
        });
        
        if (result.subtasks && result.subtasks.length > 0) {
            setSuggestedSubtasks(result.subtasks);
            setGenerationPrompt('');
            toast({
                title: 'Subtasks Suggested',
                description: `The AI suggested ${result.subtasks.length} subtasks. Review and add them below.`
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

  const handleAddSuggestedSubtask = (title: string) => {
    appendSubtask({ title });
    setSuggestedSubtasks(prev => prev.filter(st => st !== title));
    toast({
        title: `Subtask Added`,
        description: `"${title}" was added to the task.`
    })
  };

  return (
    <div className="space-y-4">
        {/* Header */}
        <div className="">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Create New Task
            </h3>
        </div>
        
        {/* Form Body */}
        <div className="max-h-[60vh] overflow-y-auto p-2 scroll-smooth custom-scrollbar">
            <Form {...form}>
            <form id="manual-task-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-x-6">
                <div className={cn("flex-1 space-y-4 transition-all duration-300", !isAiPanelOpen && !isRecurrencePanelOpen && "w-full")}>
                    <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }: { field: ControllerRenderProps<FormValues, "title"> }) => (
                              <FormItem>
                              <FormLabel>Task Title</FormLabel>
                              <FormControl>
                                  <Input placeholder="e.g., Buy milk" {...field} />
                              </FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {(categories || []).map((cat) => (
                                    <Button
                                      key={cat}
                                      type="button"
                                      variant={field.value === cat ? 'default' : 'outline'}
                                      size="sm"
                                      onClick={() => field.onChange(cat)}
                                      className="h-auto px-2 py-1 text-xs"
                                    >
                                      {cat}
                                    </Button>
                                  ))}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="dueDate"
                        render={({ field }: { field: ControllerRenderProps<FormValues, "dueDate"> }) => (
                          <FormItem className="flex flex-col min-w-0">
                            <FormLabel>Due Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormItem className="flex flex-col min-w-0">
                        <FormLabel>Recurrence</FormLabel>
                        <Button
                          type="button"
                          variant={form.watch('recurrenceType') !== 'none' ? "default" : "outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            form.watch('recurrenceType') === 'none' && "text-muted-foreground"
                          )}
                          onClick={() => setIsRecurrencePanelOpen(prev => !prev)}
                        >
                          <Repeat className="mr-2 h-4 w-4" />
                          {form.watch('recurrenceType') !== 'none' ? (
                            <span className="truncate min-w-0">
                              {formatRecurrenceDisplay({
                                type: form.watch('recurrenceType'),
                                interval: form.watch('recurrenceInterval'),
                                endDate: form.watch('recurrenceEndDate'),
                                maxOccurrences: form.watch('recurrenceMaxOccurrences'),
                              })}
                            </span>
                          ) : (
                            <span>No repeat</span>
                          )}
                        </Button>
                      </FormItem>
                    </div>



                    <FormItem>
                        <FormLabel>Subtasks (Optional)</FormLabel>
                        <div className="space-y-2 max-h-48 overflow-y-auto p-2 custom-scrollbar">
                            {subtaskFields.map((field: any, index: number) => (
                                <div 
                                    key={field.id}
                                    className="flex items-center gap-2 group"
                                    draggable
                                    onDragStart={() => handleSubtaskDragStart(index)}
                                    onDragEnter={() => handleSubtaskDragEnter(index)}
                                    onDragEnd={handleSubtaskDrop}
                                    onDragOver={(e) => e.preventDefault()}
                                >
                                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                    <FormField
                                        control={form.control}
                                        name={`subtasks.${index}.title`}
                                        render={({ field }: { field: ControllerRenderProps<FormValues, `subtasks.${number}.title`> }) => (
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
                        <div className="flex gap-2 mt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => appendSubtask({ title: '' })}
                            >
                                Add Subtask
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsAiPanelOpen(prev => !prev)}
                                disabled={isSubmitting || isGenerating}
                            >
                                <Sparkles className="mr-2 h-4 w-4" />
                                {isAiPanelOpen ? 'Close AI Panel' : 'Generate with AI'}
                            </Button>
                        </div>
                    </FormItem>

                     <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }: { field: ControllerRenderProps<FormValues, "notes"> }) => (
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
                        <div className="space-y-2 max-h-48 overflow-y-auto p-2 custom-scrollbar">
                            {urlFields.map((field: any, index: number) => (
                                <div key={field.id} className="flex items-center gap-2">
                                    <FormField
                                        control={form.control}
                                        name={`urls.${index}.value`}
                                        render={({ field }: { field: ControllerRenderProps<FormValues, `urls.${number}.value`> }) => (
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
                </div>

                {isRecurrencePanelOpen && (
                    <div className="w-full md:w-1/2 lg:w-2/5 md:border-l border-border/95 md:pl-6 space-y-4 mt-6 md:mt-0">
                        <RecurrencePanel
                            form={form}
                            onClose={() => setIsRecurrencePanelOpen(false)}
                        />
                    </div>
                )}

                {isAiPanelOpen && (
            <div className="w-full md:w-1/2 lg:w-2/5 md:border-l border-border/95 md:pl-6 space-y-4 mt-6 md:mt-0">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <FormLabel>Generate Subtasks with AI</FormLabel>
                                <Button type="button" variant="ghost" size="icon" onClick={() => setIsAiPanelOpen(false)} className="md:hidden">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <Textarea 
                                placeholder="Provide a detailed description of what needs to be done, and the AI will break it down into subtasks..."
                                value={generationPrompt}
                                onChange={(e) => setGenerationPrompt(e.target.value)}
                                rows={5}
                            />
                            <Button type="button" onClick={handleGenerateSubtasks} disabled={isGenerating} className="w-full">
                                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                Generate Subtasks
                            </Button>
                        </div>

                        {suggestedSubtasks.length > 0 && (
                            <>
                                <Separator />
                                <div className="space-y-2">
                                    <FormLabel>AI Suggestions</FormLabel>
                                    <p className="text-xs text-muted-foreground">Click the plus icon to add a subtask.</p>
                                    <div className="space-y-2 max-h-40 overflow-y-auto rounded-md border p-2">
                                        {suggestedSubtasks.map((suggestion, index) => (
                                            <div key={index} className="flex items-center justify-between gap-2 p-2 bg-muted/50 rounded-md">
                                                <span className="text-sm flex-1">{suggestion}</span>
                                                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleAddSuggestedSubtask(suggestion)}>
                                                    <PlusCircle className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            </form>
            </Form>
        </div>
        
        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting || isGenerating}>
                Cancel
            </Button>
            <Button type="submit" form="manual-task-form" disabled={isSubmitting || isGenerating}>
                {(isSubmitting || isGenerating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Task
            </Button>
        </div>
    </div>
  );
}

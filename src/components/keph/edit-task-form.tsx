'use client';

import { useState, useRef } from 'react';
import { useForm, useFieldArray, ControllerRenderProps } from 'react-hook-form';
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
import type { Task, RecurrenceType } from '@/types';
import { Loader2, X, Sparkles, CalendarIcon, GripVertical, PlusCircle, Repeat } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { generateSubtasks } from '@/ai/flows/generate-subtasks';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { RecurrencePanel } from './recurrence-panel';
import { formatRecurrenceDisplay } from '@/lib/recurring-tasks';



const formSchema = z.object({
  category: z.string().optional(),
  title: z.string().min(1, 'Task title cannot be empty.'),
  subtasks: z.array(z.object({
    id: z.string(),
    title: z.string().min(1, 'Subtask cannot be empty.'),
    completed: z.boolean(),
  })).optional(),
  notes: z.string().optional(),
  urls: z.array(z.object({
    id: z.string(),
    value: z.string().url({ message: "Please enter a valid URL." }).min(1, 'URL cannot be empty.'),
  })).optional(),
  dueDate: z.date().optional(),
  recurrenceType: z.enum(['none', 'daily', 'weekly', 'monthly', 'yearly']).default('none'),
  recurrenceInterval: z.number().min(1).default(1),
  recurrenceEndDate: z.date().optional(),
  recurrenceMaxOccurrences: z.number().min(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditTaskFormProps {
  categories: string[];
  onAddCategory: (category: string) => void;
  task: Task;
  onSubmit: (values: Partial<Omit<Task, 'id' | 'createdAt'>>) => Promise<void>;
  onCancel: () => void;
}

export function EditTaskForm({ task, onSubmit, onCancel, categories, onAddCategory }: EditTaskFormProps) {
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [isRecurrencePanelOpen, setIsRecurrencePanelOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [suggestedSubtasks, setSuggestedSubtasks] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task.title,
      subtasks: task.subtasks || [],
      notes: task.notes || '',
      urls: task.urls || [],
      dueDate: task.dueDate,
      recurrenceType: task.recurrence?.type || 'none',
      recurrenceInterval: task.recurrence?.interval || 1,
      recurrenceEndDate: task.recurrence?.endDate,
      recurrenceMaxOccurrences: task.recurrence?.maxOccurrences,
      category: task.category || 'Personal',
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

  const { isSubmitting } = form.formState;

  const handleSubmit = async (values: FormValues) => {
    const updates: Partial<Omit<Task, 'id' | 'createdAt'>> = {
      title: values.title,
      subtasks: values.subtasks,
      notes: values.notes,
      urls: values.urls,
      dueDate: values.dueDate,
      category: values.category,
    };

    if (values.recurrenceType !== 'none') {
      updates.recurrence = {
        type: values.recurrenceType as RecurrenceType,
        interval: values.recurrenceInterval,
        endDate: values.recurrenceEndDate,
        maxOccurrences: values.recurrenceMaxOccurrences,
      };
    } else {
      updates.recurrence = undefined;
    }

    await onSubmit(updates);
    form.reset();
  };

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
    setSuggestedSubtasks([]);
    try {
      const result = await generateSubtasks({
        taskTitle: form.getValues('title'),
        description: generationPrompt
      });
      
      if (result.subtasks && result.subtasks.length > 0) {
        setSuggestedSubtasks(result.subtasks);
        setGenerationPrompt('');
        toast({
          title: 'Subtasks Suggested',
          description: `The AI suggested ${result.subtasks.length} subtasks. Review and add them below.`
        });
      } else {
        toast({
          title: 'No Subtasks Generated',
          description: 'The AI could not generate any subtasks from your prompt.'
        });
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
  };

  const handleAddSuggestedSubtask = (title: string) => {
    appendSubtask({ id: crypto.randomUUID(), title, completed: false });
    setSuggestedSubtasks(prev => prev.filter(st => st !== title));
    toast({
      title: `Subtask Added`,
      description: `"${title}" was added to the task.`
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Edit Task
        </h3>
      </div>
      
      {/* Form Body */}
      <div className="max-h-[70vh] overflow-y-auto p-2 scroll-smooth custom-scrollbar">
        <Form {...form}>
        <form id="edit-task-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-x-6">
          <div className={cn("flex-1 space-y-4 transition-all duration-300", !isAiPanelOpen && !isRecurrencePanelOpen && "w-full")}>
            <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter task title" {...field} />
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
                          {categories.map((cat) => (
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
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

              <FormItem className="flex flex-col">
                <FormLabel>Recurrence</FormLabel>
                <Button
                  type="button"
                  variant={form.watch('recurrenceType') !== 'none' ? "default" : "outline"}
                  className={cn(
                    "justify-start text-left font-normal min-w-[140px]",
                    form.watch('recurrenceType') === 'none' && "text-muted-foreground"
                  )}
                  onClick={() => setIsRecurrencePanelOpen(prev => !prev)}
                >
                  <Repeat className="mr-2 h-4 w-4" />
                  {form.watch('recurrenceType') !== 'none' ? (
                    <span className="truncate">
                      {formatRecurrenceDisplay({
                        type: form.watch('recurrenceType') as RecurrenceType,
                        interval: form.watch('recurrenceInterval') || 1,
                        endDate: form.watch('recurrenceEndDate'),
                        maxOccurrences: form.watch('recurrenceMaxOccurrences')
                      })}
                    </span>
                  ) : (
                    <span>No repeat</span>
                  )}
                </Button>
              </FormItem>
            </div>

            <FormItem>
              <FormLabel>Subtasks</FormLabel>
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
                      render={({ field: inputField }) => (
                        <FormControl>
                          <Input {...inputField} placeholder={`Subtask ${index + 1}`} />
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
                  onClick={() => appendSubtask({ id: crypto.randomUUID(), title: '', completed: false })}
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

            <FormItem>
              <FormLabel>URLs</FormLabel>
              <div className="space-y-2 max-h-48 overflow-y-auto p-2 custom-scrollbar">
                {urlFields.map((field: any, index: number) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name={`urls.${index}.value`}
                      render={({ field: inputField }) => (
                        <FormControl>
                          <Input {...inputField} placeholder="https://example.com" />
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
                onClick={() => appendUrl({ id: crypto.randomUUID(), value: '' })}
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
                    <div className="space-y-2 max-h-40 overflow-y-auto rounded-md border p-2 custom-scrollbar">
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
        <Button type="submit" form="edit-task-form" disabled={isSubmitting || isGenerating}>
          {(isSubmitting || isGenerating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}

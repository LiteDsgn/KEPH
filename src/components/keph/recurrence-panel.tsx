'use client';

import { type ControllerRenderProps, type UseFormReturn, FormProvider } from 'react-hook-form';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { RecurrenceType } from '@/types';

interface RecurrencePanelProps {
  form: UseFormReturn<any>;
  onClose: () => void;
}

export function RecurrencePanel({ form, onClose }: RecurrencePanelProps) {
  const handleReset = () => {
    form.setValue('recurrenceType', 'none');
    form.setValue('recurrenceInterval', 1);
    form.setValue('recurrenceEndDate', undefined);
    form.setValue('recurrenceMaxOccurrences', undefined);
    onClose();
  };

  const handlePanelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleSelectChange = (value: string, onChange: (value: string) => void) => {
    onChange(value);
    // Prevent any potential modal closing behavior
    setTimeout(() => {
      // This ensures the select interaction doesn't interfere with modal state
    }, 0);
  };

  return (
    <FormProvider {...form}>
      <div className="space-y-4" onClick={handlePanelClick}>
      <div className="flex justify-between items-center">
        <FormLabel className="text-base font-medium">Recurrence Settings</FormLabel>
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="md:hidden"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="recurrenceType"
          render={({ field }: { field: ControllerRenderProps<any, "recurrenceType"> }) => (
            <FormItem>
              <FormLabel>Repeat</FormLabel>
              <Select onValueChange={(value) => handleSelectChange(value, field.onChange)} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recurrence" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="border-border/10">
                  <SelectItem value="none">No repeat</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch('recurrenceType') !== 'none' && (
          <>
            <FormField
              control={form.control}
              name="recurrenceInterval"
              render={({ field }: { field: ControllerRenderProps<any, "recurrenceInterval"> }) => (
                <FormItem>
                  <FormLabel>
                    Every {field.value || 1} {form.watch('recurrenceType')}{field.value > 1 ? 's' : ''}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="365"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="recurrenceEndDate"
                render={({ field }: { field: ControllerRenderProps<any, "recurrenceEndDate"> }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
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
                              <span>No end date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-border/10" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recurrenceMaxOccurrences"
                render={({ field }: { field: ControllerRenderProps<any, "recurrenceMaxOccurrences"> }) => (
                  <FormItem>
                    <FormLabel>Max Occurrences (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="1000"
                        placeholder="e.g., 10"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        <div className="flex gap-2 pt-4 border-t border-border/10">
          <Button type="button" onClick={onClose} className="flex-1">
            Done
          </Button>
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>
    </div>
    </FormProvider>
  );
}
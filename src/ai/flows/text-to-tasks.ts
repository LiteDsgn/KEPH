'use server';

/**
 * @fileOverview A flow that generates a todo list from descriptive text.
 *
 * - textToTasks - A function that handles the generation of a todo list from descriptive text.
 * - TextToTasksInput - The input type for the textToTasks function.
 * - TextToTasksOutput - The return type for the textToTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TextToTasksInputSchema = z.object({
  description: z.string().describe('A description of the goals for the day.'),
});
export type TextToTasksInput = z.infer<typeof TextToTasksInputSchema>;

const TextToTasksOutputSchema = z.object({
  tasks: z
    .array(
      z.object({
        title: z.string().describe('A short, actionable task title.'),
        description: z
          .string()
          .optional()
          .describe(
            'A more detailed description of the task, explaining the context and what needs to be done.'
          ),
      })
    )
    .describe('A list of actionable tasks.'),
});
export type TextToTasksOutput = z.infer<typeof TextToTasksOutputSchema>;

export async function textToTasks(input: TextToTasksInput): Promise<TextToTasksOutput> {
  return textToTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'textToTasksPrompt',
  input: {schema: TextToTasksInputSchema},
  output: {schema: TextToTasksOutputSchema},
  prompt: `You are a personal assistant that is good at creating todo lists from plans.

  Create a todo list of actionable tasks from the following description.
  For each task, provide a concise 'title' and a more detailed 'description'.
  The title should be a clear action item. The description should provide any necessary context or details.

  Description:
  {{description}}
  `,
});

const textToTasksFlow = ai.defineFlow(
  {
    name: 'textToTasksFlow',
    inputSchema: TextToTasksInputSchema,
    outputSchema: TextToTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

'use server';

/**
 * @fileOverview This file defines a Genkit flow for extracting tasks from a meeting transcript.
 *
 * - transcriptToTasks - A function that handles the task extraction process from a transcript.
 * - TranscriptToTasksInput - The input type for the transcriptToTasks function.
 * - TranscriptToTasksOutput - The return type for the transcriptToTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranscriptToTasksInputSchema = z.object({
  transcript: z.string().describe('The meeting transcript to extract tasks from.'),
  instructions: z.string().optional().describe('Optional instructions for the AI on how to process the transcript.'),
  categories: z.array(z.string()).describe('A list of available categories to assign to tasks.'),
});
export type TranscriptToTasksInput = z.infer<typeof TranscriptToTasksInputSchema>;

const TranscriptToTasksOutputSchema = z.object({
  tasks: z
    .array(
      z.object({
        title: z.string().describe('A short, actionable task title.'),
        subtasks: z
          .array(z.string())
          .optional()
          .describe(
            'A list of smaller, concrete steps or sub-tasks needed to complete the main task.'
          ),
        category: z.string().describe('The category assigned to the task from the provided list.'),
      })
    )
    .describe('A list of actionable tasks.'),
});
export type TranscriptToTasksOutput = z.infer<typeof TranscriptToTasksOutputSchema>;

export async function transcriptToTasks(input: TranscriptToTasksInput): Promise<TranscriptToTasksOutput> {
  return transcriptToTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'transcriptToTasksPrompt',
  input: {schema: TranscriptToTasksInputSchema},
  output: {schema: TranscriptToTasksOutputSchema},
  prompt: `You are an AI assistant that extracts actionable tasks from a meeting transcript.

  Given the following meeting transcript, identify the tasks that need to be done.
  For each task, you MUST assign a 'category' from the provided list. If no category fits, assign 'General'.
  For each task, provide a concise 'title', a list of 'subtasks' that break down the main task, and assign a 'category' from the provided list. The title should be a clear summary of the action item.

  Available Categories:
  {{#each categories}}
  - {{this}}
  {{/each}}
  - General

  {{#if instructions}}
  You MUST follow these instructions precisely when creating the tasks:
  {{instructions}}
  {{/if}}

  Transcript:
  {{transcript}}`,
});

const transcriptToTasksFlow = ai.defineFlow(
  {
    name: 'transcriptToTasksFlow',
    inputSchema: TranscriptToTasksInputSchema,
    outputSchema: TranscriptToTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

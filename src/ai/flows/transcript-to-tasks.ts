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
});
export type TranscriptToTasksInput = z.infer<typeof TranscriptToTasksInputSchema>;

const TranscriptToTasksOutputSchema = z.object({
  tasks: z.array(z.string()).describe('A list of tasks extracted from the transcript.'),
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

  Given the following meeting transcript, identify the tasks that need to be done and create a todo list.
  Format the output as a JSON array of strings.

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

'use server';

/**
 * @fileOverview Converts speech to a structured todo list using AI.
 *
 * - voiceToTasks - A function that handles the conversion of speech to tasks.
 * - VoiceToTasksInput - The input type for the voiceToTasks function.
 * - VoiceToTasksOutput - The return type for the voiceToTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VoiceToTasksInputSchema = z.object({
  speechDataUri: z
    .string()
    .describe(
      "A recording of the user's voice, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type VoiceToTasksInput = z.infer<typeof VoiceToTasksInputSchema>;

const VoiceToTasksOutputSchema = z.object({
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
    .describe('A list of tasks extracted from the user speech.'),
});
export type VoiceToTasksOutput = z.infer<typeof VoiceToTasksOutputSchema>;

export async function voiceToTasks(input: VoiceToTasksInput): Promise<VoiceToTasksOutput> {
  return voiceToTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'voiceToTasksPrompt',
  input: {schema: VoiceToTasksInputSchema},
  output: {schema: VoiceToTasksOutputSchema},
  prompt: `You are a personal assistant whose job is to convert user speech into a list of actionable tasks.

  Here is the user's speech recording: {{media url=speechDataUri}}

  Extract the tasks from the speech. For each task, create a short 'title' and a 'description' with more details.
  The title should be concise and actionable. The description should elaborate on the task.
  Do not include any introductory or concluding remarks.

  Example Output:
  {
    "tasks": [
      {
        "title": "Book dentist appointment",
        "description": "Call Dr. Smith's office to schedule a check-up for next week."
      },
      {
        "title": "Buy groceries",
        "description": "Need to buy milk, eggs, bread, and chicken for dinner."
      },
      {
        "title": "Finish the presentation",
        "description": "Complete the slides for the Q3 review meeting, focusing on the marketing a-nalytics section."
      }
    ]
  }
  `,
});

const voiceToTasksFlow = ai.defineFlow(
  {
    name: 'voiceToTasksFlow',
    inputSchema: VoiceToTasksInputSchema,
    outputSchema: VoiceToTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

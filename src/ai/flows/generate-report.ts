'use server';

/**
 * @fileOverview A flow that generates productivity reports from task data.
 *
 * - generateReport - A function that handles the generation of productivity reports.
 * - GenerateReportInput - The input type for the generateReport function.
 * - GenerateReportOutput - The return type for the generateReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReportInputSchema = z.object({
  title: z.string().describe('The title of the report.'),
  startDate: z.string().describe('The start date of the report period (ISO string).'),
  endDate: z.string().describe('The end date of the report period (ISO string).'),
  toneProfile: z.enum(['professional', 'casual', 'reflective', 'motivational']).describe('The tone profile for the report.'),
  taskData: z.array(
    z.object({
      title: z.string().describe('The task title.'),
      category: z.string().optional().describe('The task category name.'),
      status: z.enum(['current', 'completed', 'pending']).describe('The task status.'),
    })
  ).describe('Array of task data for the report period.'),
  categoryStats: z.object({
    totalTasks: z.number().describe('Total number of tasks.'),
    completedTasks: z.number().describe('Number of completed tasks.'),
    completionRate: z.number().describe('Completion rate as a percentage.'),
    categoryCounts: z.record(z.number()).describe('Task counts by category.'),
    categoryCompletionRates: z.record(z.number()).describe('Completion rates by category.'),
  }).describe('Statistical summary of tasks.'),
});
export type GenerateReportInput = z.infer<typeof GenerateReportInputSchema>;

const GenerateReportOutputSchema = z.object({
  content: z.string().describe('The complete report content as a single formatted string with markdown-style formatting'),
});
export type GenerateReportOutput = z.infer<typeof GenerateReportOutputSchema>;

export async function generateReport(input: GenerateReportInput): Promise<GenerateReportOutput> {
  return generateReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReportPrompt',
  input: {schema: GenerateReportInputSchema},
  output: {schema: GenerateReportOutputSchema},
  prompt: `You are an AI productivity coach helping users reflect on their task completion patterns and productivity journey.

Generate a comprehensive, personalized report based on the provided task data and user preferences.
The report should be written as a single formatted content string that matches the current UI implementation.

**Content Structure:**
Use markdown-style formatting that will be converted to HTML:
- Use **text** for section headers (will become h3 elements)
- Use *text* for bullet points (will become styled list items)
- Use double line breaks for paragraph separation

**Required Sections:**
1. Opening personal reflection on the time period
2. **Week/Month Overview** - Summary of the period
3. **Key Achievements** - Accomplishments and wins
4. **Productivity Patterns** - Insights about work habits
5. **Challenges & Growth** - Difficulties and lessons learned
6. **Looking Forward** - Recommendations and next steps

**Tone Guidelines:**
- **Professional**: Use formal language, focus on metrics and objective analysis
- **Casual**: Use friendly, conversational language with a supportive tone
- **Reflective**: Use thoughtful, introspective language that encourages self-awareness
- **Motivational**: Use encouraging, energetic language that inspires action

Report Details:
- Title: {{title}}
- Period: {{startDate}} to {{endDate}}
- Tone: {{toneProfile}}

Task Statistics:
- Total Tasks: {{categoryStats.totalTasks}}
- Completed Tasks: {{categoryStats.completedTasks}}
- Overall Completion Rate: {{categoryStats.completionRate}}%

Category Breakdown:
{{#each categoryStats.categoryCounts}}
- {{@key}}: {{this}} tasks ({{lookup ../categoryStats.categoryCompletionRates @key}}% completion rate)
{{/each}}

Task Details:
{{#each taskData}}
- {{title}}{{#if category}} ({{category}}){{/if}} - {{#if (eq status 'completed')}}✅ Completed{{else if (eq status 'current')}}🔄 Current{{else}}⏳ Pending{{/if}}
{{/each}}

Generate a single, well-formatted content string that tells the user's productivity story in a personal and engaging way.`,
});

const generateReportFlow = ai.defineFlow(
  {
    name: 'generateReportFlow',
    inputSchema: GenerateReportInputSchema,
    outputSchema: GenerateReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
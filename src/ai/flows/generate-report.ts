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
  toneProfile: z.enum(['professional', 'casual', 'analytical', 'motivational', 'reflective']).describe('The tone profile for the report.'),
  taskData: z.array(
    z.object({
      title: z.string().describe('The task title.'),
      category: z.string().optional().describe('The task category name.'),
      status: z.enum(['current', 'completed', 'pending']).describe('The task status.'),
      notes: z.string().optional().describe('The task notes or description.'),
      subtasks: z.array(
        z.object({
          title: z.string().describe('The subtask title.'),
          completed: z.boolean().describe('Whether the subtask is completed.')
        })
      ).describe('Array of subtasks for this task.'),
      urls: z.array(
        z.object({
          url: z.string().describe('The URL associated with this task.')
        })
      ).describe('Array of URLs associated with this task.')
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
- Use **text** for section headers (will become h3 elements with class "text-lg font-semibold text-foreground mb-3 mt-6")
- Use *text* for bullet points (will become styled list items with primary dot indicators)
- Use double line breaks (\n\n) for paragraph separation
- Write in first person narrative style to match the UI examples

**Required Sections:**
1. Opening personal reflection on the time period (conversational, engaging start)
2. **Week/Month Overview** - Summary of the period with specific insights
3. **Key Achievements** - Accomplishments and wins with personal voice
4. **Productivity Patterns** - Insights about work habits and discoveries
5. **Outstanding Tasks** - Summary of task titles that still need attention

**Enhanced Analysis Guidelines:**
- **Subtask Analysis**: Look at subtask completion rates to understand task execution depth and thoroughness
- **Subtask Title**: Use subtask titles to understand the nature of work being performed
- **Resource Utilization**: Analyze URLs and external resources to gauge research habits and information gathering
- **Task Complexity**: Use subtask counts to identify which tasks required more detailed planning and execution
- **Work Patterns**: Consider task notes to understand the nature and context of work being performed
- **Engagement Depth**: Higher subtask counts and URL usage may indicate more engaged, thorough work sessions

**Content Style Guidelines:**
- Write as personal narrative: "What a week this has been!" or "I've been reflecting on..."
- Use specific time references: "Monday-Tuesday:", "Week 1:", "This month:"
- Include personal emotions and reactions: "It felt great to...", "I'm particularly proud of..."
- Balance data insights with personal reflection
- Keep tone conversational and authentic to match UI examples
- Analyze subtask completion patterns to understand task breakdown and execution
- Use subtask titles to understand the nature of work being performed
- Reference task notes and descriptions for deeper context about work content
- Consider URLs and resources as indicators of research depth and external engagement

**Tone Guidelines:**
- **Professional**: Use formal language, focus on metrics and objective analysis
- **Casual**: Use friendly, conversational language with a supportive tone
- **Analytical**: Use data-focused, objective analysis with thoughtful insights
- **Motivational**: Use encouraging, energetic language that inspires action
- **Reflective**: Use thoughtful, introspective language that encourages self-awareness

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
{{#if notes}}  Notes: {{notes}}{{/if}}
{{#if subtasks.length}}  Subtasks ({{subtasks.length}}): {{#each subtasks}}{{#if completed}}✅{{else}}⏳{{/if}} {{title}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}
{{#if urls.length}}  Resources: {{#each urls}}{{url}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}
{{/each}}

**Example Content Format:**
Start with an engaging opening like: "What a week [date range] has been! I completed [X]% of my planned tasks, which feels like [personal reaction]. Looking deeper, I tackled [Y] subtasks and gathered [Z] resources, showing how thorough my approach was."

Then structure with sections like:
**[Period] Overview:**
*[Time period]:* [Personal narrative about what happened, including subtask completion patterns]
*[Time period]:* [More specific details and personal insights about task complexity and resource usage]

**Key Achievements:**
*[Achievement 1]:* [Personal reflection on the accomplishment, mentioning subtask thoroughness if relevant]
*[Achievement 2]:* [How it felt to complete this, noting any research or preparation involved]

**Productivity Patterns:**
*Task Execution Style:* [Insights about how subtasks reveal planning and execution habits]
*Research & Resources:* [Observations about information gathering and external resource usage]

Ensure each bullet point (*text*) contains personal narrative and emotional context, not just facts.
Incorporate subtask and URL analysis naturally into the personal reflection.
Use double line breaks between major sections for proper paragraph separation.

Generate a single, well-formatted content string that tells the user's productivity story in a personal and engaging way, with deeper insights from subtask and resource analysis.`,
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
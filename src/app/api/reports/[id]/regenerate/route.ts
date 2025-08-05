import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';
import { generateReport } from '@/ai/flows/generate-report';
import { format, parseISO } from 'date-fns';

// POST /api/reports/[id]/regenerate - Regenerate an existing report with AI
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );
    
    let { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Initial auth check:', { userId: user?.id, authError });
    
    if (authError || !user) {
      const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
      console.log('Refresh result:', { refreshedUserId: refreshed?.user?.id, refreshError });
      
      if (refreshError || !refreshed?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      user = refreshed.user;
    }

    const reportId = params.id;
    
    // Get the existing report
    const { data: existingReport, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .eq('user_id', user.id)
      .single();

    if (reportError || !existingReport) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const startDate = existingReport.date_range_start;
    const endDate = existingReport.date_range_end;

    // Fetch tasks for the same date range with category information, subtasks, and URLs
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select(`
        *,
        categories(name),
        subtasks(id, title, completed),
        task_urls(id, url)
      `)
      .eq('user_id', user.id)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }

    // Transform tasks data for AI processing
    const taskData = tasks.map(task => ({
      title: task.title,
      category: (task.categories as any)?.name,
      status: task.status,
      notes: task.notes || undefined,
      subtasks: (task.subtasks as any[])?.map(subtask => ({
        title: subtask.title,
        completed: subtask.completed,
      })) || [],
      urls: (task.task_urls as any[])?.map(url => ({
        url: url.url,
      })) || [],
    }));

    // Calculate category statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const categoryCounts: Record<string, number> = {};
    const categoryCompletionRates: Record<string, number> = {};
    
    tasks.forEach(task => {
      const category = (task.categories as any)?.name || 'General';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    Object.keys(categoryCounts).forEach(category => {
      const categoryTasks = tasks.filter(task => ((task.categories as any)?.name || 'General') === category);
      const categoryCompleted = categoryTasks.filter(task => task.status === 'completed').length;
      categoryCompletionRates[category] = categoryTasks.length > 0 
        ? Math.round((categoryCompleted / categoryTasks.length) * 100) 
        : 0;
    });

    const categoryStats = {
      totalTasks,
      completedTasks,
      completionRate,
      categoryCounts,
      categoryCompletionRates,
    };

    // Generate new report content using AI
    const aiResult = await generateReport({
      title: existingReport.title,
      startDate,
      endDate,
      toneProfile: existingReport.tone_profile as 'professional' | 'casual' | 'analytical' | 'motivational' | 'reflective',
      taskData,
      categoryStats,
    });

    // Update the existing report with new content
    const { data: updatedReport, error: updateError } = await supabase
      .from('reports')
      .update({
        content: aiResult.content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reportId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating report:', updateError);
      return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
    }

    // Transform response to match frontend expectations
    const transformedReport = {
      id: updatedReport.id,
      userId: updatedReport.user_id,
      title: updatedReport.title,
      startDate: new Date(updatedReport.date_range_start),
      endDate: new Date(updatedReport.date_range_end),
      aiGenerated: true,
      toneProfile: updatedReport.tone_profile,
      createdAt: new Date(updatedReport.created_at),
      updatedAt: new Date(updatedReport.updated_at),
    };

    return NextResponse.json({ report: transformedReport }, { status: 200 });
  } catch (error) {
    console.error('Error in POST /api/reports/[id]/regenerate:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
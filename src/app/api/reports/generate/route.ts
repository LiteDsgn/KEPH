import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';
import { generateReport } from '@/ai/flows/generate-report';
import { format, parseISO } from 'date-fns';

// POST /api/reports/generate - Generate a new report with AI
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    );
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, startDate, endDate, toneProfile } = body;
    
    if (!title || !startDate || !endDate || !toneProfile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch tasks for the specified date range with category information
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select(`
        *,
        categories(name)
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

    // Generate report using AI
    const aiResult = await generateReport({
      title,
      startDate,
      endDate,
      toneProfile: toneProfile as 'professional' | 'casual' | 'reflective' | 'motivational',
      taskData,
      categoryStats,
    });

    // Save the generated report to database
    const { data: report, error: saveError } = await supabase
      .from('reports')
      .insert({
        user_id: user.id,
        title,
        content: aiResult.content,
        date_range_start: format(parseISO(startDate), 'yyyy-MM-dd'),
        date_range_end: format(parseISO(endDate), 'yyyy-MM-dd'),
        tone_profile: toneProfile as 'professional' | 'casual' | 'motivational' | 'analytical',
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving report:', saveError);
      return NextResponse.json({ error: 'Failed to save report' }, { status: 500 });
    }

    // Transform response to match frontend expectations
    const transformedReport = {
      id: report.id,
      userId: report.user_id,
      title: report.title,
      content: report.content,
      startDate: new Date(report.date_range_start),
      endDate: new Date(report.date_range_end),
      aiGenerated: true,
      toneProfile: report.tone_profile,
      createdAt: new Date(report.created_at),
      updatedAt: new Date(report.updated_at),
    };

    return NextResponse.json({ report: transformedReport }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/reports/generate:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
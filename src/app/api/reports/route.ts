import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';
import type { Report } from '@/types';

type SupabaseReport = Database['public']['Tables']['reports']['Row'];

// GET /api/reports - List user's reports
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: reports, error } = await query;

    if (error) {
      console.error('Error fetching reports:', error);
      return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }

    // Transform database response to match our types
    const transformedReports: Report[] = reports.map(report => ({
      id: report.id,
      title: report.title,
      tone_profile: report.tone_profile,
      date_range_start: report.date_range_start,
      date_range_end: report.date_range_end,
      filters: report.filters,
      content: report.content,
      user_id: report.user_id,
      created_at: report.created_at,
      updated_at: report.updated_at
    }));

    return NextResponse.json({ reports: transformedReports });
  } catch (error) {
    console.error('Error in GET /api/reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/reports - Create a new report
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

    const body: Partial<Report> = await request.json();
    
    if (!body.title || !body.content || !body.date_range_start || !body.date_range_end) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: report, error } = await supabase
      .from('reports')
      .insert({
        user_id: user.id,
        title: body.title,
        content: body.content,
        date_range_start: body.date_range_start,
        date_range_end: body.date_range_end,
        tone_profile: body.tone_profile || 'professional',
        filters: body.filters || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating report:', error);
      return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
    }

    // Transform response
    const transformedReport: Report = {
      id: report.id,
      title: report.title,
      tone_profile: report.tone_profile,
      date_range_start: report.date_range_start,
      date_range_end: report.date_range_end,
      filters: report.filters,
      content: report.content,
      user_id: report.user_id,
      created_at: report.created_at,
      updated_at: report.updated_at
    };

    return NextResponse.json({ report: transformedReport }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
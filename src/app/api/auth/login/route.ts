import { createServerClient } from '@supabase/ssr';
import { NextResponse, NextRequest } from 'next/server';
import type { Database } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const response = NextResponse.json({ user: null });

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            response.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    console.log('Login attempt for:', email);
    console.log('Login success:', !!data.user);
    console.log('Login error:', error?.message);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (!data.user) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    // Update the response with user data
    return NextResponse.json({ user: data.user }, {
      status: 200,
      headers: response.headers
    });
  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
import { createServerClient } from '@supabase/ssr';
import { NextResponse, NextRequest } from 'next/server';
import type { Database } from '@/types/database';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  let response = NextResponse.next();

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
          response.cookies.delete({ name, ...options });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  console.log('Login data:', data);
  console.log('Cookies after login:', response.cookies.getAll());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return response.json({ user: data.user });
}
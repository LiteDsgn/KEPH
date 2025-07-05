import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/database';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const next = requestUrl.searchParams.get('next') ?? '/';

  if (token_hash && type) {
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

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        type: type as any,
        token_hash,
      });

      if (error) {
        console.error('Error verifying email confirmation:', error);
        return NextResponse.redirect(
          `${requestUrl.origin}/auth/auth-error?message=${encodeURIComponent(
            'Email verification failed. The link may be expired or invalid.'
          )}`
        );
      }

      if (data.user) {
        // Check if user exists in our users table, if not create them
        const { data: existingUser, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .single();

        if (userError && userError.code === 'PGRST116') {
          // User doesn't exist, create them
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              full_name: data.user.user_metadata?.full_name || '',
              avatar_url: data.user.user_metadata?.avatar_url || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            console.error('Error creating user record:', insertError);
            // Don't fail the auth flow, just log the error
          }
        }
      }

      // Successful email verification, redirect to the app
      return NextResponse.redirect(`${requestUrl.origin}${next}`);
    } catch (error) {
      console.error('Unexpected error in email confirmation:', error);
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/auth-error?message=${encodeURIComponent(
          'Email verification failed due to an unexpected error.'
        )}`
      );
    }
  }

  // Missing required parameters
  return NextResponse.redirect(
    `${requestUrl.origin}/auth/auth-error?message=${encodeURIComponent(
      'Invalid email verification link.'
    )}`
  );
}
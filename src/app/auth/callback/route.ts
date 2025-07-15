import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/database';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';

  if (code) {
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
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Error exchanging code for session:', error);
        return NextResponse.redirect(`${requestUrl.origin}/auth/auth-error?message=${encodeURIComponent(error.message)}`);
      }

      if (data.user) {
        console.log('OAuth callback - User:', data.user.email, 'Session:', !!data.session);
        
        // Check if user profile exists, create if missing (fallback for existing users)
        const { data: existingUser, error: userCheckError } = await supabase
          .from('users')
          .select('id, full_name, avatar_url')
          .eq('id', data.user.id)
          .single();
          
        if (userCheckError && userCheckError.code === 'PGRST116') {
          // User doesn't exist in public.users table, create profile
          console.log('Creating missing profile for existing OAuth user:', data.user.email);
          
          const { error: userInsertError } = await supabase.from('users').insert({
             id: data.user.id,
             email: data.user.email!,
             full_name: data.user.user_metadata?.full_name || null,
             avatar_url: data.user.user_metadata?.avatar_url || null
           });
          
          if (userInsertError) {
            console.error('Error creating user profile:', userInsertError);
          } else {
            // Create default category for the user
            const { error: categoryError } = await supabase.from('categories').insert({
              name: 'General',
              user_id: data.user.id,
              color: '#6366f1'
            });
            
            if (categoryError) {
              console.error('Error creating default category:', categoryError);
            }
          }
        } else if (existingUser) {
          // User exists, update metadata if it has changed
          const newFullName = data.user.user_metadata?.full_name || null;
          const newAvatarUrl = data.user.user_metadata?.avatar_url || null;
          
          if (newFullName !== existingUser.full_name || newAvatarUrl !== existingUser.avatar_url) {
            const { error: updateError } = await supabase.from('users')
                .update({
                  full_name: newFullName,
                  avatar_url: newAvatarUrl,
                  updated_at: new Date().toISOString()
                })
                .eq('id', data.user.id);
               
            if (updateError) {
              console.error('Error updating user metadata:', updateError);
            } else {
              console.log('Updated user metadata for:', data.user.email);
            }
          }
        }
      }

      // Successful authentication, redirect to the app
      // Default to /dashboard for authenticated users
      const redirectUrl = next === '/' ? '/dashboard' : next;
      return NextResponse.redirect(`${requestUrl.origin}${redirectUrl}`);
    } catch (error) {
      console.error('Unexpected error in auth callback:', error);
      return NextResponse.redirect(`${requestUrl.origin}/auth/auth-error?message=${encodeURIComponent('Authentication failed')}`);
    }
  }

  // No code parameter, redirect to home with error
  return NextResponse.redirect(`${requestUrl.origin}/auth/auth-error?message=${encodeURIComponent('No authorization code received')}`);
}
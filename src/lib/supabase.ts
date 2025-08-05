import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
  cookies: {
    get: (key) => {
      if (typeof window === 'undefined') return undefined;
      const cookies = document.cookie ? document.cookie.split('; ') : [];
      const cookie = cookies.find(c => c.startsWith(`${key}=`));
      return cookie ? decodeURIComponent(cookie.split('=')[1]) : undefined;
    },
    set: (key, value, options) => {
      if (typeof window === 'undefined') return;
      document.cookie = `${key}=${encodeURIComponent(value)}; ${Object.entries(options).map(([k, v]) => `${k}=${v}`).join('; ')}`;
    },
    remove: (key, options) => {
      if (typeof window === 'undefined') return;
      document.cookie = `${key}=; Max-Age=0; ${Object.entries(options).map(([k, v]) => `${k}=${v}`).join('; ')}`;
    },
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any, context: string) {
  console.error(`Supabase error in ${context}:`, error);
  throw new Error(`Database operation failed: ${error.message || 'Unknown error'}`);
}

// Helper function to get current user ID
export const getCurrentUserId = async (): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    throw new Error('User not authenticated');
  }
  return user.id;
};
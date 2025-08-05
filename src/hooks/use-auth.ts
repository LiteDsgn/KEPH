'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null
  });

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
          error: null
        });
      } catch (error: any) {
        setAuthState({
          user: null,
          session: null,
          loading: false,
          error: error.message || 'Failed to get session'
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
          error: null
        });

        // Clear any cached data when user logs out
        if (event === 'SIGNED_OUT') {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('supabase-tasks-cache');
            localStorage.removeItem('supabase-categories-cache');
            localStorage.removeItem('supabase-last-sync');
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign up with email and password
  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || ''
          }
        }
      });

      if (error) throw error;

      // Note: User will need to confirm email before they can sign in
      return { data, error: null };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sign up';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { data: null, error: errorMessage };
    }
  }, []);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }

      const { user } = await response.json();

      // Refresh client session
      const { data: { session } } = await supabase.auth.getSession();

      setAuthState(prev => ({
        ...prev,
        user,
        session,
        loading: false,
        error: null
      }));

      return { data: { user, session }, error: null };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sign in';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { data: null, error: errorMessage };
    }
  }, []);

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sign in with Google';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { data: null, error: errorMessage };
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sign out';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { error: errorMessage };
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send reset email';
      return { data: null, error: errorMessage };
    }
  }, []);

  // Update password
  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update password';
      return { data: null, error: errorMessage };
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (updates: { full_name?: string; avatar_url?: string }) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      });

      if (error) throw error;

      // Also update the users table
      if (authState.user) {
        const { error: profileError } = await supabase
          .from('users')
          .update({
            full_name: updates.full_name,
            avatar_url: updates.avatar_url
          })
          .eq('id', authState.user.id);

        if (profileError) {
          console.error('Error updating profile in users table:', profileError);
        }
      }

      return { data, error: null };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update profile';
      return { data: null, error: errorMessage };
    }
  }, [authState.user]);

  // Clear error
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...authState,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    clearError,
    isAuthenticated: !!authState.user
  };
}
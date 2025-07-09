import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../use-auth';
import { supabase } from '@/lib/supabase';
import { mockUser, mockSupabaseResponse } from '@/__tests__/test-utils';

// Mock the supabase module
jest.mock('@/lib/supabase');
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn()
  })
}));

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default auth mocks
    mockSupabase.auth = {
      getUser: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      signInWithOAuth: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      })),
      getSession: jest.fn()
    } as any;
    
    // Setup default getSession mock
    (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue(mockSupabaseResponse({ session: null }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue(mockSupabaseResponse({ session: null }));
      
      const { result } = renderHook(() => useAuth());
      
      expect(result.current.user).toBe(null);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBe(null);
    });

    it('should load authenticated user on mount', async () => {
      const mockSession = { user: mockUser, access_token: 'token' };
      (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue(mockSupabaseResponse({ session: mockSession }));
      
      const { result } = renderHook(() => useAuth());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });
      
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.error).toBe(null);
    });
  });

  describe('signIn', () => {
    it('should sign in successfully with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const mockSession = { user: mockUser, access_token: 'token' };
      (mockSupabase.auth.signInWithPassword as jest.Mock).mockResolvedValue(
        mockSupabaseResponse({ user: mockUser, session: mockSession })
      );
      
      let authStateChangeCallback: any;
      (mockSupabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback: any) => {
        authStateChangeCallback = callback;
        return {
          data: { subscription: { unsubscribe: jest.fn() } }
        };
      });
      
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await result.current.signIn(credentials.email, credentials.password);
        // Simulate the auth state change that would happen after signIn
        authStateChangeCallback('SIGNED_IN', mockSession);
      });
      
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith(credentials);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.error).toBe(null);
    });

    it('should handle sign in errors', async () => {
      const errorMessage = 'Invalid login credentials';
      (mockSupabase.auth.signInWithPassword as jest.Mock).mockResolvedValue(
        mockSupabaseResponse(null, { message: errorMessage })
      );
      
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await result.current.signIn('test@example.com', 'wrongpassword');
      });
      
      expect(result.current.user).toBe(null);
      expect(result.current.error).toBe(errorMessage);
    });

    it('should set loading state during sign in', async () => {
      let resolveSignIn: (value: any) => void;
      const signInPromise = new Promise(resolve => {
        resolveSignIn = resolve;
      });
      
      (mockSupabase.auth.signInWithPassword as jest.Mock).mockReturnValue(signInPromise as any);
      
      const { result } = renderHook(() => useAuth());
      
      act(() => {
        result.current.signIn('test@example.com', 'password123');
      });
      
      expect(result.current.loading).toBe(true);
      
      await act(async () => {
        resolveSignIn!(mockSupabaseResponse({ user: mockUser, session: {} }));
        await signInPromise;
      });
      
      expect(result.current.loading).toBe(false);
    });
  });

  describe('signUp', () => {
    it('should sign up successfully with valid data', async () => {
      const signUpData = {
        email: 'newuser@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'New User'
          }
        }
      };
      
      (mockSupabase.auth.signUp as jest.Mock).mockResolvedValue(
        mockSupabaseResponse({ user: mockUser, session: null })
      );
      
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await result.current.signUp(
          signUpData.email,
          signUpData.password,
          'New User'
        );
      });
      
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith(signUpData);
      expect(result.current.error).toBe(null);
    });

    it('should handle sign up errors', async () => {
      const errorMessage = 'User already registered';
      (mockSupabase.auth.signUp as jest.Mock).mockResolvedValue(
        mockSupabaseResponse(null, { message: errorMessage })
      );
      
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await result.current.signUp('existing@example.com', 'password123', 'User');
      });
      
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('signInWithGoogle', () => {
    it('should initiate Google OAuth sign in', async () => {
      (mockSupabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue(
        mockSupabaseResponse({ url: 'https://oauth-url.com' })
      );
      
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await result.current.signInWithGoogle();
      });
      
      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/auth/callback')
        }
      });
    });

    it('should handle Google OAuth errors', async () => {
      const errorMessage = 'OAuth provider error';
      (mockSupabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue(
        mockSupabaseResponse(null, { message: errorMessage })
      );
      
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await result.current.signInWithGoogle();
      });
      
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      // Setup authenticated state first
      const mockSession = { user: mockUser, access_token: 'token' };
      (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue(mockSupabaseResponse({ session: mockSession }));
      (mockSupabase.auth.signOut as jest.Mock).mockResolvedValue(mockSupabaseResponse({}));
      
      let authStateChangeCallback: any;
      (mockSupabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback: any) => {
        authStateChangeCallback = callback;
        return {
          data: { subscription: { unsubscribe: jest.fn() } }
        };
      });
      
      const { result } = renderHook(() => useAuth());
      
      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });
      
      await act(async () => {
        await result.current.signOut();
        // Simulate the auth state change that would happen after signOut
        authStateChangeCallback('SIGNED_OUT', null);
      });
      
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      expect(result.current.user).toBe(null);
    });

    it('should handle sign out errors', async () => {
      const errorMessage = 'Sign out failed';
      (mockSupabase.auth.signOut as jest.Mock).mockResolvedValue(
        mockSupabaseResponse(null, { message: errorMessage })
      );
      
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        const result_obj = await result.current.signOut();
        expect(result_obj.error).toBe(errorMessage);
      });
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      // Setup error state
      (mockSupabase.auth.signInWithPassword as jest.Mock).mockResolvedValue(
        mockSupabaseResponse(null, { message: 'Test error' })
      );
      
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await result.current.signIn('test@example.com', 'wrongpassword');
      });
      
      expect(result.current.error).toBe('Test error');
      
      act(() => {
        result.current.clearError();
      });
      
      expect(result.current.error).toBe(null);
    });
  });

  describe('auth state changes', () => {
    it('should handle auth state changes', async () => {
      const mockUnsubscribe = jest.fn();
      const mockAuthStateChange = jest.fn();
      
      (mockSupabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback: any) => {
        mockAuthStateChange.mockImplementation(callback);
        return {
          data: { subscription: { unsubscribe: mockUnsubscribe } }
        };
      });
      
      const { result, unmount } = renderHook(() => useAuth());
      
      // Simulate auth state change
      act(() => {
        mockAuthStateChange('SIGNED_IN', { user: mockUser });
      });
      
      expect(result.current.user).toEqual(mockUser);
      
      // Simulate sign out
      act(() => {
        mockAuthStateChange('SIGNED_OUT', null);
      });
      
      expect(result.current.user).toBe(null);
      
      // Cleanup
      unmount();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });
});
// Mock the createClient function
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn()
    }
  }))
}));

import { handleSupabaseError, getCurrentUserId, supabase } from '../supabase';
import { mockUser, mockSupabaseResponse } from '@/__tests__/test-utils';

// Get the mocked functions
const mockHandleSupabaseError = handleSupabaseError as jest.MockedFunction<typeof handleSupabaseError>;
const mockGetCurrentUserId = getCurrentUserId as jest.MockedFunction<typeof getCurrentUserId>;

describe('Supabase utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleSupabaseError', () => {
    it('should be defined', () => {
      expect(handleSupabaseError).toBeDefined();
    });
  });

  describe('getCurrentUserId', () => {
    it('should be defined', () => {
      expect(getCurrentUserId).toBeDefined();
    });
  });

  describe('supabase client', () => {
    it('should be defined', () => {
      expect(supabase).toBeDefined();
    });
  });
});
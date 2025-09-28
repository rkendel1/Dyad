import { describe, it, expect } from 'vitest';

// Simple integration test focusing on the local Supabase functionality
describe('Local Supabase Integration', () => {
  describe('getSupabaseProjectName', () => {
    it('should return "Local Supabase" for local-supabase project ID', async () => {
      const { getSupabaseProjectName } = await import('../supabase_admin/supabase_management_client');
      const result = await getSupabaseProjectName('local-supabase');
      expect(result).toBe('Local Supabase');
    });
  });
});
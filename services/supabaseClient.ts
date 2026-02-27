import { createClient } from '@supabase/supabase-js';

/**
 * Graceful Path Global Health - Supabase Connection
 * This client manages the connection to the backend database and authentication.
 */

// Retrieve environment variables from Vite's import.meta.env
// We cast to any to prevent TypeScript from complaining about the dynamic env property
const env = (import.meta as any).env || {};

const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

// Debugging check to ensure your .env file is being read correctly
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase configuration missing: Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY " +
    "are correctly set in your environment or .env file."
  );
}

// Initialize the Supabase client once for use throughout the entire application
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

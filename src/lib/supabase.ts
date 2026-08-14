import { createClient } from '@supabase/supabase-js';

// Environment variables
const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || '';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Utility helper to log Supabase connectivity status
 */
export function getSupabaseStatusMessage(): string {
  if (isSupabaseConfigured) {
    return 'Connected to Live Supabase Backend & Realtime Database';
  }
  return 'Running in Full Interactive Client State Mode (Supabase SQL Schema ready for deployment)';
}

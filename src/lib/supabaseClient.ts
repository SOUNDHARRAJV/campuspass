import { createClient } from '@supabase/supabase-js';

export const SUPABASE_CONFIG = {
  url: ((import.meta as any).env?.VITE_SUPABASE_URL as string) || 'https://waqchjsefsnutormvori.supabase.co',
  anonKey: ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhcWNoanNlZnNudXRvcm12b3JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAxNTAwMDAwMH0.placeholder',
};

export const GOOGLE_OAUTH_CONFIG = {
  clientId: ((import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string) || '84058142962-mdv07qgufchoggstolt1rtb8pt3s3l2p.apps.googleusercontent.com',
  callbackUrl: 'https://waqchjsefsnutormvori.supabase.co/auth/v1/callback',
};

export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

export async function signInWithGoogleOAuth() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  if (error) throw error;
  return data;
}

/**
 * 1. SUPABASE AUTH: Parent Mobile OTP Login
 * 
 * Example usage:
 * await supabase.auth.signInWithOtp({
 *   phone: '+919812345678',
 *   options: {
 *     shouldCreateUser: true,
 *   }
 * });
 * 
 * Verify OTP:
 * await supabase.auth.verifyOtp({
 *   phone: '+919812345678',
 *   token: '1234',
 *   type: 'sms'
 * });
 */

/**
 * 2. DATABASE SCHEMA (SQL):
 * 
 * CREATE TABLE parents (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   name TEXT NOT NULL,
 *   phone VARCHAR(20) UNIQUE NOT NULL,
 *   email TEXT,
 *   created_at TIMESTAMPTZ DEFAULT now()
 * );
 * 
 * CREATE TABLE ward_students (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   parent_id UUID REFERENCES parents(id),
 *   student_name TEXT NOT NULL,
 *   register_number VARCHAR(50) UNIQUE NOT NULL,
 *   department TEXT NOT NULL,
 *   hostel_block TEXT NOT NULL
 * );
 * 
 * CREATE TABLE leave_requests (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   student_id UUID REFERENCES ward_students(id),
 *   leave_type VARCHAR(20) NOT NULL, -- 'LEAVE', 'OD', 'EMERGENCY'
 *   leave_title TEXT NOT NULL,
 *   is_emergency BOOLEAN DEFAULT false,
 *   parent_status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'SKIPPED'
 *   advisor_status VARCHAR(20) DEFAULT 'PENDING',
 *   warden_status VARCHAR(20) DEFAULT 'PENDING',
 *   status VARCHAR(20) DEFAULT 'SUBMITTED',
 *   created_at TIMESTAMPTZ DEFAULT now()
 * );
 * 
 * CREATE TABLE gate_movements (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   request_id UUID REFERENCES leave_requests(id),
 *   event_type VARCHAR(10) NOT NULL, -- 'EXIT', 'ENTRY'
 *   gate_name TEXT DEFAULT 'Main Gate 1',
 *   timestamp TIMESTAMPTZ DEFAULT now()
 * );
 * 
 * 3. SUPABASE REALTIME & EDGE FUNCTION TRIGGER:
 * 
 * CREATE OR REPLACE FUNCTION notify_parent_gate_movement()
 * RETURNS TRIGGER AS $$
 * BEGIN
 *   -- Triggers HTTP request to Twilio/Fast2SMS Edge Function
 *   PERFORM net.http_post(
 *     url := 'https://campus-pass.supabase.co/functions/v1/send-parent-sms',
 *     headers := '{"Content-Type": "application/json"}',
 *     body := json_build_object(
 *       'request_id', NEW.request_id,
 *       'event_type', NEW.event_type,
 *       'timestamp', NEW.timestamp
 *     )::text
 *   );
 *   RETURN NEW;
 * END;
 * $$ LANGUAGE plpgsql;
 * 
 * CREATE TRIGGER trigger_notify_parent
 * AFTER INSERT ON gate_movements
 * FOR EACH ROW EXECUTE FUNCTION notify_parent_gate_movement();
 */

export const mockSupabaseLoginWithOtp = async (phone: string, otp: string) => {
  return new Promise<{ success: boolean; token: string }>((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        token: `sb-token-${Date.now()}`
      });
    }, 500);
  });
};

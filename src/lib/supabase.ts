/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || (typeof process !== 'undefined' ? process.env : {}) || {};

export const getSupabaseConfig = () => {
  let customUrl = '';
  let customKey = '';
  try {
    if (typeof localStorage !== 'undefined') {
      customUrl = localStorage.getItem('custom_supabase_url') || '';
      customKey = localStorage.getItem('custom_supabase_key') || '';
    }
  } catch {}

  const supabaseUrl = customUrl || env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = customKey || env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || '';
  return { supabaseUrl, supabaseAnonKey };
};

export const isSupabaseConfigured = (): boolean => {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseUrl.startsWith('https://')
  );
};

let clientInstance: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  if (!isSupabaseConfigured()) return null;

  if (!clientInstance || lastUrl !== supabaseUrl || lastKey !== supabaseAnonKey) {
    lastUrl = supabaseUrl;
    lastKey = supabaseAnonKey;
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return clientInstance;
};

export const setCustomSupabaseConfig = (url: string, key: string) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('custom_supabase_url', url.trim());
    localStorage.setItem('custom_supabase_key', key.trim());
  }
  clientInstance = null; // force reload client
};

export const supabase: SupabaseClient | null = getSupabaseClient();

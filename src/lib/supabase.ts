/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || (typeof process !== 'undefined' ? process.env : {}) || {};

export const normalizeSupabaseUrl = (rawUrl: string): string => {
  if (!rawUrl) return '';
  let url = rawUrl.trim();

  // If user pasted dashboard URL: https://supabase.com/dashboard/project/<ref>
  const dashboardMatch = url.match(/supabase\.com\/dashboard\/project\/([a-z0-9_-]+)/i);
  if (dashboardMatch) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  // Ensure scheme
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  try {
    const parsed = new URL(url);
    if (parsed.hostname.endsWith('supabase.co')) {
      // Standard Supabase domain: must only have the host origin, without /rest/v1 or trailing slash
      return `https://${parsed.host}`;
    }
    // Self-hosted: strip trailing /rest/v1 or /auth/v1 or /storage/v1
    const cleanPath = parsed.pathname.replace(/\/(rest|auth|storage)\/v1\/?$/i, '').replace(/\/+$/, '');
    return `${parsed.origin}${cleanPath}`;
  } catch {
    return url.replace(/\/+$/, '');
  }
};

export const getSupabaseConfig = () => {
  let customUrl = '';
  let customKey = '';
  try {
    if (typeof localStorage !== 'undefined') {
      customUrl = localStorage.getItem('custom_supabase_url') || '';
      customKey = localStorage.getItem('custom_supabase_key') || '';
    }
  } catch {}

  const rawUrl = customUrl || env.VITE_SUPABASE_URL || '';
  const supabaseUrl = normalizeSupabaseUrl(rawUrl);
  const supabaseAnonKey = (customKey || env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || '').trim();
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
  const cleanUrl = normalizeSupabaseUrl(url);
  const cleanKey = key.trim();
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('custom_supabase_url', cleanUrl);
    localStorage.setItem('custom_supabase_key', cleanKey);
  }
  clientInstance = null; // force reload client
};

export const supabase: SupabaseClient | null = getSupabaseClient();

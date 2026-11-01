import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertTriangle,
  Copy,
  ExternalLink,
  Save,
  RefreshCw,
  Server,
  Cloud
} from 'lucide-react';
import { getSupabaseConfig, setCustomSupabaseConfig } from '../../lib/supabase';
import { supabaseService } from '../../services/supabaseService';
import { useTasks } from '../../context/TaskContext';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const { isSupabaseConnected } = useTasks();

  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getSupabaseConfig();
      setUrl(config.supabaseUrl);
      setAnonKey(config.supabaseAnonKey);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) return;

    setTesting(true);
    setTestResult(null);

    try {
      // 1. Update in-memory & localStorage config
      setCustomSupabaseConfig(url.trim(), anonKey.trim());

      // 2. Persist to server .env
      try {
        await fetch('/api/config/supabase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() })
        });
      } catch {}

      // 3. Verify real connectivity
      const isConnected = await supabaseService.verifyConnection();
      if (isConnected) {
        setTestResult({
          success: true,
          message: 'Connected to Supabase successfully! All devices will now sync through this database.'
        });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setTestResult({
          success: false,
          message: 'Could not connect. Please ensure your project is unpaused on supabase.com and that the URL and Anon Key are correct.'
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Connection test failed'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleCopySql = () => {
    fetch('/supabase_schema.sql')
      .then(r => r.text())
      .then(text => {
        navigator.clipboard.writeText(text);
        setCopiedSql(true);
        setTimeout(() => setCopiedSql(false), 2500);
      })
      .catch(() => {
        setCopiedSql(true);
        setTimeout(() => setCopiedSql(false), 2500);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-[var(--text-faint)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)] transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-[var(--text-main)]">
              Supabase Cloud Database Settings
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  isSupabaseConnected
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                {isSupabaseConnected ? 'Live Cloud Connected' : 'Disconnected / Needs Configuration'}
              </span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-5 p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-[var(--text-main)] space-y-1.5">
          <p className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" />
            <span>Multi-Device Cross-Cloud Sync</span>
          </p>
          <p className="text-[11px] text-[var(--text-muted)]">
            Connecting an active Supabase project allows students across multiple devices and networks to share real-time logins, deadlines, assignments, and timetable data.
          </p>
        </div>

        {/* Status Alerts */}
        {testResult && (
          <div
            className={`mb-5 p-3.5 rounded-2xl border text-xs font-medium flex items-start gap-2.5 ${
              testResult.success
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Config Form */}
        <form onSubmit={handleTestAndSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">
              Supabase Project URL *
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://your-project-id.supabase.co"
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-2.5 text-xs text-[var(--text-main)] font-mono focus:border-indigo-500 focus:outline-none"
            />
            <p className="text-[10px] text-[var(--text-faint)] mt-1">
              Found under: Supabase Dashboard &gt; Project Settings &gt; API &gt; Project URL
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">
              Supabase Anon / Public API Key *
            </label>
            <textarea
              required
              rows={2}
              value={anonKey}
              onChange={e => setAnonKey(e.target.value)}
              placeholder="sb_publishable_... or eyJhbGciOi..."
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-2 text-xs text-[var(--text-main)] font-mono focus:border-indigo-500 focus:outline-none resize-none"
            />
            <p className="text-[10px] text-[var(--text-faint)] mt-1">
              Found under: Supabase Dashboard &gt; Project Settings &gt; API &gt; Project API keys (anon public)
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Supabase Dashboard</span>
            </a>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCopySql}
                className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                title="Copy schema SQL to paste in Supabase SQL editor"
              >
                {copiedSql ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSql ? 'SQL Copied!' : 'Copy SQL Schema'}</span>
              </button>

              <button
                type="submit"
                disabled={testing}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl gradient-brand-bg text-white text-xs font-bold shadow-md shadow-indigo-500/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{testing ? 'Testing...' : 'Save & Connect'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};


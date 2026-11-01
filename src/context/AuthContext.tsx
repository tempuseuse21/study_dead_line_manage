import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface StudentProfile {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  registeredAt: string;
  role: 'student' | 'cr_admin';
}

interface AuthContextType {
  user: StudentProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  loginStudent: (studentIdOrEmail: string, passwordInput: string) => Promise<{ success: boolean; error?: string }>;
  registerStudent: (input: {
    studentId: string;
    fullName: string;
    registrationCode: string;
    password: string;
    confirmPassword: string;
  }) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (input: {
    studentId: string;
    registrationCode: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authMode: 'login' | 'register' | 'forgot_password';
  setAuthMode: (mode: 'login' | 'register' | 'forgot_password') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Legacy student IDs are mapped to a stable email-shaped Supabase Auth identity.
// Prefer asking users for their real email address when accounts are provisioned.
const toAuthEmail = (value: string) => {
  const normalized = value.trim().toLowerCase();
  return normalized.includes('@') ? normalized : `${normalized}@mscit.edu`;
};

const mapAuthUser = (authUser: any): StudentProfile | null => {
  if (!authUser) return null;
  const metadata = authUser.user_metadata || {};
  const appMetadata = authUser.app_metadata || {};
  const role = appMetadata.role === 'admin' || appMetadata.role === 'cr' ? 'cr_admin' : 'student';
  return {
    id: authUser.id,
    studentId: metadata.student_id || authUser.email?.split('@')[0] || '',
    fullName: metadata.full_name || metadata.name || authUser.email?.split('@')[0] || 'Student',
    email: authUser.email || '',
    registeredAt: authUser.created_at || new Date().toISOString(),
    role
  };
};

const unavailableMessage = 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or the legacy VITE_SUPABASE_ANON_KEY).';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot_password'>('login');

  useEffect(() => {
    if (!supabase || !isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) console.error('Unable to restore Supabase session:', error.message);
      setUser(mapAuthUser(data.session?.user));
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(mapAuthUser(session?.user));
      setIsLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const isAdmin = user?.role === 'cr_admin';

  const loginStudent = async (studentIdOrEmail: string, passwordInput: string) => {
    if (!supabase || !isSupabaseConfigured()) return { success: false, error: unavailableMessage };
    if (!studentIdOrEmail.trim() || !passwordInput) return { success: false, error: 'Student ID/email and password are required.' };

    const { error } = await supabase.auth.signInWithPassword({
      email: toAuthEmail(studentIdOrEmail),
      password: passwordInput
    });
    if (error) return { success: false, error: error.message };
    setShowAuthModal(false);
    return { success: true };
  };

  const registerStudent = async (_input: {
    studentId: string;
    fullName: string;
    registrationCode: string;
    password: string;
    confirmPassword: string;
  }) => ({
    success: false,
    error: 'Self-registration is currently disabled for security. Ask your portal administrator to create/invite your Supabase Auth account, then sign in using the invited email address.'
  });

  const resetPassword = async (_input: {
    studentId: string;
    registrationCode: string;
    newPassword: string;
    confirmPassword: string;
  }) => ({
    success: false,
    error: 'Password recovery must use the verified email address attached to your Supabase Auth account. Please ask the portal administrator to send a password recovery link.'
  });

  const logout = async () => {
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) console.error('Supabase sign-out failed:', error.message);
    }
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    isAdmin,
    loginStudent,
    registerStudent,
    resetPassword,
    logout,
    showAuthModal,
    setShowAuthModal,
    authMode,
    setAuthMode
  }), [user, isLoading, isAdmin, showAuthModal, authMode]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

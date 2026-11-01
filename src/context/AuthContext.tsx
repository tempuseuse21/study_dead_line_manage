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

const toAuthEmail = (value: string) => {
  const normalized = value.trim().toLowerCase();
  return normalized.includes('@') ? normalized : `${normalized}@mscit.edu`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StudentProfile | null>(() => {
    try {
      const stored = localStorage.getItem('mscit_current_student');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot_password'>('login');

  useEffect(() => {
    // If no student profile stored yet, provide default student session
    const stored = localStorage.getItem('mscit_current_student');
    if (!stored && !user) {
      const defaultUser: StudentProfile = {
        id: 'usr_202612045',
        studentId: '202612045',
        fullName: 'Student User',
        email: '202612045@mscit.edu',
        registeredAt: new Date().toISOString(),
        role: 'student'
      };
      setUser(defaultUser);
      localStorage.setItem('mscit_current_student', JSON.stringify(defaultUser));
    }
  }, [user]);

  const isAdmin = user?.role === 'cr_admin' || localStorage.getItem('studysync_is_admin') === 'true';

  const loginStudent = async (studentIdOrEmail: string, passwordInput: string): Promise<{ success: boolean; error?: string }> => {
    const cleanId = studentIdOrEmail.trim();
    if (!cleanId || !passwordInput) {
      return { success: false, error: 'Student ID and password are required.' };
    }

    // Special CR Admin Login
    if (cleanId.toLowerCase() === 'admin' && (passwordInput === 'mscit2026' || passwordInput === 'iamcr')) {
      const adminUser: StudentProfile = {
        id: 'usr_admin',
        studentId: 'admin',
        fullName: 'CR Admin',
        email: 'admin@mscit.edu',
        registeredAt: new Date().toISOString(),
        role: 'cr_admin'
      };
      setUser(adminUser);
      localStorage.setItem('mscit_current_student', JSON.stringify(adminUser));
      localStorage.setItem('studysync_is_admin', 'true');
      setShowAuthModal(false);
      return { success: true };
    }

    // Attempt local API login backed by data/database.json
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: cleanId, password: passwordInput })
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('mscit_current_student', JSON.stringify(data.user));
        if (data.user.role === 'cr_admin') {
          localStorage.setItem('studysync_is_admin', 'true');
        }
        setShowAuthModal(false);
        return { success: true };
      }
      if (!res.ok && data.error) {
        return { success: false, error: data.error };
      }
    } catch {
      // Local API unreachable, try Supabase if configured
      if (supabase && isSupabaseConfigured()) {
        try {
          const { data: sbData, error: sbErr } = await supabase.auth.signInWithPassword({
            email: toAuthEmail(cleanId),
            password: passwordInput
          });
          if (sbErr) return { success: false, error: sbErr.message };
          if (sbData.user) {
            const mapped: StudentProfile = {
              id: sbData.user.id,
              studentId: sbData.user.user_metadata?.student_id || cleanId,
              fullName: sbData.user.user_metadata?.full_name || 'Student',
              email: sbData.user.email || `${cleanId}@mscit.edu`,
              registeredAt: sbData.user.created_at || new Date().toISOString(),
              role: 'student'
            };
            setUser(mapped);
            localStorage.setItem('mscit_current_student', JSON.stringify(mapped));
            setShowAuthModal(false);
            return { success: true };
          }
        } catch (err: any) {
          return { success: false, error: err.message || 'Supabase authentication failed' };
        }
      }
    }

    return { success: false, error: 'Invalid Student ID or password. Try student ID 202612045 or admin.' };
  };

  const registerStudent = async (input: {
    studentId: string;
    fullName: string;
    registrationCode: string;
    password: string;
    confirmPassword: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!input.studentId.trim() || !input.fullName.trim() || !input.password) {
      return { success: false, error: 'All fields are required.' };
    }
    if (input.password !== input.confirmPassword) {
      return { success: false, error: 'Passwords do not match.' };
    }
    if (input.password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters long.' };
    }
    if (input.registrationCode.trim() !== 'MSCIT2026') {
      return { success: false, error: 'Invalid Registration Code. Default batch code is MSCIT2026.' };
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: input.studentId.trim(),
          fullName: input.fullName.trim(),
          registrationCode: input.registrationCode.trim(),
          password: input.password
        })
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('mscit_current_student', JSON.stringify(data.user));
        setShowAuthModal(false);
        return { success: true };
      }
      return { success: false, error: data.error || 'Registration failed.' };
    } catch {
      return { success: false, error: 'Could not connect to server for registration.' };
    }
  };

  const resetPassword = async (input: {
    studentId: string;
    registrationCode: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!input.studentId.trim() || !input.newPassword) {
      return { success: false, error: 'Student ID and new password are required.' };
    }
    if (input.newPassword !== input.confirmPassword) {
      return { success: false, error: 'Passwords do not match.' };
    }
    if (input.newPassword.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters long.' };
    }
    if (input.registrationCode.trim() !== 'MSCIT2026') {
      return { success: false, error: 'Invalid Registration Code. Default batch code is MSCIT2026.' };
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: input.studentId.trim(),
          registrationCode: input.registrationCode.trim(),
          newPassword: input.newPassword
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true };
      }
      return { success: false, error: data.error || 'Password reset failed.' };
    } catch {
      return { success: false, error: 'Could not connect to server for password reset.' };
    }
  };

  const logout = async () => {
    localStorage.removeItem('mscit_current_student');
    localStorage.removeItem('studysync_is_admin');
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    setUser(null);
    setShowAuthModal(true);
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

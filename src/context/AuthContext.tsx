import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured, getSupabaseClient } from '../lib/supabase';
import { supabaseService } from '../services/supabaseService';

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
  loginStudent: (studentIdOrName: string, passwordInput: string) => Promise<{ success: boolean; error?: string }>;
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
  updateProfile?: (data: Partial<StudentProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  const [showAuthModal, setShowAuthModal] = useState(() => {
    return !localStorage.getItem('mscit_current_student');
  });
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot_password'>('login');

  const isAdmin = user?.role === 'cr_admin' || localStorage.getItem('studysync_is_admin') === 'true';

  const loginStudent = async (studentIdOrName: string, passwordInput: string): Promise<{ success: boolean; error?: string }> => {
    const cleanInput = studentIdOrName.trim();
    if (!cleanInput || !passwordInput) {
      return { success: false, error: 'Student ID / Name and password are required.' };
    }

    // Special CR Admin Fast Login
    if (cleanInput.toLowerCase() === 'admin' && (passwordInput === 'mscit2026' || passwordInput === 'iamcr')) {
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

    // 1. Prioritize Cloud Supabase Database if live & reachable
    let isCloudLive = false;
    try {
      isCloudLive = await supabaseService.verifyConnection();
    } catch {
      isCloudLive = false;
    }

    if (isCloudLive) {
      try {
        const cloudRes = await supabaseService.loginWithSupabase(cleanInput, passwordInput);
        if (cloudRes.success && cloudRes.user) {
          setUser(cloudRes.user);
          localStorage.setItem('mscit_current_student', JSON.stringify(cloudRes.user));
          if (cloudRes.user.role === 'cr_admin') {
            localStorage.setItem('studysync_is_admin', 'true');
          }
          setShowAuthModal(false);
          return { success: true };
        }
        // If duplicate name validation error, return immediately
        if (cloudRes.error && cloudRes.error.includes('Multiple students have the name')) {
          return { success: false, error: cloudRes.error };
        }
      } catch (err) {
        console.warn('Supabase cloud login error, proceeding to central fallback:', err);
      }
    }

    // 2. Central API fallback (disk-backed database.json)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanInput, password: passwordInput })
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
      if (data.error) {
        return { success: false, error: data.error };
      }
    } catch {
      return { success: false, error: 'Database server unreachable. Please check connection.' };
    }

    return { success: false, error: 'Invalid login credentials. Please check your Student ID / Name and password.' };
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

    // 1. Register in Supabase Database if available
    let isCloudLive = false;
    try {
      isCloudLive = await supabaseService.verifyConnection();
    } catch {
      isCloudLive = false;
    }

    if (isCloudLive) {
      try {
        const cloudRes = await supabaseService.registerWithSupabase({
          studentId: input.studentId.trim(),
          fullName: input.fullName.trim(),
          password: input.password,
          registrationCode: input.registrationCode.trim()
        });
        if (cloudRes.success && cloudRes.user) {
          try {
            await fetch('/api/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                studentId: input.studentId.trim(),
                fullName: input.fullName.trim(),
                registrationCode: input.registrationCode.trim(),
                password: input.password
              })
            });
          } catch {}

          setUser(cloudRes.user);
          localStorage.setItem('mscit_current_student', JSON.stringify(cloudRes.user));
          setShowAuthModal(false);
          return { success: true };
        }
        if (cloudRes.error && !cloudRes.error.includes('Invalid path') && !cloudRes.error.includes('misconfigured')) {
          return { success: false, error: cloudRes.error };
        }
      } catch (err) {
        console.warn('Supabase registration error, falling back to central DB:', err);
      }
    }

    // 2. Central API registration fallback
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
      return { success: false, error: 'Could not connect to database for registration.' };
    }
  };

  const resetPassword = async (input: {
    studentId: string;
    registrationCode: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const cleanInput = input.studentId.trim();
    if (!cleanInput || !input.newPassword) {
      return { success: false, error: 'Student ID / Name and new password are required.' };
    }
    if (input.newPassword !== input.confirmPassword) {
      return { success: false, error: 'Passwords do not match.' };
    }
    if (input.newPassword.length < 4) {
      return { success: false, error: 'New password must be at least 4 characters long.' };
    }
    if (input.registrationCode.trim() !== 'MSCIT2026') {
      return { success: false, error: 'Invalid Registration Code. Default batch code is MSCIT2026.' };
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: cleanInput,
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
      return { success: false, error: 'Could not connect to database for password reset.' };
    }
  };

  const updateProfile = (data: Partial<StudentProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('mscit_current_student', JSON.stringify(updated));
  };

  const logout = async () => {
    localStorage.removeItem('mscit_current_student');
    localStorage.removeItem('studysync_is_admin');
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.auth.signOut();
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
    setAuthMode,
    updateProfile
  }), [user, isLoading, isAdmin, showAuthModal, authMode]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

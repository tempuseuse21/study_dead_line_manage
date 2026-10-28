import React, { createContext, useContext, useEffect, useState } from 'react';

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
  loginStudent: (studentId: string, passwordInput: string) => Promise<{ success: boolean; error?: string }>;
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
  logout: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authMode: 'login' | 'register' | 'forgot_password';
  setAuthMode: (mode: 'login' | 'register' | 'forgot_password') => void;
}

const CURRENT_USER_KEY = 'mscit_current_student';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StudentProfile | null>(() => {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse current student session:', e);
    }
    return null;
  });

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot_password'>('login');

  // Sync user profile (no password) to localStorage for session persistence
  useEffect(() => {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [user]);

  const loginStudent = async (studentId: string, passwordInput: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, password: passwordInput })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        if (data.user.role === 'cr_admin') localStorage.setItem('studysync_is_admin', 'true');
        setShowAuthModal(false);
        return { success: true };
      }
      return { success: false, error: data.error || 'Login failed' };
    } catch {
      return { success: false, error: 'Server connection failed. Make sure the app server is running.' };
    }
  };

  const registerStudent = async (input: {
    studentId: string;
    fullName: string;
    registrationCode: string;
    password: string;
    confirmPassword: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (input.password !== input.confirmPassword) {
      return { success: false, error: 'Passwords do not match' };
    }
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: input.studentId,
          fullName: input.fullName,
          registrationCode: input.registrationCode,
          password: input.password
        })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setShowAuthModal(false);
        return { success: true };
      }
      return { success: false, error: data.error || 'Registration failed' };
    } catch {
      return { success: false, error: 'Server connection failed.' };
    }
  };

  const resetPassword = async (input: {
    studentId: string;
    registrationCode: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (input.newPassword !== input.confirmPassword) {
      return { success: false, error: 'Passwords do not match' };
    }
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: input.studentId,
          registrationCode: input.registrationCode,
          newPassword: input.newPassword
        })
      });
      const data = await res.json();
      return data;
    } catch {
      return { success: false, error: 'Server connection failed.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem('studysync_is_admin');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginStudent,
        registerStudent,
        resetPassword,
        logout,
        showAuthModal,
        setShowAuthModal,
        authMode,
        setAuthMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

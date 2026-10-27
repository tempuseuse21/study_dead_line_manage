import React, { createContext, useContext, useEffect, useState } from 'react';
import { rosterService, StudentProfile } from '../lib/authorizedRoster';

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

// Default initial user for instant seamless experience
const DEFAULT_STUDENT: StudentProfile = {
  id: 'usr_202612045',
  studentId: '202612045',
  fullName: 'Mayank Malhotra',
  email: '202612045@mscit.edu',
  registeredAt: new Date().toISOString(),
  role: 'student'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StudentProfile | null>(() => {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse current student session:', e);
    }
    // Return null so user is forced to log in before entering the site
    return null;
  });

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [user]);

  const loginStudent = async (studentId: string, passwordInput: string) => {
    const res = rosterService.authenticate(studentId, passwordInput);
    if (res.success && res.user) {
      setUser(res.user);
      if (res.user.role === 'cr_admin' || res.user.studentId === 'admin') {
        localStorage.setItem('studysync_is_admin', 'true');
      }
      setShowAuthModal(false);
      return { success: true };
    }
    return { success: false, error: res.error || 'Authentication failed' };
  };

  const registerStudent = async (input: {
    studentId: string;
    fullName: string;
    registrationCode: string;
    password: string;
    confirmPassword: string;
  }) => {
    const val = rosterService.validateRegistration(input);
    if (!val.isValid) {
      return { success: false, error: val.error };
    }

    try {
      const profile = rosterService.registerStudent(input.studentId, input.fullName, input.password);
      setUser(profile);
      setShowAuthModal(false);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Registration failed' };
    }
  };

  const resetPassword = async (input: {
    studentId: string;
    registrationCode: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    const res = rosterService.resetPassword(input);
    return res;
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

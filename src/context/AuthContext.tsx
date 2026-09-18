import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  members: User[];
  isAuthenticated: boolean;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  login: (email: string) => Promise<boolean>;
  register: (data: {
    name: string;
    email: string;
    college: string;
    course: string;
    semester: string;
  }) => Promise<boolean>;
  switchUser: (userId: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  logout: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
}

const DEFAULT_USER: User = {
  id: 'usr_student',
  name: 'Student',
  email: 'student@mscit.edu',
  college: 'MSc IT Department',
  course: 'MSc Information Technology',
  semester: '2',
  timezone: 'Asia/Kolkata',
  joinedAt: new Date().toISOString()
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = useState<User | null>(DEFAULT_USER);
  const [members] = useState<User[]>([DEFAULT_USER]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>(() => {
    const saved = localStorage.getItem('studysync_theme');
    return (saved as 'light' | 'dark' | 'system') || 'dark';
  });

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem('studysync_theme', theme);
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isSystemDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  const login = async (): Promise<boolean> => {
    setShowAuthModal(false);
    return true;
  };

  const register = async (): Promise<boolean> => {
    setShowAuthModal(false);
    setShowOnboarding(false);
    return true;
  };

  const switchUser = async () => {};

  const updateProfile = async () => {};

  const logout = () => {
    setShowAuthModal(false);
  };

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        members,
        isAuthenticated: true,
        theme,
        setTheme,
        login,
        register,
        switchUser,
        updateProfile,
        logout,
        showAuthModal,
        setShowAuthModal,
        showOnboarding,
        setShowOnboarding
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

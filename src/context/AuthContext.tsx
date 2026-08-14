import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { DEMO_USERS } from '../constants/mockData';
import { supabase, signInWithGoogleOAuth } from '../lib/supabaseClient';

interface AuthContextType {
  currentUser: UserProfile | null;
  currentRole: UserRole;
  switchUserRole: (roleKey: string) => void;
  login: (email: string, password: string) => boolean;
  loginWithGoogleEmail: (googleEmail: string) => boolean;
  triggerGoogleOAuth: () => Promise<void>;
  logout: () => void;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to extract email directly from Supabase Google OAuth redirect URL hash or query parameters
const parseOAuthEmailFromUrl = (): string | null => {
  try {
    const hash = window.location.hash;
    const search = window.location.search;
    const fullUrl = hash || search;
    if (!fullUrl) return null;

    const params = new URLSearchParams(fullUrl.replace(/^#/, '?'));
    const token = params.get('access_token');
    if (token) {
      const parts = token.split('.');
      if (parts.length >= 2) {
        const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
        const payload = JSON.parse(payloadJson);
        if (payload?.email) {
          return payload.email;
        }
      }
    }
  } catch (err) {
    console.warn('OAuth URL parser fallback error:', err);
  }
  return null;
};

const resolveUserFromEmail = (googleEmail: string): { key: string; user: UserProfile } => {
  const cleanEmail = googleEmail.trim().toLowerCase();
  
  let targetRoleKey = 'student';
  if (cleanEmail.includes('ag23') || cleanEmail.includes('soundharraj.ag23@bitsathy.ac.in')) {
    targetRoleKey = 'student';
  } else if (cleanEmail.includes('vellingiri@gmail.com') || cleanEmail.includes('parent')) {
    targetRoleKey = 'parent';
  } else if (cleanEmail.includes('5912@gmail.com') || cleanEmail.includes('mentor')) {
    targetRoleKey = 'mentor';
  } else if (cleanEmail.includes('122005@gmail.com') || cleanEmail.includes('security')) {
    targetRoleKey = 'security';
  } else {
    targetRoleKey = 'student';
  }

  const baseUser = DEMO_USERS[targetRoleKey] || DEMO_USERS.student;
  const activeUser: UserProfile = {
    ...baseUser,
    email: googleEmail
  };
  return { key: targetRoleKey, user: activeUser };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    // 1. First check if returning from Google OAuth redirect URL (#access_token=...)
    const urlEmail = parseOAuthEmailFromUrl();
    if (urlEmail) {
      const resolved = resolveUserFromEmail(urlEmail);
      localStorage.setItem('bit_outpass_active_role_key', resolved.key);
      return resolved.user;
    }

    // 2. Otherwise check saved role in localStorage
    const savedRoleKey = localStorage.getItem('bit_outpass_active_role_key');
    if (savedRoleKey && DEMO_USERS[savedRoleKey]) {
      return DEMO_USERS[savedRoleKey];
    }
    return null; // Start on Login page when no session exists
  });

  const [isDemoMode] = useState<boolean>(true);

  const switchUserRole = (roleKey: string) => {
    if (DEMO_USERS[roleKey]) {
      setCurrentUser(DEMO_USERS[roleKey]);
      localStorage.setItem('bit_outpass_active_role_key', roleKey);
    }
  };

  const loginWithGoogleEmail = (googleEmail: string): boolean => {
    const resolved = resolveUserFromEmail(googleEmail);
    setCurrentUser(resolved.user);
    localStorage.setItem('bit_outpass_active_role_key', resolved.key);
    return true;
  };

  const login = (usernameOrPhone: string, passwordOrOtp: string): boolean => {
    const cleanUser = usernameOrPhone.trim().toLowerCase().replace(/[\s-]/g, '');
    const cleanPassword = passwordOrOtp.trim();

    if (!cleanUser || !cleanPassword) return false;

    // Direct Admin check for instant Admin Dashboard redirect
    if (cleanUser === 'admin' || cleanUser === 'admin@bitsathy' || cleanUser.includes('admin')) {
      setCurrentUser(DEMO_USERS.admin);
      localStorage.setItem('bit_outpass_active_role_key', 'admin');
      return true;
    }

    // Prioritize matching PARENT account when username/phone relates to parent credentials
    let foundEntry = Object.entries(DEMO_USERS).find(([_, user]) => {
      const u = user as UserProfile;
      if (u.role !== 'PARENT') return false;
      const uEmail = (u.email || '').toLowerCase().replace(/[\s-]/g, '');
      const uName = (u.name || '').toLowerCase();
      const uPhone = (u.phone || '').replace(/[\s-]/g, '');
      const uParentPhone = (u.parentPhone || '').replace(/[\s-]/g, '');
      return (
        uEmail === cleanUser ||
        uName === usernameOrPhone.trim().toLowerCase() ||
        (uPhone && uPhone.includes(cleanUser)) ||
        (uParentPhone && uParentPhone.includes(cleanUser)) ||
        cleanUser.includes('parent')
      );
    });

    // Fallback to general user lookup (student, mentor, warden, security, admin)
    if (!foundEntry) {
      foundEntry = Object.entries(DEMO_USERS).find(([_, user]) => {
        const u = user as UserProfile;
        const uEmail = (u.email || '').toLowerCase().replace(/[\s-]/g, '');
        const uName = (u.name || '').toLowerCase();
        const uPhone = (u.phone || '').replace(/[\s-]/g, '');
        return uEmail === cleanUser || uName === usernameOrPhone.trim().toLowerCase() || (uPhone && uPhone.includes(cleanUser));
      });
    }

    if (!foundEntry) return false;

    const [key, user] = foundEntry;

    // Accept password if it matches register number, email, 4-digit OTP, or demo credentials
    const acceptable =
      (user.registerNumber && user.registerNumber === cleanPassword) ||
      (user.email && user.email.toLowerCase() === cleanPassword.toLowerCase()) ||
      /^\d{4}$/.test(cleanPassword) ||
      user.role === 'PARENT' ||
      cleanPassword === '1234' ||
      cleanPassword === 'admin' ||
      cleanPassword === 'admin@bitsathy' ||
      cleanPassword === 'parent@bitsathy';

    if (!acceptable) return false;

    setCurrentUser(user);
    localStorage.setItem('bit_outpass_active_role_key', key);
    return true;
  };

  useEffect(() => {
    // Clean up OAuth hash fragment if present in URL
    const urlEmail = parseOAuthEmailFromUrl();
    if (urlEmail) {
      loginWithGoogleEmail(urlEmail);
      if (window.location.hash || window.location.search) {
        window.history.replaceState({}, '', window.location.pathname);
      }
    }

    // Check initial Supabase OAuth session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        loginWithGoogleEmail(session.user.email);
        if (window.location.hash || window.location.search) {
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    });

    // Listen for real Supabase Google OAuth callback redirect
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        loginWithGoogleEmail(session.user.email);
        if (window.location.hash || window.location.search) {
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const triggerGoogleOAuth = async () => {
    try {
      await signInWithGoogleOAuth();
    } catch (e) {
      console.warn('Google OAuth trigger error:', e);
    }
  };

  const logout = () => {
    supabase.auth.signOut().catch(() => {});
    setCurrentUser(null);
    localStorage.removeItem('bit_outpass_active_role_key');
  };

  const currentRole = currentUser ? currentUser.role : 'STUDENT';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        switchUserRole,
        login,
        loginWithGoogleEmail,
        triggerGoogleOAuth,
        logout,
        isDemoMode
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

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  fullName: string;
  phone: string;
  countryCode: string;
  email?: string | null;
  avatar?: string | null;
  isVerified: boolean;
  status?: string;
  lastSeen?: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, countryCode: string) => Promise<{ success: boolean; error?: string }>;
  register: (fullName: string, phone: string, countryCode: string) => Promise<{ success: boolean; error?: string }>;
  verifyCode: (phone: string, code: string, countryCode: string, type: 'login' | 'register') => Promise<{ success: boolean; error?: string }>;
  resendCode: (phone: string, countryCode: string, type: 'login' | 'register') => Promise<{ success: boolean; error?: string }>;
  updateEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL = 'http://10.1.0.240:3000/api';
const TOKEN_KEY = 'superchat_auth_token';

// ─── Create Context ───────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextData | undefined>(undefined);

// ─── Provider Component ───────────────────────────────────────────────────────
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Charger le token au démarrage ──────────────────────────────────────────
  useEffect(() => {
    loadToken();
  }, []);

  // ── Charger le token depuis SecureStore ────────────────────────────────────
  const loadToken = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      if (storedToken) {
        setToken(storedToken);
        await fetchUser(storedToken);
      }
    } catch (error) {
      console.error('[Auth] Error loading token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Récupérer les infos utilisateur ────────────────────────────────────────
  const fetchUser = async (authToken: string) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/user/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('[Auth] Error fetching user:', error);
    }
  };

  // ── Initier l'inscription ──────────────────────────────────────────────────
  const register = async (
    fullName: string,
    phone: string,
    countryCode: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, phone, countryCode }),
      });
      const data = await res.json();
      
      if (data.success) {
        // Stocker temporairement les infos pour la vérification
        await SecureStore.setItemAsync('pending_phone', phone);
        await SecureStore.setItemAsync('pending_countryCode', countryCode);
        await SecureStore.setItemAsync('pending_type', 'register');
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (error) {
      return { success: false, error: 'Erreur de connexion au serveur' };
    }
  };

  // ── Initier la connexion ───────────────────────────────────────────────────
  const login = async (
    phone: string,
    countryCode: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${BASE_URL}/auth/login-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, countryCode }),
      });
      const data = await res.json();
      
      if (data.success) {
        await SecureStore.setItemAsync('pending_phone', phone);
        await SecureStore.setItemAsync('pending_countryCode', countryCode);
        await SecureStore.setItemAsync('pending_type', 'login');
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (error) {
      return { success: false, error: 'Erreur de connexion au serveur' };
    }
  };

  // ── Vérifier le code SMS ───────────────────────────────────────────────────
  const verifyCode = async (
    phone: string,
    code: string,
    countryCode: string,
    type: 'login' | 'register'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${BASE_URL}/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code, countryCode, type }),
      });
      const data = await res.json();
      
      if (data.success) {
        // Stocker le token et les infos utilisateur
        await SecureStore.setItemAsync(TOKEN_KEY, data.token);
        setToken(data.token);
        setUser(data.user);
        
        // Nettoyer les infos temporaires
        await SecureStore.deleteItemAsync('pending_phone');
        await SecureStore.deleteItemAsync('pending_countryCode');
        await SecureStore.deleteItemAsync('pending_type');
        
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (error) {
      return { success: false, error: 'Erreur de connexion au serveur' };
    }
  };

  // ── Renvoyer le code ───────────────────────────────────────────────────────
  const resendCode = async (
    phone: string,
    countryCode: string,
    type: 'login' | 'register'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${BASE_URL}/auth/resend-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, countryCode, type }),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return { success: false, error: 'Erreur de connexion au serveur' };
    }
  };

  // ── Mettre à jour l'email ──────────────────────────────────────────────────
  const updateEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!token) {
      return { success: false, error: 'Non authentifié' };
    }
    
    try {
      const res = await fetch(`${BASE_URL}/auth/user/email`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (data.success) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (error) {
      return { success: false, error: 'Erreur de connexion au serveur' };
    }
  };

  // ── Rafraîchir les infos utilisateur ──────────────────────────────────────
  const refreshUser = async () => {
    if (token) {
      await fetchUser(token);
    }
  };

  // ── Déconnexion ────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync('pending_phone');
      await SecureStore.deleteItemAsync('pending_countryCode');
      await SecureStore.deleteItemAsync('pending_type');
    } catch (error) {
      console.error('[Auth] Error during logout:', error);
    }
    setToken(null);
    setUser(null);
  };

  // ─── Context Value ──────────────────────────────────────────────────────────
  const value: AuthContextData = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    verifyCode,
    resendCode,
    updateEmail,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Custom Hook ──────────────────────────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

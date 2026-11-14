import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

type AuthScreen = 'login' | 'create' | 'app';

interface AuthRouterContextValue {
  screen: AuthScreen;
  showLogin: () => void;
  showCreate: () => void;
}

const AuthRouterContext = createContext<AuthRouterContextValue | undefined>(undefined);

export function AuthRouterProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState<AuthScreen>('login');

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'create') setScreen('create');
    else if (hash === 'login') setScreen('login');
  }, []);

  useEffect(() => {
    if (loading) return;
    if (user) setScreen('app');
    else {
      const hash = window.location.hash.replace('#', '');
      setScreen(hash === 'create' ? 'create' : 'login');
    }
  }, [user, loading]);

  useEffect(() => {
    const onHashChange = () => {
      if (!user) {
        const hash = window.location.hash.replace('#', '');
        setScreen(hash === 'create' ? 'create' : 'login');
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [user]);

  const showLogin = () => {
    window.location.hash = 'login';
    setScreen('login');
  };

  const showCreate = () => {
    window.location.hash = 'create';
    setScreen('create');
  };

  return (
    <AuthRouterContext.Provider value={{ screen, showLogin, showCreate }}>
      {children}
    </AuthRouterContext.Provider>
  );
}

export function useAuthRouter() {
  const ctx = useContext(AuthRouterContext);
  if (!ctx) throw new Error('useAuthRouter must be used within AuthRouterProvider');
  return ctx;
}

export { supabase };

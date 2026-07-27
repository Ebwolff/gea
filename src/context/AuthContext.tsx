import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export type UserRole =
  | 'admin'
  | 'consultor'
  | 'produtor_rural'
  | 'gestor_financeiro'
  | 'gerente_fazenda'
  | 'funcionario'
  | 'contador';

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

interface AuthContextType {
  loading: boolean;
  session: Session | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error('Erro ao carregar perfil do usuário:', error);
    return null;
  }

  return { id: data.id, email: data.email, fullName: data.full_name, role: data.role as UserRole };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return;
      setSession(session);
      if (session?.user) {
        setProfile(await fetchProfile(session.user.id));
      }
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        setProfile(await fetchProfile(newSession.user.id));
      } else {
        setProfile(null);
      }
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? traduzErroLogin(error.message) : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ loading, session, profile, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

function traduzErroLogin(message: string): string {
  if (message.toLowerCase().includes('invalid login credentials')) {
    return 'E-mail ou senha incorretos.';
  }
  if (message.toLowerCase().includes('email not confirmed')) {
    return 'E-mail ainda não confirmado.';
  }
  return message;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado com um AuthProvider');
  return context;
};

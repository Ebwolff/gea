import React from 'react';
import { useAuth } from './context/AuthContext';
import { Login } from './components/Login';

// Só renderiza o app (e só então o AppProvider dispara suas queries no
// Supabase) depois que existe uma sessão válida. Sem isso, as telas
// tentariam carregar dados antes do login, batendo nas policies RLS
// "authenticated" e retornando tudo vazio.
export const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading, session } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return <>{children}</>;
};

import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Cria o Contexto
const AuthContext = createContext();

// Hook customizado para facilitar o uso do contexto
export function useAuth() {
  return useContext(AuthContext);
}

// Componente Provedor
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged é um listener que observa mudanças no estado de auth
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Função de limpeza para remover o listener quando o componente for desmontado
    return unsubscribe;
  }, []);

  const value = {
    currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
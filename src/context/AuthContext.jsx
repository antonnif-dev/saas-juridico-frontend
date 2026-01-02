import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser({
          ...user,
          photoUrl: user.photoUrl
        });

        try {
          const tokenResult = await user.getIdTokenResult();
          const role = tokenResult.claims.role;
          
          setUserRole(role || 'cliente');
        } catch (error) {
          console.error("AuthContext: Erro ao buscar o perfil do usuário:", error);
          setUserRole('cliente');
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    isAdmin: userRole === 'administrador',
    isAdvogado: userRole === 'advogado',
    isCliente: userRole === 'cliente',
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
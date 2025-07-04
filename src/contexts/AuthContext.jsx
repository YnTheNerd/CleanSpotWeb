import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange, checkAdminAccess } from '../firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      if (user) {
        const adminAccess = await checkAdminAccess(user.uid);
        if (adminAccess) {
          setUser(user);
          setIsAdmin(true);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    isAdmin,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
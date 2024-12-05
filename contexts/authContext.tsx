// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

// Define types for user and context
interface AuthContextType {
  token: string;
  setToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  // State to hold the token
  const [token, setTokenState] = useState<string>('');

  // Load token from AsyncStorage when the app starts
  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await SecureStore.getItemAsync('auth_token');
      if (storedToken) {
        setTokenState(storedToken);
      }
    };
    loadToken();
  }, []);

  // Function to set token and save it in AsyncStorage
  const setToken = async (token: string) => {
    await SecureStore.setItemAsync('auth_token', token);
    setTokenState(token);
  };

  // Function to logout (remove token from AsyncStorage)
  const logout = async () => {
    await SecureStore.deleteItemAsync('auth_token');
    setTokenState('');
  };

  return (
    <AuthContext.Provider value={{ token, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

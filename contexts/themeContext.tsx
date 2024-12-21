import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react';
import { Colors } from '../constants/Colors';

interface ThemeContextType {
  dark: boolean;
  colors: typeof Colors.light;
  setScheme: (scheme: 'light' | 'dark') => void;
}

const defaultThemeContext: ThemeContextType = {
  dark: false,
  colors: Colors.light,
  setScheme: () => {},
};

export const ThemeContext =
  createContext<ThemeContextType>(defaultThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(false); // Default to light mode

  const defaultTheme: ThemeContextType = {
    dark: isDark,
    colors: isDark ? Colors.dark : Colors.light,
    setScheme: (scheme: 'light' | 'dark') => setIsDark(scheme === 'dark'),
  };

  return (
    <ThemeContext.Provider value={defaultTheme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

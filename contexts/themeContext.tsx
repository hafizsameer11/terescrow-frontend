import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
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
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === 'dark');

  useEffect(() => {
    setIsDark(colorScheme === 'dark');
  }, [colorScheme]);

  const defaultTheme: ThemeContextType = {
    dark: isDark,
    colors: isDark ? Colors.dark : Colors.light,
    setScheme: (scheme: 'light' | 'dark') => setIsDark(scheme === 'dark'),
  };
  //   console.log(defaultTheme);

  return (
    <ThemeContext.Provider value={defaultTheme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

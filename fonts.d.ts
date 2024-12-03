// fonts.d.ts
import 'react-native';

declare module 'react-native' {
  interface TextStyle {
    fontFamily?: 'Bold' | 'BoldItalic' | 'Light' | 'LightItalic' | 'Regular' | 'RegularItalic';
  }
}

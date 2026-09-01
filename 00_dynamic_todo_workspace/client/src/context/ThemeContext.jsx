import React, { createContext, useContext, useState, useEffect } from 'react';
import { sound } from '../utils/audio';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('zenith_theme') || 'dark');
  const [accent, setAccent] = useState(() => localStorage.getItem('zenith_accent') || 'indigo');
  const [isSoundMuted, setIsSoundMuted] = useState(() => sound.muted);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('zenith_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accent);
    localStorage.setItem('zenith_accent', accent);
  }, [accent]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    sound.playClick();
  };

  const changeAccent = (newAccent) => {
    setAccent(newAccent);
    sound.playClick();
  };

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsSoundMuted(muted);
    if (!muted) {
      sound.playClick();
    }
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      accent,
      changeAccent,
      isSoundMuted,
      toggleSound
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

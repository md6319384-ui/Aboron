import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteSettings } from '../types';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface ThemeContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
  loading: boolean;
}

const defaultSettings: SiteSettings = {
  siteName: 'ShopEase',
  primaryColor: '#2563eb', // blue-600
  secondaryColor: '#0f172a', // slate-900
  accentColor: '#f43f5e', // rose-500
  logoUrl: '',
  bannerUrl: '',
  fontFamily: 'Inter',
  contactEmail: 'support@shopease.com',
  contactPhone: '01813408362',
  bkashNumber: '01813408362',
  nagadNumber: '01616246681',
  adminPassword: 'iloveyou123',
  allowCOD: true,
  fontSize: '16px',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, 'settings', 'site');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as SiteSettings);
      } else {
        // Initialize settings if they don't exist
        setDoc(docRef, defaultSettings);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    try {
      const docRef = doc(db, 'settings', 'site');
      await updateDoc(docRef, newSettings);
    } catch (error) {
      console.error("Error updating settings:", error);
      // Fallback to setDoc if updateDoc fails (e.g. document doesn't exist yet)
      const updated = { ...settings, ...newSettings };
      await setDoc(doc(db, 'settings', 'site'), updated);
    }
  };

  return (
    <ThemeContext.Provider value={{ settings, updateSettings, loading }}>
      <div style={{ 
        // @ts-ignore
        '--primary': settings.primaryColor,
        '--secondary': settings.secondaryColor,
        '--accent': settings.accentColor,
        'fontFamily': settings.fontFamily ? `${settings.fontFamily}, sans-serif` : 'inherit',
        'fontSize': settings.fontSize || '16px',
      } as React.CSSProperties}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

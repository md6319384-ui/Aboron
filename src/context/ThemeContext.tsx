import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteSettings } from '../types';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface ThemeContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
  loading: boolean;
}

const defaultSettings: SiteSettings = {
  siteName: 'My Webstore',
  siteDescription: 'Premium quality products at best prices.',
  primaryColor: '#f85606',
  secondaryColor: '#1a1a1a',
  accentColor: '#fbbf24',
  logoUrl: '',
  bannerUrl: '',
  fontFamily: 'Inter',
  contactEmail: 'support@example.com',
  contactPhone: '01813408362',
  contactAddress: 'Dhaka, Bangladesh',
  bkashNumber: '01813408362',
  nagadNumber: '01616246681',
  adminPassword: 'iloveyou123',
  allowCOD: true,
  fontSize: '16px',
  showAds: false,
  adPosition: 'both-sidebars',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'site');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as SiteSettings;
          setSettings(data);
          if (data.siteName) {
            document.title = data.siteName;
          }
        } else {
          // Initialize settings if they don't exist
          await setDoc(docRef, defaultSettings);
          document.title = defaultSettings.siteName;
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Dynamic ad script injection effect
  useEffect(() => {
    // Cleanup any existing injected ad tags
    const cleanupAds = () => {
      document.querySelectorAll('[data-ad-injected="true"]').forEach(el => el.remove());
    };

    cleanupAds();

    if (settings.showAds) {
      console.log('Injecting Monetag and vignette scripts dynamically.');

      // 1. Meta Monetag
      const meta = document.createElement('meta');
      meta.name = 'monetag';
      meta.content = 'dab2663f72633dc492b9f2b8d1bff070';
      meta.setAttribute('data-ad-injected', 'true');
      document.head.appendChild(meta);

      // 2. Script: 5gvci.com
      const s1 = document.createElement('script');
      s1.src = 'https://5gvci.com/act/files/tag.min.js?z=10983660';
      s1.setAttribute('data-cfasync', 'false');
      s1.async = true;
      s1.setAttribute('data-ad-injected', 'true');
      document.head.appendChild(s1);

      // 3. Script: quge5.com
      const s2 = document.createElement('script');
      s2.src = 'https://quge5.com/88/tag.min.js';
      s2.setAttribute('data-zone', '237655');
      s2.async = true;
      s2.setAttribute('data-cfasync', 'false');
      s2.setAttribute('data-ad-injected', 'true');
      document.head.appendChild(s2);

      // 4. Script: vignette.min.js
      const s3 = document.createElement('script');
      s3.setAttribute('data-ad-injected', 'true');
      s3.textContent = `(function(s){s.dataset.zone='10983753',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`;
      document.head.appendChild(s3);

      // 5. Script: al5sm.com tag.min.js
      const s4 = document.createElement('script');
      s4.setAttribute('data-ad-injected', 'true');
      s4.textContent = `(function(s){s.dataset.zone='11032656',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`;
      document.head.appendChild(s4);
    }

    return () => {
      cleanupAds();
    };
  }, [settings.showAds]);

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

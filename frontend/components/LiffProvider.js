'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

const LiffContext = createContext({
  liff: null,
  isLoggedIn: false,
  profile: null,
  error: null,
  isLoading: true,
});

export const useLiff = () => useContext(LiffContext);

export default function LiffProvider({ children }) {
  const [liffObject, setLiffObject] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Import LIFF SDK dynamically on client side
    import('@line/liff')
      .then((liffModule) => {
        const liff = liffModule.default || liffModule;
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID || 'dummy-liff-id';

        console.log('[LIFF] Initializing LIFF SDK with ID:', liffId);

        liff
          .init({ liffId })
          .then(async () => {
            setLiffObject(liff);
            console.log('[LIFF] Initialized successfully');

            if (liff.isLoggedIn()) {
              setIsLoggedIn(true);
              try {
                const userProfile = await liff.getProfile();
                console.log('[LIFF] Profile fetched:', userProfile);
                setProfile(userProfile);
              } catch (pErr) {
                console.warn('[LIFF] Error fetching profile:', pErr);
              }
            } else {
              setIsLoggedIn(false);
              // Auto-login fallback if configured, or when inside LINE app
              if (liff.isInClient()) {
                liff.login();
              }
            }
          })
          .catch((err) => {
            console.error('[LIFF] Initialization error:', err);
            setError(err.message || 'LIFF Initialization failed');
          })
          .finally(() => {
            setIsLoading(false);
          });
      })
      .catch((err) => {
        console.error('[LIFF] Failed to load @line/liff module:', err);
        setError('Failed to load LIFF SDK');
        setIsLoading(false);
      });
  }, []);

  return (
    <LiffContext.Provider
      value={{
        liff: liffObject,
        isLoggedIn,
        profile,
        error,
        isLoading,
      }}
    >
      {children}
    </LiffContext.Provider>
  );
}

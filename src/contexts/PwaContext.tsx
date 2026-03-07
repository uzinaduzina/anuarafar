import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

type PwaPromptOutcome = 'accepted' | 'dismissed' | 'manual' | 'unavailable';

interface PwaContextValue {
  canInstall: boolean;
  canInstallManually: boolean;
  isInstalled: boolean;
  promptInstall: () => Promise<PwaPromptOutcome>;
}

const PwaContext = createContext<PwaContextValue>({
  canInstall: false,
  canInstallManually: false,
  isInstalled: false,
  promptInstall: async () => 'unavailable',
});

function detectStandaloneMode() {
  if (typeof window === 'undefined') return false;
  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || navigatorWithStandalone.standalone === true;
}

function detectManualInstallSupport() {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent || '';
  const isIos = /iphone|ipad|ipod/i.test(ua);
  const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios|chrome|android/i.test(ua);
  return isIos && isSafari;
}

export function usePwa() {
  return useContext(PwaContext);
}

export function PwaProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => detectStandaloneMode());

  useEffect(() => {
    if (!import.meta.env.PROD) return;

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (event: MediaQueryListEvent) => {
      setIsInstalled(event.matches || detectStandaloneMode());
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleDisplayModeChange);
    } else {
      mediaQuery.addListener(handleDisplayModeChange);
    }

    if ('serviceWorker' in navigator) {
      const baseUrl = import.meta.env.BASE_URL || '/';
      void navigator.serviceWorker.register(`${baseUrl}service-worker.js`, { scope: baseUrl });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', handleDisplayModeChange);
      } else {
        mediaQuery.removeListener(handleDisplayModeChange);
      }
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<PwaPromptOutcome> => {
    if (isInstalled) return 'accepted';
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
      return choice.outcome;
    }

    if (detectManualInstallSupport()) {
      return 'manual';
    }

    return 'unavailable';
  }, [deferredPrompt, isInstalled]);

  const value = useMemo<PwaContextValue>(() => ({
    canInstall: Boolean(deferredPrompt) && !isInstalled,
    canInstallManually: !deferredPrompt && !isInstalled && detectManualInstallSupport(),
    isInstalled,
    promptInstall,
  }), [deferredPrompt, isInstalled, promptInstall]);

  return (
    <PwaContext.Provider value={value}>
      {children}
    </PwaContext.Provider>
  );
}

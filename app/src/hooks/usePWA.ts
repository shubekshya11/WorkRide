import { useEffect, useState } from 'react';

import {
  isIosSafari,
  isPwaInstalled,
  isSecureInstallContext,
  promptInstall,
  subscribeToInstallPrompt,
  type BeforeInstallPromptEvent,
} from '../lib/pwaInstallPrompt';

export type PwaInstallStatus =
  | 'installed'
  | 'ready'
  | 'ios-manual'
  | 'preparing'
  | 'browser-menu'
  | 'insecure';

export const usePWA = () => {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(isPwaInstalled());
  const [swReady, setSwReady] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (isPwaInstalled()) {
      setIsAppInstalled(true);
      return;
    }

    const unsubscribe = subscribeToInstallPrompt((prompt) => {
      setInstallPrompt(prompt);
    });

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then(() => setSwReady(true))
        .catch(() => setSwReady(true));
    } else {
      setSwReady(true);
    }

    const timeoutId = window.setTimeout(() => setTimedOut(true), 8000);

    return () => {
      unsubscribe();
      window.clearTimeout(timeoutId);
    };
  }, []);

  const status: PwaInstallStatus = (() => {
    if (isAppInstalled) return 'installed';
    if (installPrompt) return 'ready';
    if (!isSecureInstallContext()) return 'insecure';
    if (isIosSafari()) return 'ios-manual';
    if (!swReady && !timedOut) return 'preparing';
    return 'browser-menu';
  })();

  const installApp = async (): Promise<boolean> => promptInstall();

  return { installPrompt, isAppInstalled, installApp, status };
};

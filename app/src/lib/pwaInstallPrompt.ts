export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type InstallPromptListener = (prompt: BeforeInstallPromptEvent | null) => void;

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<InstallPromptListener>();
let initialized = false;

function notifyListeners() {
  listeners.forEach((listener) => listener(deferredPrompt));
}

export function initPwaInstallPrompt() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    notifyListeners();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notifyListeners();
  });
}

export function subscribeToInstallPrompt(listener: InstallPromptListener) {
  listeners.add(listener);
  listener(deferredPrompt);

  return () => {
    listeners.delete(listener);
  };
}

export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) return false;

  await deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  notifyListeners();

  return outcome === 'accepted';
}

export function isPwaInstalled(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true)
  );
}

export function isIosSafari(): boolean {
  if (typeof navigator === 'undefined') return false;

  const isAppleDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isSafari =
    /Safari/.test(navigator.userAgent) &&
    !/CriOS|FxiOS|EdgiOS|OPiOS/.test(navigator.userAgent);

  return isAppleDevice && isSafari;
}

export function isSecureInstallContext(): boolean {
  return typeof window !== 'undefined' && window.isSecureContext;
}

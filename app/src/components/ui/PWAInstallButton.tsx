import { usePWA } from '../../hooks/usePWA';

const statusCopy = {
  ready: {
    button: 'Install App',
    description:
      'Install WorkRide as an app for quick access, offline support, and a native-like experience.',
  },
  preparing: {
    button: 'Preparing install…',
    description: 'Setting up offline support. The install option will appear shortly.',
  },
  'browser-menu': {
    button: 'Install App',
    description:
      'Use the install icon in your browser address bar, or open the browser menu and choose "Install WorkRide".',
  },
  'ios-manual': {
    button: 'Add to Home Screen',
    description:
      'Tap the Share button in Safari, then choose "Add to Home Screen".',
  },
  insecure: {
    button: 'Install unavailable',
    description:
      'PWA install requires HTTPS. Open this site over HTTPS or use localhost during development.',
  },
} as const;

export const PWAInstallButton = () => {
  const { installPrompt, installApp, status } = usePWA();

  if (status === 'installed') return null;

  const copy = statusCopy[status];
  const canInstall = status === 'ready' && Boolean(installPrompt);

  return (
    <div className="flex w-fit max-w-md items-center justify-start gap-3 rounded-2xl border border-teal-700/50 bg-teal-800/60 p-3 text-teal-50">
      <button
        type="button"
        onClick={canInstall ? installApp : undefined}
        disabled={!canInstall}
        className={`transition-150 group flex shrink-0 items-center gap-2 rounded-full py-3 pl-4 pr-5 text-xs font-medium shadow-lg sm:text-sm ${
          canInstall
            ? 'bg-teal-300 text-teal-950 hover:bg-teal-200'
            : 'cursor-default bg-teal-700/80 text-teal-100'
        }`}
      >
        <img
          src="/pwa-64x64.png"
          alt="WorkRide"
          className="size-5 object-contain sm:size-6"
        />
        {copy.button}
      </button>
      <p className="flex-1 text-xs font-extralight leading-relaxed text-teal-100">
        {copy.description}
      </p>
    </div>
  );
};

import { usePWA } from '../../hooks/usePWA';

export const PWAInstallButton = () => {
  const { installPrompt, isAppInstalled, installApp } = usePWA();

  // Always show button for testing, but disable if not ready
  if (isAppInstalled) return null;

  return (
    <div className="flex w-fit max-w-md items-center justify-start gap-3 rounded-2xl border border-teal-700/50 bg-teal-800/60 p-3 text-teal-50">
      <button
        type="button"
        onClick={installApp}
        disabled={!installPrompt}
        className={`transition-150 group flex shrink-0 items-center gap-2 rounded-full py-3 pl-4 pr-5 text-xs font-medium shadow-lg sm:text-sm ${
          installPrompt
            ? 'bg-teal-300 text-teal-950 hover:bg-teal-200'
            : 'bg-gray-400 text-gray-700 cursor-not-allowed opacity-50'
        }`}
      >
        <img
          src="/pwa-64x64.png"
          alt="WorkRide"
          className="size-5 object-contain sm:size-6"
        />
        {installPrompt ? 'Install App' : 'PWA Not Ready'}
      </button>
      <p className="flex-1 text-xs font-extralight leading-relaxed text-teal-100">
        {installPrompt
          ? 'Install WorkRide as an app for quick access, offline support, and a native-like experience.'
          : 'PWA installation requires HTTPS and proper browser support. Use Chrome on desktop for best results.'}
      </p>
    </div>
  );
};

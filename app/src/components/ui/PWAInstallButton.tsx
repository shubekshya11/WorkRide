import { usePWA } from '../../hooks/usePWA';

export const PWAInstallButton = () => {
  const { installPrompt, isAppInstalled, installApp } = usePWA();

  if (isAppInstalled || !installPrompt) return null;

  return (
    <div className="flex w-fit max-w-md items-center justify-start gap-3 rounded-2xl border border-teal-700/50 bg-teal-800/60 p-3 text-teal-50">
      <button
        type="button"
        onClick={installApp}
        className="transition-150 group flex shrink-0 items-center gap-2 rounded-full bg-teal-300 py-3 pl-4 pr-5 text-xs font-medium text-teal-950 shadow-lg hover:bg-teal-200 sm:text-sm"
      >
        <img
          src="/pwa-64x64.png"
          alt="WorkRide"
          className="size-5 object-contain sm:size-6"
        />
        Install App
      </button>
      <p className="flex-1 text-xs font-extralight leading-relaxed text-teal-100">
        Install WorkRide as an app for quick access, offline support, and a
        native-like experience.
      </p>
    </div>
  );
};

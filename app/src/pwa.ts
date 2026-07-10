import { registerSW } from 'virtual:pwa-register';

import { initPwaInstallPrompt } from './lib/pwaInstallPrompt';

initPwaInstallPrompt();

export const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    if (
      window.confirm('A new version of WorkRide is available. Reload now?')
    ) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('WorkRide is ready for offline use.');
  },
});

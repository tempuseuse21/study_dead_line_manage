import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Sparkles, CheckCircle2 } from 'lucide-react';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone mode (installed as PWA)
    const isInStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');

    setIsStandalone(Boolean(isInStandaloneMode));

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Capture install prompt for Android/Chrome/Edge/Desktop
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!localStorage.getItem('pwa_prompt_dismissed')) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show prompt for iOS if not already installed or dismissed recently
    if (isIosDevice && !isInStandaloneMode && !localStorage.getItem('pwa_prompt_dismissed')) {
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-md bg-[var(--bg-card)] border border-indigo-500/30 rounded-3xl p-4 sm:p-5 shadow-2xl animate-in slide-in-from-bottom duration-300 backdrop-blur-xl">
      <div className="flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-2xl gradient-brand-bg flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-indigo-500/30">
          <Smartphone className="w-6 h-6" />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
              📲 Add to Home Screen
            </span>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3 className="font-display font-extrabold text-sm text-[var(--text-main)]">
            Use MSc IT Portal as App
          </h3>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            {isIOS
              ? 'Tap Share button ➔ select "Add to Home Screen" to install website as app!'
              : 'Add to Home Screen for fast mobile access & offline deadline tracking.'}
          </p>

          <div className="pt-2 flex items-center gap-2">
            {!isIOS && deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl gradient-brand-bg text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer w-full sm:w-auto"
              >
                <Download className="w-4 h-4" />
                <span>Add to Home Screen</span>
              </button>
            )}

            {isIOS && (
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20 w-full">
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Safari: Tap Share ➔ Add to Home Screen</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

// Global connectivity banner — mounted once in App.jsx so it shows on every
// page, not blocking content underneath (a full-screen block would be too
// disruptive for a brief connection drop).
function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    function handleOnline() {
      setIsOffline(false);
    }
    function handleOffline() {
      setIsOffline(true);
    }
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white text-xs md:text-sm font-bold uppercase tracking-wide text-center py-2 flex items-center justify-center gap-2">
      <WifiOff className="w-4 h-4" />
      No internet connection
    </div>
  );
}

export default OfflineBanner;
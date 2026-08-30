import { useState, useEffect } from 'react';
import DashboardSkeleton from './DashboardSkeleton';

function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Fake but purposeful progress: big steps early, shrinking steps later,
    // capped below 100 so it never claims to be done before it actually is.
    // Render cold starts can take 30-50s, so this needs to look alive for
    // that whole stretch, not just the first couple seconds.
    const CEILING = 92;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= CEILING) return prev;
        const remaining = CEILING - prev;
        const step = Math.max(remaining * 0.08, 0.3);
        return Math.min(prev + step, CEILING);
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="fixed top-0 left-0 right-0 h-1 bg-[#1A1A1A] z-50">
        <div
          className="h-full bg-[#F2C230] transition-all duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="pointer-events-none select-none">
        <DashboardSkeleton />
      </div>
    </div>
  );
}

export default LoadingScreen;
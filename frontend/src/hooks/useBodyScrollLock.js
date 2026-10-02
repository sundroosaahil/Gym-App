import { useEffect } from 'react';

let activeLocks = 0;
let previousOverflow = '';

export function useBodyScrollLock() {
  useEffect(() => {
    if (activeLocks === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    activeLocks += 1;

    return () => {
      activeLocks -= 1;
      if (activeLocks === 0) {
        document.body.style.overflow = previousOverflow;
        previousOverflow = '';
      }
    };
  }, []);
}
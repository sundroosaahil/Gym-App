import { useEffect, useRef, useState } from 'react';

export function useInView(options = { threshold: 0.15 }) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, isInView];
}
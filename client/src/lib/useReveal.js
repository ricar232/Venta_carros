import { useEffect, useRef, useState } from 'react';

// Fades a section in once it scrolls into view. Replaces the reveal-on-scroll
// logic from the original prototype (which avoided IntersectionObserver for a
// preview-harness quirk that doesn't apply to this standalone app).
export function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  const style = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(28px)',
    transition: 'opacity .8s ease, transform .8s cubic-bezier(.2,.8,.2,1)',
  };

  return [ref, visible, style];
}

import { useEffect, useRef } from 'react';
import styles from './scroll-progress.module.css';

// How long the track stays visible after the user stops scrolling.
const FADE_DELAY_MS = 800;

// Replaces the native page scrollbar (hidden globally in theme.css) with a
// fixed bone-colored track that fills in with ink from the top down as the
// user scrolls, and only shows itself while scrolling is actually happening.
export default function ScrollProgress() {
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const fill = fillRef.current;
    if (!track || !fill) return;

    let hideTimer: ReturnType<typeof setTimeout>;

    const updateFill = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const progress = scrollable > 0 ? doc.scrollTop / scrollable : 0;
      fill.style.height = `${progress * 100}%`;
    };

    const handleScroll = () => {
      updateFill();
      track.dataset.visible = 'true';
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        track.dataset.visible = 'false';
      }, FADE_DELAY_MS);
    };

    updateFill();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div ref={trackRef} className={styles.track} data-visible="false">
      <div ref={fillRef} className={styles.fill} />
    </div>
  );
}

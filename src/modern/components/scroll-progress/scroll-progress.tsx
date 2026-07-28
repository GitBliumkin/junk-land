import { useEffect, useRef } from 'react';
import styles from './scroll-progress.module.css';

// How long the track stays visible after the user stops scrolling/hovering/dragging.
const FADE_DELAY_MS = 800;

// Replaces the native page scrollbar (hidden globally in theme.css) with a
// fixed bone-colored track that fills in with ink from the top down as the
// user scrolls. It shows itself while scrolling, while hovered, or while
// being dragged — and doubles as a real scrollbar: pressing and dragging
// anywhere along it scrubs the page to that proportional scroll position.
export default function ScrollProgress() {
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const fill = fillRef.current;
    if (!track || !fill) return;

    let hideTimer: ReturnType<typeof setTimeout>;
    let dragging = false;

    const scrollRange = () => {
      const doc = document.documentElement;
      return doc.scrollHeight - doc.clientHeight;
    };

    const updateFill = () => {
      const range = scrollRange();
      const progress = range > 0 ? document.documentElement.scrollTop / range : 0;
      fill.style.height = `${progress * 100}%`;
    };

    const show = () => {
      track.dataset.visible = 'true';
      clearTimeout(hideTimer);
    };

    const scheduleHide = () => {
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        if (!dragging) track.dataset.visible = 'false';
      }, FADE_DELAY_MS);
    };

    const handleScroll = () => {
      updateFill();
      show();
      scheduleHide();
    };

    // Maps a pointer's vertical position directly to a scroll fraction —
    // the same mapping updateFill uses in reverse — so pressing anywhere
    // along the track jumps straight there, then dragging scrubs it live.
    const scrollToPointer = (clientY: number) => {
      const rect = track.getBoundingClientRect();
      const ratio = rect.height > 0 ? (clientY - rect.top) / rect.height : 0;
      window.scrollTo({ top: Math.min(1, Math.max(0, ratio)) * scrollRange() });
    };

    const handlePointerEnter = () => show();

    const handlePointerDown = (event: PointerEvent) => {
      dragging = true;
      track.dataset.dragging = 'true';
      track.setPointerCapture(event.pointerId);
      show();
      scrollToPointer(event.clientY);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (dragging) scrollToPointer(event.clientY);
    };

    const endDrag = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      track.dataset.dragging = 'false';
      track.releasePointerCapture(event.pointerId);
      scheduleHide();
    };

    const handlePointerLeave = () => {
      if (!dragging) scheduleHide();
    };

    updateFill();
    window.addEventListener('scroll', handleScroll, { passive: true });
    track.addEventListener('pointerenter', handlePointerEnter);
    track.addEventListener('pointerdown', handlePointerDown);
    track.addEventListener('pointermove', handlePointerMove);
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('pointerleave', handlePointerLeave);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      track.removeEventListener('pointerenter', handlePointerEnter);
      track.removeEventListener('pointerdown', handlePointerDown);
      track.removeEventListener('pointermove', handlePointerMove);
      track.removeEventListener('pointerup', endDrag);
      track.removeEventListener('pointercancel', endDrag);
      track.removeEventListener('pointerleave', handlePointerLeave);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div ref={trackRef} className={styles.track} data-visible="false" data-dragging="false">
      <div className={styles.trackVisual}>
        <div ref={fillRef} className={styles.fill} />
      </div>
    </div>
  );
}

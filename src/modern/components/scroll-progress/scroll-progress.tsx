import { useEffect, useRef } from 'react';
import styles from './scroll-progress.module.css';

const FADE_DELAY_MS = 800;

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

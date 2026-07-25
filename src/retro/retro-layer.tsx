import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJunkStore } from '../store/junk-store';
import { JUNK_ITEMS } from '../data/junk-items';
import TrashBin from './components/trash-bin';
import DraggableJunk from './components/draggable-junk';
import styles from './retro-layer.module.css';

export default function RetroLayer() {
  const navigate = useNavigate();
  const binRef = useRef<HTMLDivElement>(null);

  const clearedIds = useJunkStore((s) => s.clearedIds);
  const clearItem = useJunkStore((s) => s.clearItem);
  const setTotal = useJunkStore((s) => s.setTotal);
  const isComplete = useJunkStore((s) => s.isComplete);
  const reset = useJunkStore((s) => s.reset);

  useEffect(() => {
    reset();
    setTotal(JUNK_ITEMS.length);
  }, []);

  useEffect(() => {
    if (isComplete()) {
      const timeout = setTimeout(() => navigate('/'), 400);
      return () => clearTimeout(timeout);
    }
  }, [clearedIds]);

  return (
  <div className={styles.retroLayer}>
    <div className={styles.sidePanel} />

    <div className={styles.centerContent}>
      {JUNK_ITEMS.filter((item) => !clearedIds.has(item.id)).map(
        ({ id, Component }) => (
          <DraggableJunk key={id} id={id} trashBinRef={binRef} onCleared={clearItem}>
            <Component />
          </DraggableJunk>
        )
      )}
      <TrashBin ref={binRef} />
    </div>

    <div className={styles.sidePanelRight} />
  </div>
);
}
import { forwardRef } from 'react';
import styles from '../retro-layer.module.css';

// Swap for real GIF: src/assets/retro/gifs/trash-bin.gif
const TRASH_BIN_PLACEHOLDER = '🗑️';

const TrashBin = forwardRef<HTMLDivElement>((_props, ref) => (
  <div ref={ref} className={styles.trashBin}>
    <span className={styles.trashBinIcon}>{TRASH_BIN_PLACEHOLDER}</span>
  </div>
));

TrashBin.displayName = 'TrashBin';
export default TrashBin;
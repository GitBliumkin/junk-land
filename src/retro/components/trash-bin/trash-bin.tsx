import { forwardRef, type CSSProperties } from 'react';
import trashBinGif from '../../../assets/retro/gifs/trash-bin.webp';
import bentArrow from '../../../assets/retro/images/bent-arrow.png';
import styles from './trash-bin.module.css';

interface TrashBinProps {
  style?: CSSProperties;
}

const TrashBin = forwardRef<HTMLDivElement, TrashBinProps>(({ style }, ref) => (
  <div ref={ref} data-junk-id="trash-bin" className={styles.trashBin} style={style}>
    <div className={styles.dragHint}>
      <span className={styles.dragHintText}>Drag here</span>
      <img src={bentArrow} className={styles.dragHintArrow} alt="" draggable={false} />
    </div>
    <img src={trashBinGif} className={styles.trashBinIcon} alt="Trash bin" draggable={false} />
  </div>
));

TrashBin.displayName = 'TrashBin';
export default TrashBin;

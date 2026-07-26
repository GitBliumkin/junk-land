import { forwardRef, type CSSProperties } from 'react';
import trashBinGif from '../../../assets/retro/gifs/trash-bin.webp';
import bentArrow from '../../../assets/retro/images/bent-arrow.png';
import styles from './trash-bin.module.css';

interface TrashBinProps {
  style?: CSSProperties;
}

// The hint and the icon are separate layers (not nested in one wrapper) so they can stack
// independently against a dragged item: the icon always renders above it, the hint always
// below — a shared wrapper can't give its children opposite z-index outcomes.
const TrashBin = forwardRef<HTMLDivElement, TrashBinProps>(({ style }, ref) => (
  <>
    <div className={styles.dragHintLayer} style={style}>
      <div className={styles.dragHint}>
        <span className={styles.dragHintText}>Drag here</span>
        <img src={bentArrow} className={styles.dragHintArrow} alt="" draggable={false} />
      </div>
    </div>
    <div ref={ref} data-junk-id="trash-bin" className={styles.trashBin} style={style}>
      <img src={trashBinGif} className={styles.trashBinIcon} alt="Trash bin" draggable={false} />
    </div>
  </>
));

TrashBin.displayName = 'TrashBin';
export default TrashBin;

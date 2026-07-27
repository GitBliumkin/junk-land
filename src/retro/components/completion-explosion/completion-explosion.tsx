import explosionGif from '../../../assets/retro/gifs/explosion.gif';
import styles from './completion-explosion.module.css';

export default function CompletionExplosion() {
  return (
    <div className={styles.overlay}>
      <img src={explosionGif} className={styles.gif} alt="" draggable={false} />
    </div>
  );
}

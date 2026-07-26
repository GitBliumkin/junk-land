import flamesImg from '../../../assets/retro/gifs/flames.webp';
import styles from './flame-bar.module.css';

export default function FlameBar() {
  return <img src={flamesImg} className={styles.flameImg} alt="" draggable={false} />;
}

import styles from './nav-gif.module.css';

interface NavGifProps {
  src: string;
  width: number;
}

export default function NavGif({ src, width }: NavGifProps) {
  return (
    <img src={src} alt="" className={styles.navGif} style={{ width }} draggable={false} />
  );
}

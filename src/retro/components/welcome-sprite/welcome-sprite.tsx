import styles from './welcome-sprite.module.css';
import newHeader from '../../../assets/retro/images/new-header.png';

const WELCOME_TEXT = 'Welcome to my page!';

export default function WelcomeSprite() {
  return (
    <div className={styles.welcomeSprite}>
      <img src={newHeader} className={styles.welcomeBadge} alt="" draggable={false} />
      <span>{WELCOME_TEXT}</span>
      <img src={newHeader} className={styles.welcomeBadge} alt="" draggable={false} />
    </div>
  );
}

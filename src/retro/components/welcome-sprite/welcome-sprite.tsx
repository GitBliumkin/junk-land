import styles from './welcome-sprite.module.css';

// Swap for real GIF: src/assets/retro/gifs/welcome-sprite.gif
const WELCOME_SPRITE_PLACEHOLDER = '✨📎 Welcome to my page! 🏢 ✨';

export default function WelcomeSprite() {
  return <div className={styles.welcomeSprite}>{WELCOME_SPRITE_PLACEHOLDER}</div>;
}

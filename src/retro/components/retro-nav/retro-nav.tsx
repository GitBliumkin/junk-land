import bulbActive from '../../../assets/retro/images/bulb-active.png';
import bulbInactive from '../../../assets/retro/images/bulb-inactive.png';
import styles from './retro-nav.module.css';

export interface NavItem {
  id: string;
  label: string;
  /** If set, renders as a direct file download instead of toggling a section panel. */
  href?: string;
}

interface RetroNavProps {
  items: NavItem[];
  openSectionId: string | null;
  onSelect: (id: string) => void;
}

export default function RetroNav({ items, openSectionId, onSelect }: RetroNavProps) {
  return (
    <nav id="retro-nav-bar" className={styles.retroNav}>
      {items.map((item) =>
        item.href ? (
          <a key={item.id} className={styles.navButton} href={item.href} download>
            {item.label}
          </a>
        ) : (
          <button
            key={item.id}
            className={`${styles.navButton} ${item.id === openSectionId ? styles.navButtonActive : ''}`}
            onClick={() => onSelect(item.id)}
          >
            <img
              src={item.id === openSectionId ? bulbActive : bulbInactive}
              className={styles.navIcon}
              alt=""
            />
            {item.label}
          </button>
        )
      )}
    </nav>
  );
}

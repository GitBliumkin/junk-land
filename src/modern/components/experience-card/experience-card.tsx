import type { SyntheticEvent } from 'react';
import type { ExperienceEntry } from '../../../data/experience';
import styles from './experience-card.module.css';

interface ExperienceCardProps {
  entry: ExperienceEntry;
}

// Hides a missing logo image instead of showing the browser's broken-image
// icon — the card's own background then reads as a neutral placeholder
// until a real logo file is dropped in.
function hideBrokenLogo(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.style.visibility = 'hidden';
}

export default function ExperienceCard({ entry }: ExperienceCardProps) {
  const { logoSrc, company, project, role, location, dateRange, techStack, bullets, productUrl } = entry;

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <div className={styles.identity}>
          <div className={styles.titleBlock}>
            <h3 className={styles.role}>{role}</h3>
            <p className={styles.company}>{company}</p>
            {project ? <span className={styles.projectChip}>{project}</span> : null}
          </div>
          <img src={logoSrc} alt="" className={styles.logo} onError={hideBrokenLogo} draggable={false} />
        </div>
        <div className={styles.meta}>
          <span className={styles.location}>{location}</span>
          <span className={styles.dateRange}>{dateRange}</span>
        </div>
      </header>

      {techStack ? <p className={styles.techStack}>{techStack}</p> : null}

      <ul className={styles.bulletList}>
        {/* Bullet strings carry authored <strong> markup (see src/data/experience.ts)
            for the uppercase/red emphasis treatment — trusted static content, not
            user input, so rendering it as HTML here is safe. */}
        {bullets.map((bullet) => (
          <li key={bullet} dangerouslySetInnerHTML={{ __html: bullet }} />
        ))}
      </ul>

      {productUrl ? (
        <a href={productUrl} target="_blank" rel="noreferrer" className={styles.pageLink}>
          Product Page
        </a>
      ) : null}
    </article>
  );
}

import { useLayoutEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import styles from './experience-cards.module.css';
import LazyImage from '../lazy-image/lazy-image';
import { EXPERIENCE } from '../../../data/experience';
import experienceImage1 from '../../../assets/modern/images/expiriance-1.jpg';
import experienceImage2 from '../../../assets/modern/images/experiance-2.jpg';
import experienceImage3 from '../../../assets/modern/images/expepiriance-3.jpg';

const CARDS = [
  { image: experienceImage1, blurred: true, entry: EXPERIENCE[0] },
  { image: experienceImage2, blurred: false, entry: EXPERIENCE[1] },
  { image: experienceImage3, blurred: true, entry: EXPERIENCE[2] },
];

// Poster timing, as fractions of the container's total scroll range:
//   [0, POSTER_ASSEMBLE_END]   — the three lines slide into place.
//   [POSTER_ASSEMBLE_END, POSTER_HOLD_END] — fully assembled and held
//     static (the outer row transform below doesn't start until
//     POSTER_HOLD_END), which is what actually produces the "pinned in
//     place for a while" feel — without this gap, the row would start
//     sliding the instant the lines finished assembling, with no true
//     dwell in between.
//   [POSTER_HOLD_END, 1] — the whole assembled poster slides away with the
//     rest of the row as the cards take its place.
const POSTER_ASSEMBLE_END = 0.15;
const POSTER_HOLD_END = 0.35;

export default function ExperienceCards() {
  const containerRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  const [maxTranslate, setMaxTranslate] = useState(0);

  useLayoutEffect(() => {
    const stageEl = stageRef.current;
    const rowEl = rowRef.current;
    if (!stageEl || !rowEl) return;

    const measure = () => {
      setMaxTranslate(Math.max(0, rowEl.scrollWidth - stageEl.clientWidth));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stageEl);
    observer.observe(rowEl);
    return () => observer.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Poster lines assemble first — top/bottom in from the right, middle from
  // the left — then hold in place, then the whole poster slides away as a
  // single unit along with the rest of the row as the cards take its place.
  const fromRightX = useTransform(scrollYProgress, [0, POSTER_ASSEMBLE_END], ['100%', '0%']);
  const fromLeftX = useTransform(scrollYProgress, [0, POSTER_ASSEMBLE_END], ['-100%', '0%']);
  const x = useTransform(scrollYProgress, [POSTER_HOLD_END, 1], [0, -maxTranslate]);

  return (
    <section ref={containerRef} className={styles.container}>
      <div ref={stageRef} className={styles.stage}>
        <motion.div ref={rowRef} className={styles.row} style={{ x }}>
          <div className={styles.poster}>
            <motion.div className={`${styles.line} ${styles.justified}`} style={{ x: fromRightX }}>
              <span className={styles.accent}>My</span>
              <LazyImage src={experienceImage1} alt="" className={styles.imageInset} draggable={false} />
              <span>Experience</span>
            </motion.div>
            <motion.div className={`${styles.line} ${styles.justified}`} style={{ x: fromLeftX }}>
              <span>Companies</span>
              <LazyImage src={experienceImage2} alt="" className={styles.imageInset} draggable={false} />
              <span>Clients</span>
            </motion.div>
            <motion.div className={`${styles.line} ${styles.justified}`} style={{ x: fromRightX }}>
              <span className={styles.accentBlue}>Results</span>
              <LazyImage src={experienceImage3} alt="" className={styles.imageInset} draggable={false} />
              <span>Projects</span>
            </motion.div>
          </div>
          {CARDS.map(({ image, blurred, entry }) => (
            <div className={styles.card} key={image}>
              <LazyImage
                src={image}
                alt=""
                className={`${styles.cardImage} ${blurred ? styles.cardImageBlurred : ''}`}
                draggable={false}
              />
              <div className={styles.cardShade} />
              <div className={styles.cardBody}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIdentity}>
                    <img src={entry.logoSrc} alt="" className={styles.cardLogo} draggable={false} />
                    <div className={styles.cardTitleBlock}>
                      <h3 className={styles.cardRole}>{entry.role}</h3>
                      <p className={styles.cardCompany}>{entry.company}</p>
                      {entry.project ? <span className={styles.cardChip}>{entry.project}</span> : null}
                    </div>
                  </div>
                  <div className={styles.cardMeta}>
                    <span className={styles.cardLocation}>{entry.location}</span>
                    <span className={styles.cardDate}>{entry.dateRange}</span>
                  </div>
                </div>

                {entry.techStack ? <p className={styles.cardTechStack}>{entry.techStack}</p> : null}

                <p className={styles.cardOverview}>{entry.overview}</p>

                <ul className={styles.cardBulletList}>
                  {/* Bullet strings carry authored <strong> markup (see src/data/experience.ts)
                      for the uppercase/red emphasis treatment — trusted static content, not
                      user input, so rendering it as HTML here is safe. */}
                  {entry.bullets.map((bullet) => (
                    <li key={bullet} dangerouslySetInnerHTML={{ __html: bullet }} />
                  ))}
                </ul>

                {entry.productUrl ? (
                  <a href={entry.productUrl} target="_blank" rel="noreferrer" className={styles.cardPageLink}>
                    Product Page
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

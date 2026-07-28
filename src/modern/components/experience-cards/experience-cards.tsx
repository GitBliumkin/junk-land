import { useLayoutEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import styles from './experience-cards.module.css';
import LazyImage from '../lazy-image/lazy-image';
import { EXPERIENCE } from '../../data/experience';
import { POSTER_ASSEMBLE_END, POSTER_HOLD_END, HOLD_SHARE } from './experience-scroll';
import experienceImage1 from '../../../assets/modern/images/expiriance-1.jpg';
import experienceImage2 from '../../../assets/modern/images/experiance-2.jpg';
import experienceImage3 from '../../../assets/modern/images/expepiriance-3.jpg';

const CARDS = [
  { image: experienceImage1, blurred: true, entry: EXPERIENCE[0] },
  { image: experienceImage2, blurred: false, entry: EXPERIENCE[1] },
  { image: experienceImage3, blurred: true, entry: EXPERIENCE[2] },
];

export default function ExperienceCards() {
  const containerRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [cardCenters, setCardCenters] = useState<number[]>([]);

  useLayoutEffect(() => {
    const stageEl = stageRef.current;
    const rowEl = rowRef.current;
    if (!stageEl || !rowEl) return;

    const measure = () => {
      const stageWidth = stageEl.clientWidth;
      const maxTranslate = Math.max(0, rowEl.scrollWidth - stageWidth);
      const centers = cardRefs.current.map((cardEl) => {
        if (!cardEl) return 0;
        const center = stageWidth / 2 - (cardEl.offsetLeft + cardEl.offsetWidth / 2);
        return Math.max(center, -maxTranslate);
      });
      setCardCenters(centers);
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

  const { scrollYProgress: exitProgress } = useScroll({
    target: containerRef,
    offset: ['end end', 'end start'],
  });

  const cardExitOpacity = useTransform(exitProgress, [0, 0.3], [1, 0]);
  const fromRightX = useTransform(scrollYProgress, [0, POSTER_ASSEMBLE_END], ['100%', '0%']);
  const fromLeftX = useTransform(scrollYProgress, [0, POSTER_ASSEMBLE_END], ['-100%', '0%']);

  const x = useTransform(scrollYProgress, (p) => {
    if (p <= POSTER_HOLD_END || cardCenters.length === 0) return 0;

    const cardCount = cardCenters.length;
    const sliceSize = (1 - POSTER_HOLD_END) / cardCount;
    const localP = p - POSTER_HOLD_END;
    const sliceIndex = Math.min(cardCount - 1, Math.floor(localP / sliceSize));
    const withinSlice = localP - sliceIndex * sliceSize;
    const transitDuration = sliceSize * (1 - HOLD_SHARE);

    const prevCenter = sliceIndex === 0 ? 0 : cardCenters[sliceIndex - 1];
    const thisCenter = cardCenters[sliceIndex];

    if (transitDuration <= 0 || withinSlice >= transitDuration) return thisCenter;
    return prevCenter + (thisCenter - prevCenter) * (withinSlice / transitDuration);
  });

  return (
    <section ref={containerRef} id="experience" className={styles.container}>
      <div ref={stageRef} className={styles.stage}>
        <motion.div className={styles.stageFill} style={{ opacity: cardExitOpacity }} />
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
          {CARDS.map(({ image, blurred, entry }, index) => (
            <div
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className={styles.card}
              key={image}
            >
              <motion.div className={styles.cardBackdrop}>
                <LazyImage
                  src={image}
                  alt=""
                  className={`${styles.cardImage} ${blurred ? styles.cardImageBlurred : ''}`}
                  draggable={false}
                />
                <div className={styles.cardShade} />
              </motion.div>
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
                  {/* Bullet strings carry authored <strong> markup (see src/modern/data/experience.ts)
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

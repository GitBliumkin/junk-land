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

// The [POSTER_HOLD_END, 1] range is divided into one equal slice per card;
// within each slice, the row slides from the previous card's centered
// position to this card's (the "transit"), then sits still there (the
// "hold") until the slice ends — so every card gets a dwell at center
// before the next one starts sliding in, rather than one continuous slide
// straight through all three. The last card's hold simply runs to the end
// of the range, so scrolling further releases the sticky stage into
// whatever comes after this section.
const HOLD_SHARE = 0.55;

export default function ExperienceCards() {
  const containerRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // translateX needed to center each card in the stage, measured from the
  // cards' own natural (untransformed) layout position — offsetLeft is
  // unaffected by the x transform below, since CSS transforms don't move
  // an element in normal flow, only how it paints.
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
        // Never ask to translate further than the row actually extends —
        // centering the last card can otherwise overshoot into the empty
        // space reserved by .row's own padding-right past it.
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

  // Poster lines assemble first — top/bottom in from the right, middle from
  // the left — then hold in place, then the whole poster slides away as a
  // single unit along with the rest of the row as the cards take its place.
  const fromRightX = useTransform(scrollYProgress, [0, POSTER_ASSEMBLE_END], ['100%', '0%']);
  const fromLeftX = useTransform(scrollYProgress, [0, POSTER_ASSEMBLE_END], ['-100%', '0%']);

  // Function form (not the array-range form) deliberately — see the note
  // on TechStack's TechRow component: useTransform(value, [a, b], [c, d])
  // hands narrow sub-ranges of a scroll-linked value off to a native
  // "accelerated" path that doesn't hold its end value correctly, which
  // this piecewise hold/transit logic depends on.
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
          {CARDS.map(({ image, blurred, entry }, index) => (
            <div
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className={styles.card}
              key={image}
            >
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

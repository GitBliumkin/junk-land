import { useLayoutEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import styles from './about-me.module.css';
import aboutMeImage from '../../../assets/modern/images/about-me.jpg';

const ABOUT_TEXT = [
  "Nikita, nice to meet you. I'm a full-stack software engineer based in Toronto. I got into this industry 5 years ago, and what drives me isn't just delivering good work — it's making a real impact and helping the people I work with actually achieve their vision.",
  "Professionally, I've been fortunate to work on some pretty large-scale platforms and design backend systems. I've always stayed agile when it comes to stack, but I'm mostly known for my Spring Boot + Angular projects wired up with Kafka pipelines. My biggest passion is exploring macro architecture, learning from the best in the space to eventually grow into a System Architect role.",
  "Outside of work, I'm into art — street photography especially. If a gallery opening or a show pops up last minute, I'm probably already searching for my ticket.",
];

const REVEAL_SPRING = { stiffness: 1000, damping: 100 };
const EXPAND_END = 0.6;

export default function AboutMe() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const glassBlockRef = useRef<HTMLDivElement>(null);
  const mastheadProbeRef = useRef<HTMLDivElement>(null);
  const nameProbeRef = useRef<HTMLHeadingElement>(null);
  const roleProbeRef = useRef<HTMLSpanElement>(null);
  const textContentRef = useRef<HTMLDivElement>(null);

  const [collapsedHeight, setCollapsedHeight] = useState(0);
  const [stageHeight, setStageHeight] = useState(0);
  const [nameFontPx, setNameFontPx] = useState(0);
  const [roleFontPx, setRoleFontPx] = useState(0);
  const [settledContentHeight, setSettledContentHeight] = useState(0);

  useLayoutEffect(() => {
    const stageEl = stageRef.current;
    const blockEl = glassBlockRef.current;
    const mastheadProbeEl = mastheadProbeRef.current;
    const nameProbeEl = nameProbeRef.current;
    const roleProbeEl = roleProbeRef.current;
    const textContentEl = textContentRef.current;
    if (!stageEl || !blockEl || !mastheadProbeEl || !nameProbeEl || !roleProbeEl || !textContentEl) return;

    const measure = () => {
      const blockCs = getComputedStyle(blockEl);
      const verticalPadding = parseFloat(blockCs.paddingTop) + parseFloat(blockCs.paddingBottom);
      const stageH = stageEl.offsetHeight;
      setStageHeight(stageH);
      setCollapsedHeight(Math.min(mastheadProbeEl.offsetHeight + verticalPadding, stageH));
      setNameFontPx(parseFloat(getComputedStyle(nameProbeEl).fontSize));
      setRoleFontPx(parseFloat(getComputedStyle(roleProbeEl).fontSize));

      const textContentMarginTop = parseFloat(getComputedStyle(textContentEl).marginTop);
      setSettledContentHeight(
        mastheadProbeEl.offsetHeight * 0.45 + textContentMarginTop + textContentEl.offsetHeight + verticalPadding,
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stageEl);
    return () => observer.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const expandProgress = useTransform(scrollYProgress, (p) => Math.min(1, p / EXPAND_END));
  const blockHeight = useTransform(expandProgress, [0, 1], [collapsedHeight, stageHeight]);
  const nameFontSize = useTransform(expandProgress, [0, 0.4], [nameFontPx, nameFontPx * 0.45]);
  const roleFontSize = useTransform(expandProgress, [0, 0.4], [roleFontPx, roleFontPx * 0.75]);
  const textOpacity = useSpring(useTransform(expandProgress, [0.35, 0.75], [0, 1]), REVEAL_SPRING);
  const textY = useSpring(useTransform(expandProgress, [0.35, 0.75], [32, 0]), REVEAL_SPRING);
  const contentCenteringOffset = useTransform(blockHeight, (height) =>
    Math.max(0, (height - settledContentHeight) / 2),
  );

  return (
    <section ref={sectionRef} id="about-me" className={styles.hero}>
      <div ref={stageRef} className={styles.stage}>
        <img src={aboutMeImage} alt="" className={styles.backgroundImage} draggable={false} />
        <motion.div
          ref={glassBlockRef}
          className={styles.glassBlock}
          style={{ height: blockHeight }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div className={styles.contentStack} style={{ marginTop: contentCenteringOffset }}>
            <div className={styles.masthead}>
              <motion.h1
                className={styles.name}
                style={nameFontPx ? { fontSize: nameFontSize } : undefined}
              >
                <span>Nikita</span>
                <span>Bliumkin</span>
              </motion.h1>
              <motion.span
                className={styles.role}
                style={roleFontPx ? { fontSize: roleFontSize } : undefined}
              >
                Software Developer
              </motion.span>
            </div>
            <motion.div ref={textContentRef} className={styles.textContent} style={{ opacity: textOpacity, y: textY }}>
              <h2 className={styles.heading}>About Me</h2>
              {ABOUT_TEXT.map((paragraph) => (
                <p key={paragraph} className={styles.paragraph}>
                  {paragraph}
                </p>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
        <div
          aria-hidden
          ref={mastheadProbeRef}
          className={styles.masthead}
          style={{ position: 'absolute', top: 0, left: 0, visibility: 'hidden', pointerEvents: 'none' }}
        >
          <h1 ref={nameProbeRef} className={styles.name}>
            <span>Nikita</span>
            <span>Bliumkin</span>
          </h1>
          <span ref={roleProbeRef} className={styles.role}>
            Software Developer
          </span>
        </div>
      </div>
    </section>
  );
}

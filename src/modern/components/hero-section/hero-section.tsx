import { useLayoutEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import styles from './hero-section.module.css';
import aboutMeImage from '../../../assets/modern/images/about-me.jpg';

// TODO: swap in real bio copy.
const ABOUT_TEXT = [
  "Nikita, nice to meet you. I'm a full-stack software engineer based in Toronto. I got into this industry 5 years ago, and what drives me isn't just delivering good work — it's making a real impact and helping the people I work with actually achieve their vision.",
  "Professionally, I've been fortunate to work on some pretty large-scale platforms and design backend systems. I've always stayed agile when it comes to stack, but I'm mostly known for my Spring Boot + Angular projects wired up with Kafka pipelines. My biggest passion is exploring macro architecture, learning from the best in the space to eventually grow into a System Architect role.",
  "Outside of work, I'm into art — street photography especially. If a gallery opening or a show pops up last minute, I'm probably already searching for my ticket.",
];

// framer-motion 12 + React 19: writing a raw scroll-jump value straight to a
// non-transform, non-layout CSS property (opacity) doesn't reach the DOM.
// Routing through useSpring runs it through the normal animation frameloop
// instead, which writes correctly — kept snappy so it still reads scroll-linked.
const REVEAL_SPRING = { stiffness: 1000, damping: 100 };

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const glassBlockRef = useRef<HTMLDivElement>(null);

  // Hidden probes mirror the masthead's markup/classes so they resolve the
  // same container-relative (cqi) font sizes, but are never touched by the
  // scroll-driven shrink animation below. Measuring from the *live* masthead
  // instead created a feedback loop: shrinking it changed its own size,
  // which re-triggered the resize observer, which re-measured the
  // already-shrunk size as the new "natural" baseline, spiraling to zero.
  const mastheadProbeRef = useRef<HTMLDivElement>(null);
  const nameProbeRef = useRef<HTMLHeadingElement>(null);
  const roleProbeRef = useRef<HTMLSpanElement>(null);
  const textContentRef = useRef<HTMLDivElement>(null);

  const [collapsedHeight, setCollapsedHeight] = useState(0);
  const [stageHeight, setStageHeight] = useState(0);
  const [nameFontPx, setNameFontPx] = useState(0);
  const [roleFontPx, setRoleFontPx] = useState(0);
  // Content height once fully settled (masthead shrunk + about text
  // revealed), used to center the content when the fully-expanded panel
  // (which always reaches the stage's full height) ends up taller than
  // what it holds — otherwise that slack collects as dead space below the
  // paragraph on tall screens instead of splitting evenly top and bottom.
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
      // Capped to the stage's own height so on very short viewports, where
      // the masthead alone can't fully fit, it clips gracefully rather than
      // pushing the panel taller than the viewport itself.
      setCollapsedHeight(Math.min(mastheadProbeEl.offsetHeight + verticalPadding, stageH));
      setNameFontPx(parseFloat(getComputedStyle(nameProbeEl).fontSize));
      setRoleFontPx(parseFloat(getComputedStyle(roleProbeEl).fontSize));

      const textContentMarginTop = parseFloat(getComputedStyle(textContentEl).marginTop);
      setSettledContentHeight(
        mastheadProbeEl.offsetHeight * 0.45 + textContentMarginTop + textContentEl.offsetHeight + verticalPadding,
      );
    };

    measure();
    // Only the stage (i.e. container width) is watched — it's the sole
    // external driver of these values via the cqi-based type scale. The
    // live text content's own box size never changes (only its opacity and
    // position do), so reading it here on stage resize is safe too.
    const observer = new ResizeObserver(measure);
    observer.observe(stageEl);
    return () => observer.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // The panel expands from its resting content height to the full stage
  // height, so it always fully covers the viewport by the end of the scroll
  // instead of stopping short and leaving a strip of the photo visible.
  const blockHeight = useTransform(scrollYProgress, [0, 1], [collapsedHeight, stageHeight]);

  // Shrinking the masthead as you scroll frees up vertical room for the
  // about text, so the fully expanded panel doesn't need to out-grow the
  // viewport to fit everything on shorter screens without clipping.
  const nameFontSize = useTransform(scrollYProgress, [0, 0.4], [nameFontPx, nameFontPx * 0.45]);
  const roleFontSize = useTransform(scrollYProgress, [0, 0.4], [roleFontPx, roleFontPx * 0.75]);

  const textOpacity = useSpring(useTransform(scrollYProgress, [0.35, 0.75], [0, 1]), REVEAL_SPRING);
  const textY = useSpring(useTransform(scrollYProgress, [0.35, 0.75], [32, 0]), REVEAL_SPRING);

  // Zero for as long as the panel is smaller than (or equal to) its content
  // — i.e. throughout the resting/top-aligned look — and only grows once
  // the panel has expanded past what the content needs, splitting the
  // slack evenly above and below instead of letting it pool at the bottom.
  const contentCenteringOffset = useTransform(blockHeight, (height) =>
    Math.max(0, (height - settledContentHeight) / 2),
  );

  return (
    <section ref={sectionRef} className={styles.hero}>
      <div ref={stageRef} className={styles.stage}>
        <img src={aboutMeImage} alt="" className={styles.backgroundImage} draggable={false} />
        <motion.div ref={glassBlockRef} className={styles.glassBlock} style={{ height: blockHeight }}>
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

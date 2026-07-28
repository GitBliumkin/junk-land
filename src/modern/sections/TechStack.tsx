import { useLayoutEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import styles from './TechStack.module.css';
import techImage from '../../assets/modern/images/technologies.jpg';

const TECH_STACK = [
  { category: 'Languages', items: 'Java, TypeScript, JavaScript, Scala' },
  { category: 'Backend', items: 'Spring Boot, NestJS, Microservices, REST APIs' },
  { category: 'Frontend', items: 'Angular, React, HTML5, CSS3' },
  { category: 'Databases', items: 'PostgreSQL, MySQL, DynamoDB, MongoDB' },
  { category: 'Messaging', items: 'Kafka, IBM MQ, Redis' },
  { category: 'Cloud & DevOps', items: 'AWS, Docker, CI/CD, Jenkins' },
  { category: 'Tools', items: 'OpenSearch, Elasticsearch, Git, Jira' },
  { category: 'AI Tooling', items: 'GitHub Copilot, Claude' },
];

// Each row's reveal window overlaps the next by 0.2 of the shared scroll
// range, so rows 1-8 are evenly distributed but don't feel like a rigid
// one-at-a-time slideshow — the last row's window ends exactly at 1 so it
// reaches full opacity right as the section finishes its scroll passage.
const ROW_WINDOW = 0.3;
const ROW_STEP = (1 - ROW_WINDOW) / (TECH_STACK.length - 1);

// Matches the @media (max-width: 640px) breakpoint in TechStack.module.css
// — below it the list drops the indent entirely (see the CSS), so there's
// no point measuring/applying one here either.
const INDENT_MIN_CONTAINER_WIDTH = 640;

interface TechRowProps {
  category: string;
  items: string;
  progress: MotionValue<number>;
  range: [number, number];
}

function TechRow({ category, items, progress, range }: TechRowProps) {
  const [start, end] = range;
  // Framer Motion's array-form useTransform(value, [start, end], [0, 1])
  // hands off to a native, hardware-accelerated scroll animation whenever
  // the source is a scroll-linked MotionValue — but that fast path only
  // handles ranges spanning the source's full 0-1 span correctly. With 8
  // rows each owning a narrow sub-range, it was producing values that rose
  // to 1 and then fell back to 0 past each row's own window, instead of
  // holding at 1. Passing a plain function instead of a range array opts
  // out of that fast path and computes the clamp manually.
  const progressInWindow = (p: number) => Math.min(1, Math.max(0, (p - start) / (end - start)));
  const opacity = useTransform(progress, progressInWindow);
  const y = useTransform(progress, (p) => 16 * (1 - progressInWindow(p)));

  return (
    <motion.li className={styles.row} style={{ opacity, y }}>
      <span className={styles.rowCategory}>{category}</span>
      <span className={styles.rowItems}>{items}</span>
    </motion.li>
  );
}

export default function TechStack() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  // The list's left edge lines up with the end of "Daily tools" —
  // the header is centered as a block, so that position moves whenever the
  // header's own width (font size, viewport width) changes. Measuring it
  // directly (rather than guessing a value in CSS) is what keeps the two
  // in sync; same ResizeObserver-on-a-ref pattern hero-section.tsx uses for
  // its own measured layout.
  const [listIndent, setListIndent] = useState(0);

  useLayoutEffect(() => {
    const contentEl = contentRef.current;
    const subtitleEl = subtitleRef.current;
    if (!contentEl || !subtitleEl) return;

    const measure = () => {
      if (contentEl.clientWidth <= INDENT_MIN_CONTAINER_WIDTH) {
        setListIndent(0);
        return;
      }
      // The list (a flex child of contentEl) renders starting at
      // contentEl's padding edge, not its border edge — margin-left is
      // added on top of that padding, so the padding has to be subtracted
      // out of the baseline here or it'd be double-counted.
      const contentPaddingLeft = parseFloat(getComputedStyle(contentEl).paddingLeft);
      const contentInnerLeft = contentEl.getBoundingClientRect().left + contentPaddingLeft;
      const subtitleRight = subtitleEl.getBoundingClientRect().right;
      setListIndent(Math.max(0, subtitleRight - contentInnerLeft));
    };

    measure();
    // Observes the subtitle itself too, not just the content column — its
    // box is fit-content (see .subtitle's align-self), so it resizes (and
    // re-triggers this) when the web font swaps in after first paint,
    // which changing the container's own width alone wouldn't catch.
    const observer = new ResizeObserver(measure);
    observer.observe(contentEl);
    observer.observe(subtitleEl);
    return () => observer.disconnect();
  }, []);

  // A single scroll source drives everything in this section — each row's
  // reveal and the corner image's clip-path — so they progress together as
  // the user scrolls through it instead of firing as separate,
  // independently-triggered effects.
  //
  // Offset ends at 'end end' (section bottom meets viewport bottom), not
  // 'end start' — this section is the last thing on the page, so the
  // document can never scroll far enough for its bottom to reach the
  // viewport's top. 'end end' completes exactly when the section finishes
  // entering the viewport, which is also the natural end of the page.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end end'],
  });

  // Grows from a hidden sliver tucked into the image box's own bottom-left
  // corner out to the box's full bounds — the box itself is already
  // positioned and sized (60% of the section's height, bottom-left of the
  // stage; see .imageReveal), so this only animates how much of it shows.
  const clipPath = useTransform(scrollYProgress, [0, 1], ['inset(100% 100% 0% 0%)', 'inset(0% 0% 0% 0%)']);

  // Header rises into place over the first 0.2 of the section's own scroll
  // range — that range starts right as this section's top clears the
  // viewport bottom (see the 'start end' offset above), which is the exact
  // moment the sticky ExperienceCards stage releases with its last card
  // filling the screen. Starting the heading well below its resting spot
  // (48px, more than a row's 16px) and animating it up from there reads as
  // the text rising out from underneath that last card rather than simply
  // being present when the section arrives.
  const headerProgress = (p: number) => Math.min(1, Math.max(0, p / 0.2));
  const headerOpacity = useTransform(scrollYProgress, headerProgress);
  const headerY = useTransform(scrollYProgress, (p) => 48 * (1 - headerProgress(p)));

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.stage}>
        <div ref={contentRef} className={styles.content}>
          <motion.header className={styles.header} style={{ opacity: headerOpacity, y: headerY }}>
            <h2 className={styles.heading}>Technologies</h2>
            <p ref={subtitleRef} className={styles.subtitle}>
              Daily tools
            </p>
          </motion.header>

          <ul className={styles.list} style={{ marginLeft: listIndent || undefined }}>
            {TECH_STACK.map(({ category, items }, index) => {
              const start = index * ROW_STEP;
              const end = start + ROW_WINDOW;
              return (
                <TechRow
                  key={category}
                  category={category}
                  items={items}
                  progress={scrollYProgress}
                  range={[start, end]}
                />
              );
            })}
          </ul>
        </div>

        <motion.div className={styles.imageReveal} style={{ clipPath }}>
          <img src={techImage} alt="" className={styles.imageRevealImg} draggable={false} />
        </motion.div>
      </div>
    </section>
  );
}

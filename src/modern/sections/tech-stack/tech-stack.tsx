import { useLayoutEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import styles from './tech-stack.module.css';
import techImage from '../../../assets/modern/images/technologies.jpg';

const TECH_STACK = [
  { category: 'Languages', items: 'Java, TypeScript, JavaScript, Scala' },
  { category: 'Backend', items: 'Spring Boot, NestJS, Microservices, REST/SOAP APIs' },
  { category: 'Frontend', items: 'Angular, React, HTML5, CSS3' },
  { category: 'Databases', items: 'PostgreSQL, MySQL, DynamoDB, MongoDB, Redis' },
  { category: 'Messaging', items: 'Kafka, IBM MQ, Redis Pub/Sub' },
  { category: 'Cloud & DevOps', items: 'AWS, Docker, CI/CD, Jenkins' },
  { category: 'Tools', items: 'OpenSearch, Elasticsearch, Git, Jira' },
  { category: 'AI Tooling', items: 'GitHub Copilot, Claude' },
];

// This section is pinned (see .stage's position: sticky) for its own scroll
// range, the same way ExperienceCards pins its stage — [0, ASSEMBLE_END] of
// that pinned range is spent growing the corner image in, then it holds
// fully assembled for the rest of the range. Reaching the end of the range
// (scrollYProgress hitting 1) is what releases the pin and lets the section
// slide away as a block, revealing Education underneath — same handoff
// ExperienceCards uses to reveal this section in the first place.
//
// The header and row list aren't part of that assemble sequence — unlike
// the old version of this component, they're not animated in at all.
// They're fully visible from the moment this section exists in the DOM, so
// that as ExperienceCards' own pinned stage slides away above it, this
// section's text reads as having been sitting there underneath the whole
// time and simply uncovered, rather than as new content animating in on
// its own timeline after the handoff.
const ASSEMBLE_END = 0.35;

// Matches the @media (max-width: 640px) breakpoint in tech-stack.module.css
// — below it the list drops the indent entirely (see the CSS), so there's
// no point measuring/applying one here either.
const INDENT_MIN_CONTAINER_WIDTH = 640;

export default function TechStack() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  // The list's left edge lines up with the end of "Daily tools" —
  // the header is centered as a block, so that position moves whenever the
  // header's own width (font size, viewport width) changes. Measuring it
  // directly (rather than guessing a value in CSS) is what keeps the two
  // in sync; same ResizeObserver-on-a-ref pattern about-me.tsx uses for
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

  // 'start start'/'end end' (not 'start end'/'end end'): this section is now
  // pinned via .stage's position: sticky, so progress should track the
  // pinned scroll range itself (0 at the moment .section's top reaches the
  // viewport top and the pin engages, 1 at the moment .section's bottom
  // reaches the viewport bottom and the pin releases) — the same offset
  // ExperienceCards uses for its own pinned stage.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // Assembling (just the image now — see the note by ASSEMBLE_END above)
  // happens over [0, ASSEMBLE_END] of the pinned range; this remaps that
  // sub-range to a full 0-1 so it clamps at fully-assembled once raw
  // progress passes ASSEMBLE_END, for the rest of the pin.
  const assembleProgress = useTransform(scrollYProgress, (p) => Math.min(1, p / ASSEMBLE_END));

  // The box itself is already positioned and sized (60% of the section's
  // height, bottom-left of the stage, flush with the stage's own left and
  // bottom edges; see .imageReveal) and stays put the whole time — what
  // animates is the image sliding across it and rotating upright, out of
  // the stage's bottom-left corner. Sliding a full box-width left and a
  // full box-height down (translate(-100%, 100%)) lines the image up
  // exactly with that corner, since the box itself already starts at
  // left: 0 / bottom: 0 — so at progress 0 the image sits just outside the
  // stage entirely, tucked against its bottom-left corner, rather than
  // hidden somewhere arbitrary off-screen. transformOrigin: 'bottom left'
  // pivots the rotation on that same corner, so the image reads as
  // swinging up out of the corner into place rather than spinning in
  // place while it also happens to be translating.
  const slideX = useTransform(assembleProgress, [0, 1], ['-100%', '0%']);
  const slideY = useTransform(assembleProgress, [0, 1], ['100%', '0%']);
  const rotate = useTransform(assembleProgress, [0, 1], [45, 0]);

  return (
    <section ref={sectionRef} id="technologies" className={styles.section}>
      <div className={styles.stage}>
        <div ref={contentRef} className={styles.content}>
          <header className={styles.header}>
            <h2 className={styles.heading}>Technologies</h2>
            <p ref={subtitleRef} className={styles.subtitle}>
              Daily tools
            </p>
          </header>

          <ul className={styles.list} style={{ marginLeft: listIndent || undefined }}>
            {TECH_STACK.map(({ category, items }) => (
              <li key={category} className={styles.row}>
                <span className={styles.rowCategory}>{category}</span>
                <span className={styles.rowItems}>{items}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.imageReveal}>
          <motion.img
            src={techImage}
            alt=""
            className={styles.imageRevealImg}
            draggable={false}
            style={{ x: slideX, y: slideY, rotate, transformOrigin: 'bottom left' }}
          />
        </div>
      </div>
    </section>
  );
}

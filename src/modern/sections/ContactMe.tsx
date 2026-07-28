import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import styles from './ContactMe.module.css';
import contactImage from '../../assets/modern/images/contact-me.jpg';

const LINKEDIN_URL = 'https://www.linkedin.com/in/nikita-bliumkin/';
const GITHUB_URL = 'https://github.com/GitBliumkin';
const EMAIL = 'n.bliumkin@gmail.com';
const PHONE = '(343) 988-2229';
const PHONE_HREF = 'tel:+13439882229';

// This section is pinned (see .stage's position: sticky) for its own scroll
// range, same mechanic as TechStack — [0, ASSEMBLE_END] of that pinned range
// is spent assembling (header rise, details fade-up), then it holds fully
// assembled for the rest of the range. There's nothing after it to hand off
// to; the hold just means the finished layout is what's on screen for the
// remainder of the scroll to the true bottom of the page. The background
// photo itself isn't part of this assemble sequence — it's fully visible
// from the start, since Education's own slide-away (see Education.tsx) is
// what reveals it; animating it in again here would undercut that handoff.
const ASSEMBLE_END = 0.45;

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 2C6.48 2 2 6.58 2 12.19c0 4.49 2.87 8.3 6.84 9.65.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.88-2.78.61-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.49-1.11-1.49-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.56-1.14-4.56-5.05 0-1.12.39-2.03 1.03-2.74-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05a9.4 9.4 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.71 1.03 1.62 1.03 2.74 0 3.92-2.34 4.78-4.57 5.04.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.19C22 6.58 17.52 2 12 2z" />
    </svg>
  );
}

export default function ContactMe() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const assembleProgress = useTransform(scrollYProgress, (p) => Math.min(1, p / ASSEMBLE_END));

  // Header rises into place over the first slice of the assemble range,
  // starting well below its resting spot so it reads as rising up from the
  // bottom of the screen rather than simply fading in where it sits.
  const headerProgress = (p: number) => Math.min(1, Math.max(0, p / 0.4));
  const headerOpacity = useTransform(assembleProgress, headerProgress);
  const headerY = useTransform(assembleProgress, (p) => 72 * (1 - headerProgress(p)));

  // Icons + contact details settle in over a window that starts after the
  // header's already under way, so the two don't compete for attention in
  // the same instant.
  const detailsProgress = (p: number) => Math.min(1, Math.max(0, (p - 0.3) / 0.6));
  const detailsOpacity = useTransform(assembleProgress, detailsProgress);
  const detailsY = useTransform(assembleProgress, (p) => 20 * (1 - detailsProgress(p)));

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.stage}>
        <div
          aria-hidden="true"
          className={styles.backgroundImage}
          style={{ backgroundImage: `url(${contactImage})` }}
        />

        <div className={styles.content}>
          <motion.h2 className={styles.heading} style={{ opacity: headerOpacity, y: headerY }}>
            Contact Me
          </motion.h2>

          <div className={styles.detailsWrap}>
            <motion.div className={styles.details} style={{ opacity: detailsOpacity, y: detailsY }}>
              <div className={styles.icons}>
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className={styles.iconLink}
                >
                  <LinkedInIcon />
                </a>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  className={styles.iconLink}
                >
                  <GitHubIcon />
                </a>
              </div>

              <div className={styles.contactInfo}>
                <a href={`mailto:${EMAIL}`} className={styles.contactLink}>
                  {EMAIL}
                </a>
                <a href={PHONE_HREF} className={styles.contactLink}>
                  {PHONE}
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

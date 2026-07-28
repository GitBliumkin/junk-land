import { useLayoutEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import styles from './tech-stack.module.css';
import techImage from '../../../assets/modern/images/technologies.jpg';
import { useIsMobile } from '../../../shared/use-is-mobile';

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

const ASSEMBLE_END = 0.35;


const INDENT_MIN_CONTAINER_WIDTH = 640;

export default function TechStack() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const [listIndent, setListIndent] = useState(0);
  const isMobile = useIsMobile();

  useLayoutEffect(() => {
    const contentEl = contentRef.current;
    const subtitleEl = subtitleRef.current;
    if (!contentEl || !subtitleEl) return;

    const measure = () => {
      if (contentEl.clientWidth <= INDENT_MIN_CONTAINER_WIDTH) {
        setListIndent(0);
        return;
      }

      const contentPaddingLeft = parseFloat(getComputedStyle(contentEl).paddingLeft);
      const contentInnerLeft = contentEl.getBoundingClientRect().left + contentPaddingLeft;
      const subtitleRight = subtitleEl.getBoundingClientRect().right;
      setListIndent(Math.max(0, subtitleRight - contentInnerLeft));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(contentEl);
    observer.observe(subtitleEl);
    return () => observer.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const assembleProgress = useTransform(scrollYProgress, (p) => Math.min(1, p / ASSEMBLE_END));
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
            style={
              isMobile
                ? { x: '0%', y: '0%', rotate: 0 }
                : { x: slideX, y: slideY, rotate, transformOrigin: 'bottom left' }
            }
          />
        </div>
      </div>
    </section>
  );
}

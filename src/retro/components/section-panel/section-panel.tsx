import { motion } from 'framer-motion';
import type { SectionItem } from '../../data/junk-items';
import styles from './section-panel.module.css';

const LOAD_DELAY = 0.6;

// Renders `**text**` spans (key technologies/achievements) as highlighted.
function highlight(text: string, styles: Record<string, string>) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <span key={i} className={styles.highlight}>
        {part.slice(2, -2)}
      </span>
    ) : (
      part
    )
  );
}

interface SectionPanelProps {
  section: SectionItem;
  pageIndex: number;
  onPageChange: (index: number) => void;
}

export default function SectionPanel({ section, pageIndex, onPageChange }: SectionPanelProps) {
  const pages = section.pages;
  const page = pages?.[pageIndex];

  return (
    <div className={styles.sectionPanel}>
      <motion.div
        key={section.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: LOAD_DELAY, duration: 0 }}
      >
        <h2 className={styles.sectionTitle}>{section.title}</h2>

        {page ? (
          <div className={styles.pageWrap}>
            <div className={styles.pageContent}>
              <div className={styles.pageIntro}>
                <div className={styles.pageHeaderRow}>
                  <div>
                    <p className={styles.pageHeader}>{page.role}</p>
                    <p className={styles.pageMeta}>
                      {page.company} · {page.location}
                    </p>
                    <p className={styles.pageDates}>{page.dates}</p>
                  </div>
                  {page.link && (
                    <a
                      className={styles.pageLinkButton}
                      href={page.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit Site <span className={styles.linkArrow}>↗</span>
                    </a>
                  )}
                </div>
                {page.subtext && (
                  <p className={styles.pageSubtext}>{highlight(page.subtext, styles)}</p>
                )}
              </div>
              <div className={styles.pageBullets}>
                {page.bullets.map((text, i) => (
                  <p key={i} className={styles.pageBullet}>
                    {highlight(text, styles)}
                  </p>
                ))}
              </div>
            </div>

            {pages && pages.length > 1 && (
              <div className={styles.pageNav}>
                <button
                  type="button"
                  className={styles.pageArrow}
                  onClick={() => onPageChange(Math.max(0, pageIndex - 1))}
                  disabled={pageIndex === 0}
                  aria-label="Previous page"
                >
                  <span className={styles.pageArrowGlyphLeft} />
                </button>
                <span className={styles.pageCount}>
                  {pageIndex + 1} / {pages.length}
                </span>
                <button
                  type="button"
                  className={styles.pageArrow}
                  onClick={() => onPageChange(Math.min(pages.length - 1, pageIndex + 1))}
                  disabled={pageIndex === pages.length - 1}
                  aria-label="Next page"
                >
                  <span className={styles.pageArrowGlyphRight} />
                </button>
              </div>
            )}
          </div>
        ) : (
          (() => {
            const framed = section.image?.framed ?? false;

            const imageBlock = section.image && (
              <div key="image">
                {(() => {
                  const stack = (
                    <div className={styles.sectionImageStack}>
                      {section.image.outlineSrc && (
                        <img
                          src={section.image.outlineSrc}
                          alt=""
                          aria-hidden="true"
                          loading="lazy"
                          decoding="async"
                          className={styles.sectionImageOutline}
                        />
                      )}
                      <img
                        src={section.image.src}
                        alt={section.image.alt}
                        loading="lazy"
                        decoding="async"
                        className={styles.sectionImageTop}
                      />
                    </div>
                  );
                  return framed ? (
                    <>
                      <div className={styles.photoFrame}>
                        <div className={styles.photoFrameInner}>{stack}</div>
                      </div>
                      {section.image.links && (
                        <div className={styles.photoLinks}>
                          {section.image.links.map(({ label, href }) => (
                            <a
                              key={href}
                              className={styles.photoLinkButton}
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {label} <span className={styles.linkArrow}>↗</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className={styles.sectionImageFrame}>{stack}</div>
                  );
                })()}
              </div>
            );

            const linesBlock = (
              <div key="lines" className={styles.sectionLines}>
                {(section.lines ?? []).map((text, i) => {
                  const [, label, rest] = text.match(/^([^:]+:)\s*(.*)$/) ?? [];
                  return (
                    <p key={i} className={styles.sectionLine}>
                      {label ? (
                        <>
                          <strong>{label}</strong> {rest}
                        </>
                      ) : (
                        text
                      )}
                    </p>
                  );
                })}
              </div>
            );

            const iconsBlock = section.images && section.images.length > 0 && (
              <div key="icons" className={styles.techLogos}>
                {section.images.map((img) => (
                  <img
                    key={img.src}
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    decoding="async"
                    className={styles.techLogo}
                  />
                ))}
              </div>
            );

            const techLayout = !!(section.images && section.images.length > 0);

            const body = (
              <div
                className={
                  framed
                    ? `${styles.sectionBody} ${styles.sectionBodyPhotoRight}`
                    : techLayout
                      ? `${styles.sectionBody} ${styles.sectionBodyTech}`
                      : styles.sectionBody
                }
              >
                {framed ? (
                  <>
                    {linesBlock}
                    {imageBlock}
                  </>
                ) : (
                  <>
                    {imageBlock}
                    {linesBlock}
                  </>
                )}
                {iconsBlock}
              </div>
            );

            return !framed ? <div className={styles.sectionBodyOuter}>{body}</div> : body;
          })()
        )}
      </motion.div>
    </div>
  );
}

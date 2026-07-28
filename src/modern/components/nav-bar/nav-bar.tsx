import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './nav-bar.module.css';
import { getExperienceCardScrollProgress } from '../experience-cards/experience-scroll';
import { setUrlHash } from '../../../shared/url-hash';
import { RESUME_PATH } from '../../../shared/resume';

// Order matches CARDS in experience-cards.tsx (== EXPERIENCE[0..2]), so index
// here lines up directly with the index passed to getExperienceCardScrollProgress.
// hash is this item's address in the URL (see setUrlHash/SECTION_ACTIONS below) —
// there's no separate DOM id per card to reuse, so these are made up.
const EXPERIENCE_DROPDOWN_ITEMS = [
  { label: 'MC Pro', hash: 'experience-mc-pro' },
  { label: 'Viewbid', hash: 'experience-viewbid' },
  { label: 'Fiserv', hash: 'experience-fiserv' },
];

const SECTION_LINKS = [
  // Technologies' own element starts 100vh before it visually reads as
  // "revealed" — see tech-stack.module.css's margin-top: -100vh, which pulls
  // its box back to where ExperienceCards' pin releases so its sticky stage
  // is already stuck (and ready) underneath the last experience card while
  // that card is still fading out on top of it (see experience-cards.tsx's
  // cardExitOpacity). Landing at the bare top of the element would leave
  // that fading card visually blocking it, so this jumps one viewport
  // height further in, past the handoff, to where it's actually clear.
  { id: 'technologies', label: 'Technologies', extraViewportHeights: 1 },
  { id: 'education', label: 'Education', extraViewportHeights: 0 },
];

// About Me and Contact Me's hashes double as their section's real DOM id
// (see sections/about-me/about-me.tsx / sections/contact-me/contact-me.tsx);
// Experience's cards don't have one each, hence EXPERIENCE_DROPDOWN_ITEMS
// carrying its own made-up hashes.
const ABOUT_ME_HASH = 'about-me';
const CONTACT_ME_HASH = 'contact-me';

function scrollToId(id: string, extraViewportHeights = 0, instant = false) {
  const el = document.getElementById(id);
  if (!el) return;
  const targetY = window.scrollY + el.getBoundingClientRect().top + extraViewportHeights * window.innerHeight;
  window.scrollTo({ top: targetY, behavior: instant ? 'auto' : 'smooth' });
}

// About Me is pinned (see sections/about-me/about-me.tsx) for its own scroll range —
// jumping to its bare element top lands at the very start of that range,
// before the panel has expanded to full-screen or the bio text has revealed
// (i.e. the collapsed masthead-only look). EXPAND_END there is 0.6 (panel
// reaches full-screen and text finishes revealing by raw progress 0.45); this
// targets 0.75, safely inside the hold that follows, so "About Me" always
// lands on the fully-opened, full-screen state instead of the collapsed one.
const ABOUT_ME_OPENED_PROGRESS = 0.75;

function scrollToAboutMeOpened(instant = false) {
  const container = document.getElementById('about-me');
  if (!container) return;

  const scrollRange = container.offsetHeight - window.innerHeight;
  if (scrollRange <= 0) {
    container.scrollIntoView({ behavior: instant ? 'auto' : 'smooth', block: 'start' });
    return;
  }

  const documentTop = window.scrollY + container.getBoundingClientRect().top;
  const targetY = documentTop + ABOUT_ME_OPENED_PROGRESS * scrollRange;
  window.scrollTo({ top: targetY, behavior: instant ? 'auto' : 'smooth' });
}

// Contact Me is the last section on the page and holds its fully-assembled
// layout for the remainder of the document's scroll (see sections/contact-me/contact-me.tsx) —
// so "the end" of that section really means the true bottom of the page,
// not just its element's top edge.
function scrollToBottom(instant = false) {
  const targetY = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo({ top: targetY, behavior: instant ? 'auto' : 'smooth' });
}

// Experience's cards aren't separate scroll targets in the document — a
// single pinned stage horizontally transitions between them based on how far
// you've scrolled through the section (see experience-cards.tsx) — so
// jumping to one means computing the scrollY that lands mid-way through that
// card's own hold window, not just scrolling an element into view.
function scrollToExperienceCard(index: number, instant = false) {
  const container = document.getElementById('experience');
  if (!container) return;

  const scrollRange = container.offsetHeight - window.innerHeight;
  if (scrollRange <= 0) {
    container.scrollIntoView({ behavior: instant ? 'auto' : 'smooth', block: 'start' });
    return;
  }

  const documentTop = window.scrollY + container.getBoundingClientRect().top;
  const targetY = documentTop + getExperienceCardScrollProgress(index) * scrollRange;
  window.scrollTo({ top: targetY, behavior: instant ? 'auto' : 'smooth' });
}

// Single registry mapping a URL hash back to the scroll action that lands on
// it — drives both the initial-load restore and popstate (back/forward)
// handling below, built from the same arrays the nav buttons render from so
// there's one source of truth for "what hash goes where".
const SECTION_ACTIONS: Record<string, (instant?: boolean) => void> = {
  [ABOUT_ME_HASH]: (instant) => scrollToAboutMeOpened(instant),
  [CONTACT_ME_HASH]: (instant) => scrollToBottom(instant),
  ...Object.fromEntries(
    EXPERIENCE_DROPDOWN_ITEMS.map(({ hash }, index) => [
      hash,
      (instant?: boolean) => scrollToExperienceCard(index, instant),
    ]),
  ),
  ...Object.fromEntries(
    SECTION_LINKS.map(({ id, extraViewportHeights }) => [
      id,
      (instant?: boolean) => scrollToId(id, extraViewportHeights, instant),
    ]),
  ),
};

// How long the nav stays hidden after scrolling stops before it reappears.
const SCROLL_IDLE_DELAY_MS = 1000;

// ScrollProgress's own track (see scroll-progress.module.css) is a hairline
// 4px wide, right: 0.5rem from the edge — too thin to reliably hover. This
// widens the *hover hit-zone* (not the visual track) to a generous strip
// along the right edge so mousing anywhere near the scrollbar counts.
const SCROLLBAR_HOVER_ZONE_PX = 32;
// Extra slack around the nav's own (possibly hidden/translated) rect so
// approaching it from just outside its edge still counts as a hover.
const NAV_HOVER_PADDING_PX = 12;

export default function NavBar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [onLightSection, setOnLightSection] = useState(false);
  const [hoverVisible, setHoverVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) setDropdownOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDropdownOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout>;
    // Education is the one section with a light (--modern-color-bone)
    // background instead of the page's dark ink (see sections/education/education.module.css);
    // its .stage is sticky-pinned full-screen for the section's whole scroll
    // range, so the nav sits over that light background for as long as the
    // section's element spans the very top of the viewport.
    const educationEl = document.getElementById('education');

    const handleScroll = () => {
      if (educationEl) {
        const rect = educationEl.getBoundingClientRect();
        setOnLightSection(rect.top <= 0 && rect.bottom > 0);
      }

      if (dropdownOpen) return;
      setHidden(true);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => setHidden(false), SCROLL_IDLE_DELAY_MS);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(idleTimer);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    let queued = false;

    const handlePointerMove = (event: PointerEvent) => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        const navEl = navRef.current;
        const overScrollbar = event.clientX >= window.innerWidth - SCROLLBAR_HOVER_ZONE_PX;
        const overNav = navEl
          ? (() => {
              const rect = navEl.getBoundingClientRect();
              return (
                event.clientX >= rect.left - NAV_HOVER_PADDING_PX &&
                event.clientX <= rect.right + NAV_HOVER_PADDING_PX &&
                event.clientY >= rect.top - NAV_HOVER_PADDING_PX &&
                event.clientY <= rect.bottom + NAV_HOVER_PADDING_PX
              );
            })()
          : false;
        setHoverVisible(overScrollbar || overNav);
      });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  useEffect(() => {
    const applyHash = (instant: boolean) => {
      const hash = window.location.hash.slice(1);
      const action = hash ? SECTION_ACTIONS[hash] : undefined;
      action?.(instant);
    };

    // Every action above measures real layout (container heights, image-
    // driven section heights) — not settled yet at mount, so an initial
    // #hash is only consumed once the page (images, fonts) fully loads,
    // landing instantly rather than animating a long scroll on page load.
    const handleLoad = () => applyHash(true);
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad, { once: true });
    }

    // Browser back/forward changes the hash without a click, but should
    // still land on the matching section, smoothly like a click would.
    const handlePopState = () => applyHash(false);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('load', handleLoad);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <nav
      ref={navRef}
      className={`${styles.nav} ${hidden && !hoverVisible ? styles.navHidden : ''} ${onLightSection ? styles.navOnLight : ''}`}
      aria-label="Section navigation"
    >
      <div className={styles.group}>
        <button
          type="button"
          className={styles.link}
          onClick={() => {
            scrollToAboutMeOpened();
            setUrlHash(ABOUT_ME_HASH);
          }}
        >
          About Me
        </button>

        <div ref={dropdownRef} className={styles.dropdownWrap}>
          <button
            type="button"
            className={styles.link}
            aria-expanded={dropdownOpen}
            onClick={() => setDropdownOpen((open) => !open)}
          >
            Experience
          </button>
          {dropdownOpen ? (
            <div className={styles.dropdown}>
              {EXPERIENCE_DROPDOWN_ITEMS.map(({ label, hash }, index) => (
                <button
                  key={hash}
                  type="button"
                  className={styles.link}
                  onClick={() => {
                    scrollToExperienceCard(index);
                    setUrlHash(hash);
                    setDropdownOpen(false);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {SECTION_LINKS.map(({ id, label, extraViewportHeights }) => (
          <button
            key={id}
            type="button"
            className={styles.link}
            onClick={() => {
              scrollToId(id, extraViewportHeights);
              setUrlHash(id);
            }}
          >
            {label}
          </button>
        ))}

        <button
          type="button"
          className={styles.link}
          onClick={() => {
            scrollToBottom();
            setUrlHash(CONTACT_ME_HASH);
          }}
        >
          Contact Me
        </button>
      </div>

      <div className={styles.divider} aria-hidden="true" />

      <div className={styles.group}>
        <Link to="/retro" className={styles.link}>
          Retro
        </Link>
        <a href={RESUME_PATH} download className={styles.link}>
          Download CV
        </a>
      </div>
    </nav>
  );
}

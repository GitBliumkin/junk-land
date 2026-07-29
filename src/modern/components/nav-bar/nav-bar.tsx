import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './nav-bar.module.css';
import { getExperienceCardScrollProgress } from '../experience-cards/experience-scroll';
import { setUrlHash } from '../../../shared/url-hash';
import { RESUME_PATH } from '../../../shared/resume';

const EXPERIENCE_DROPDOWN_ITEMS = [
  { label: 'MC Pro', hash: 'experience-mc-pro' },
  { label: 'Viewbid', hash: 'experience-viewbid' },
  { label: 'Fiserv', hash: 'experience-fiserv' },
];

const SECTION_LINKS = [
  { id: 'technologies', label: 'Technologies', extraViewportHeights: 1 },
  { id: 'education', label: 'Education', extraViewportHeights: 0 },
];

const ABOUT_ME_HASH = 'about-me';
const CONTACT_ME_HASH = 'contact-me';

function scrollToId(id: string, extraViewportHeights = 0, instant = false) {
  const el = document.getElementById(id);
  if (!el) return;
  const targetY = window.scrollY + el.getBoundingClientRect().top + extraViewportHeights * window.innerHeight;
  window.scrollTo({ top: targetY, behavior: instant ? 'auto' : 'smooth' });
}


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

function scrollToBottom(instant = false) {
  const targetY = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo({ top: targetY, behavior: instant ? 'auto' : 'smooth' });
}

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

const SCROLL_IDLE_DELAY_MS = 1000;
const SCROLLBAR_HOVER_ZONE_PX = 32;
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
    const educationEl = document.getElementById('education');
    const contactMeEl = document.getElementById('contact-me');

    const isOverLightSection = (el: HTMLElement | null) => {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.top <= 0 && rect.bottom > 0;
    };

    const handleScroll = () => {
      setOnLightSection(isOverLightSection(educationEl) || isOverLightSection(contactMeEl));

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

    const handleLoad = () => applyHash(true);
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad, { once: true });
    }

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

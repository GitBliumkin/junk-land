import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './nav-bar.module.css';
import { getExperienceCardScrollProgress } from '../experience-cards/experience-scroll';

// Order matches CARDS in experience-cards.tsx (== EXPERIENCE[0..2]), so index
// here lines up directly with the index passed to getExperienceCardScrollProgress.
const EXPERIENCE_DROPDOWN_ITEMS = ['MC Pro', 'Viewbid', 'Fiserv'];

const SECTION_LINKS = [
  // Technologies' own element starts 100vh before it visually reads as
  // "revealed" — see TechStack.module.css's margin-top: -100vh, which pulls
  // its box back to where ExperienceCards' pin releases so its sticky stage
  // is already stuck (and ready) underneath the last experience card while
  // that card is still fading out on top of it (see experience-cards.tsx's
  // cardExitOpacity). Landing at the bare top of the element would leave
  // that fading card visually blocking it, so this jumps one viewport
  // height further in, past the handoff, to where it's actually clear.
  { id: 'technologies', label: 'Technologies', extraViewportHeights: 1 },
  { id: 'education', label: 'Education', extraViewportHeights: 0 },
  { id: 'contact-me', label: 'Contact Me', extraViewportHeights: 0 },
];

function scrollToId(id: string, extraViewportHeights = 0) {
  const el = document.getElementById(id);
  if (!el) return;
  const targetY = window.scrollY + el.getBoundingClientRect().top + extraViewportHeights * window.innerHeight;
  window.scrollTo({ top: targetY, behavior: 'smooth' });
}

// Experience's cards aren't separate scroll targets in the document — a
// single pinned stage horizontally transitions between them based on how far
// you've scrolled through the section (see experience-cards.tsx) — so
// jumping to one means computing the scrollY that lands mid-way through that
// card's own hold window, not just scrolling an element into view.
function scrollToExperienceCard(index: number) {
  const container = document.getElementById('experience');
  if (!container) return;

  const scrollRange = container.offsetHeight - window.innerHeight;
  if (scrollRange <= 0) {
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  const documentTop = window.scrollY + container.getBoundingClientRect().top;
  const targetY = documentTop + getExperienceCardScrollProgress(index) * scrollRange;
  window.scrollTo({ top: targetY, behavior: 'smooth' });
}

export default function NavBar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <nav className={styles.nav} aria-label="Section navigation">
      <div className={styles.group}>
        <button type="button" className={styles.link} onClick={() => scrollToId('about-me')}>
          About Me
        </button>

        <div ref={dropdownRef} className={styles.dropdownWrap}>
          <button
            type="button"
            className={styles.link}
            aria-expanded={dropdownOpen}
            onClick={() => setDropdownOpen((open) => !open)}
          >
            Experience {dropdownOpen ? '▴' : '▾'}
          </button>
          {dropdownOpen ? (
            <div className={styles.dropdown}>
              {EXPERIENCE_DROPDOWN_ITEMS.map((label, index) => (
                <button
                  key={label}
                  type="button"
                  className={styles.link}
                  onClick={() => {
                    scrollToExperienceCard(index);
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
            onClick={() => scrollToId(id, extraViewportHeights)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={styles.divider} aria-hidden="true" />

      <div className={styles.group}>
        <Link to="/retro" className={styles.link}>
          Retro
        </Link>
        {/* Placeholder path — drop the real file at public/resume.pdf once sourced
            (same convention as the retro nav's Download CV button). */}
        <a href="/resume.pdf" download className={styles.link}>
          Download CV
        </a>
      </div>
    </nav>
  );
}

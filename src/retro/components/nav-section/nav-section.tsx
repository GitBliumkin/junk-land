import { useEffect, useState } from 'react';
import RetroNav from '../retro-nav/retro-nav';
import SectionPanel from '../section-panel/section-panel';
import { SECTION_ITEMS } from '../../../data/junk-items';
import { setUrlHash } from '../../../shared/url-hash';
import styles from './nav-section.module.css';

interface HashEntry {
  hash: string;
  sectionId: string;
  pageIndex: number;
}

// One entry per addressable state: each plain section is its own hash, and
// each Experience page gets its own (see junk-items.tsx's ExperiencePage.hash
// — shared naming with the modern layer's Experience dropdown). Single source
// for both directions below (hash -> selection, and selection -> hash).
// Built lazily (not at module scope) because junk-items.tsx imports this
// component back (for the nav-section junk item) — at module-evaluation time
// that circular import means SECTION_ITEMS isn't assigned yet here.
let hashEntriesCache: HashEntry[] | null = null;

function getHashEntries(): HashEntry[] {
  if (!hashEntriesCache) {
    hashEntriesCache = SECTION_ITEMS.flatMap((section) =>
      section.pages
        ? section.pages.map((page, pageIndex) => ({ hash: page.hash, sectionId: section.id, pageIndex }))
        : [{ hash: section.id, sectionId: section.id, pageIndex: 0 }],
    );
  }
  return hashEntriesCache;
}

function findByHash(hash: string) {
  return getHashEntries().find((entry) => entry.hash === hash);
}

function hashForSelection(sectionId: string, pageIndex: number): string {
  return (
    getHashEntries().find((entry) => entry.sectionId === sectionId && entry.pageIndex === pageIndex)?.hash ?? sectionId
  );
}

interface Selection {
  sectionId: string;
  pageIndex: number;
}

function defaultSelection(): Selection {
  return { sectionId: SECTION_ITEMS[0]?.id ?? '', pageIndex: 0 };
}

function selectionFromCurrentHash(): Selection {
  const hash = window.location.hash.slice(1);
  const entry = hash ? findByHash(hash) : undefined;
  return entry ? { sectionId: entry.sectionId, pageIndex: entry.pageIndex } : defaultSelection();
}

export default function NavSection() {
  const [selection, setSelection] = useState<Selection>(selectionFromCurrentHash);
  const openSection = SECTION_ITEMS.find((s) => s.id === selection.sectionId) ?? null;

  // Browser back/forward changes the hash without a click — follow it so the
  // panel/page shown always matches the address bar.
  useEffect(() => {
    const handlePopState = () => setSelection(selectionFromCurrentHash());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function handleSelect(sectionId: string) {
    setSelection({ sectionId, pageIndex: 0 });
    setUrlHash(hashForSelection(sectionId, 0));
  }

  function handlePageChange(pageIndex: number) {
    setSelection((prev) => ({ ...prev, pageIndex }));
    setUrlHash(hashForSelection(selection.sectionId, pageIndex));
  }

  return (
    <div id="nav-section" className={styles.navSection}>
      <RetroNav
        items={[
          ...SECTION_ITEMS.map(({ id, title }) => ({ id, label: title })),
          // Placeholder path — drop the real file at public/resume.pdf once sourced.
          { id: 'download', label: 'Download CV', href: '/resume.pdf' },
        ]}
        openSectionId={selection.sectionId}
        onSelect={handleSelect}
      />
      {openSection && (
        <SectionPanel section={openSection} pageIndex={selection.pageIndex} onPageChange={handlePageChange} />
      )}
    </div>
  );
}

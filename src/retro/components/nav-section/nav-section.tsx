import { useState } from 'react';
import RetroNav from '../retro-nav/retro-nav';
import SectionPanel from '../section-panel/section-panel';
import { SECTION_ITEMS } from '../../../data/junk-items';
import styles from './nav-section.module.css';

export default function NavSection() {
  const [openSectionId, setOpenSectionId] = useState<string | null>(
    SECTION_ITEMS[0]?.id ?? null
  );
  const openSection = SECTION_ITEMS.find((s) => s.id === openSectionId) ?? null;

  return (
    <div id="nav-section" className={styles.navSection}>
      <RetroNav
        items={[
          ...SECTION_ITEMS.map(({ id, title }) => ({ id, label: title })),
          // Placeholder path — drop the real file at public/resume.pdf once sourced.
          { id: 'download', label: 'Download CV', href: '/resume.pdf' },
        ]}
        openSectionId={openSectionId}
        onSelect={setOpenSectionId}
      />
      {openSection && <SectionPanel section={openSection} />}
    </div>
  );
}

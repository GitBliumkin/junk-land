import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJunkStore } from '../store/junk-store';
import { JUNK_ITEMS } from '../data/junk-items';
import TrashBin from './components/trash-bin/trash-bin';
import DraggableJunk from './components/draggable-junk/draggable-junk';
import './theme.css';
import styles from './retro-layer.module.css';

const RIGHT_PANEL_GAP = 48;
const BIN_GAP_BELOW_NAV_SECTION = 40;
const RIGHT_ITEM_LEFT = 28;

export default function RetroLayer() {
  const navigate = useNavigate();
  const binRef = useRef<HTMLDivElement>(null);
  const sidePanelRef = useRef<HTMLDivElement>(null);
  const sidePanelRightRef = useRef<HTMLDivElement>(null);
  const [leftPaddingTop, setLeftPaddingTop] = useState(0);
  const [rightItemTops, setRightItemTops] = useState<Record<string, number>>({});
  const [binTop, setBinTop] = useState(0);

  const clearedIds = useJunkStore((s) => s.clearedIds);
  const clearItem = useJunkStore((s) => s.clearItem);
  const setTotal = useJunkStore((s) => s.setTotal);
  const isComplete = useJunkStore((s) => s.isComplete);
  const reset = useJunkStore((s) => s.reset);

  useEffect(() => {
    reset();
    setTotal(JUNK_ITEMS.length);
  }, []);

  useEffect(() => {
    if (isComplete()) {
      const timeout = setTimeout(() => navigate('/'), 400);
      return () => clearTimeout(timeout);
    }
  }, [clearedIds]);

  useLayoutEffect(() => {
    const sidePanel = sidePanelRef.current;
    const sidePanelRight = sidePanelRightRef.current;
    const navSection = document.getElementById('nav-section');
    const leftBadge = sidePanel?.querySelector('img') ?? null;
    const rightBadges = sidePanelRight
      ? Array.from(sidePanelRight.querySelectorAll('img[class*="navGif"]'))
      : [];
    const images = [leftBadge, ...rightBadges].filter((img): img is HTMLImageElement => !!img);

    function alignToNavSection() {
      if (!navSection) return;
      const navSectionRect = navSection.getBoundingClientRect();
      const navSectionCenter = navSectionRect.top + navSectionRect.height / 2;

      if (sidePanel && leftBadge) {
        const sidePanelRect = sidePanel.getBoundingClientRect();
        const badgeHeight = leftBadge.getBoundingClientRect().height;
        const offset = navSectionCenter - sidePanelRect.top - badgeHeight / 2;
        setLeftPaddingTop(Math.max(0, offset));
      }

      // Bin is positioned independently, anchored only to nav-section's bottom edge —
      // its position must not depend on the gifs (or vice versa), so dragging any one
      // of them away never shifts the others.
      if (sidePanelRight) {
        const sidePanelRightRect = sidePanelRight.getBoundingClientRect();
        setBinTop(
          Math.max(0, navSectionRect.bottom - sidePanelRightRect.top + BIN_GAP_BELOW_NAV_SECTION)
        );
      }

      if (sidePanelRight && rightBadges.length === 2) {
        const sidePanelRightRect = sidePanelRight.getBoundingClientRect();
        const [topBadge, bottomBadge] = rightBadges;
        const topHeight = topBadge.getBoundingClientRect().height;
        const bottomHeight = bottomBadge.getBoundingClientRect().height;
        const blockHeight = topHeight + RIGHT_PANEL_GAP + bottomHeight;
        const topOffset = navSectionCenter - sidePanelRightRect.top - blockHeight / 2;
        const bottomOffset = topOffset + topHeight + RIGHT_PANEL_GAP;
        setRightItemTops({
          'webmaster-crossing': Math.max(0, topOffset),
          'thanks-for-visiting': Math.max(0, bottomOffset),
        });
      }
    }

    alignToNavSection();
    window.addEventListener('resize', alignToNavSection);

    const pending = images.filter((img) => !img.complete);
    pending.forEach((img) => img.addEventListener('load', alignToNavSection));

    document.fonts?.ready.then(alignToNavSection);

    let resizeObserver: ResizeObserver | undefined;
    if (navSection) {
      resizeObserver = new ResizeObserver(alignToNavSection);
      resizeObserver.observe(navSection);
    }

    return () => {
      window.removeEventListener('resize', alignToNavSection);
      pending.forEach((img) => img.removeEventListener('load', alignToNavSection));
      resizeObserver?.disconnect();
    };
  }, []);

  const visibleItems = JUNK_ITEMS.filter((item) => !clearedIds.has(item.id));
  const leftItems = visibleItems.filter((item) => item.placement === 'left');
  const rightItems = visibleItems.filter((item) => item.placement === 'right');
  const centerItems = visibleItems.filter((item) => !item.placement);

  const renderJunk = ({ id, Component }: (typeof JUNK_ITEMS)[number]) => (
    <DraggableJunk key={id} id={id} trashBinRef={binRef} onCleared={clearItem}>
      <Component />
    </DraggableJunk>
  );

  const renderRightJunk = ({ id, Component }: (typeof JUNK_ITEMS)[number]) => (
    <DraggableJunk
      key={id}
      id={id}
      trashBinRef={binRef}
      onCleared={clearItem}
      style={{ position: 'absolute', left: RIGHT_ITEM_LEFT, top: rightItemTops[id] ?? 0 }}
    >
      <Component />
    </DraggableJunk>
  );

  return (
  <div className={styles.retroLayer}>
    <div ref={sidePanelRef} className={styles.sidePanel} style={{ paddingTop: leftPaddingTop }}>
      {leftItems.map(renderJunk)}
    </div>

    <div className={styles.centerContent}>{centerItems.map(renderJunk)}</div>

    <div ref={sidePanelRightRef} className={styles.sidePanelRight}>
      {rightItems.map(renderRightJunk)}
      <TrashBin ref={binRef} style={{ position: 'absolute', left: RIGHT_ITEM_LEFT, top: binTop }} />
    </div>
  </div>
);
}
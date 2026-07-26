import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJunkStore } from '../store/junk-store';
import { JUNK_ITEMS } from '../data/junk-items';
import TrashBin from './components/trash-bin/trash-bin';
import DraggableJunk from './components/draggable-junk/draggable-junk';
import './theme.css';
import styles from './retro-layer.module.css';

const STACK_GAP = 48;
const LEFT_ITEM_RIGHT = 28;
const RIGHT_ITEM_LEFT = 28;
const FREEZE_SETTLE_MS = 200;

interface ColumnFrame {
  width: number;
  height: number;
  items: Record<string, { top: number; left: number }>;
}

interface FrozenLayout {
  left: ColumnFrame;
  center: ColumnFrame;
  right: ColumnFrame;
}

function itemStyle(id: string, frame?: ColumnFrame): CSSProperties | undefined {
  const f = frame?.items[id];
  return f ? { position: 'absolute', top: f.top, left: f.left } : undefined;
}

export default function RetroLayer() {
  const navigate = useNavigate();
  const binRef = useRef<HTMLDivElement>(null);
  const sidePanelRef = useRef<HTMLDivElement>(null);
  const sidePanelRightRef = useRef<HTMLDivElement>(null);
  const centerContentRef = useRef<HTMLDivElement>(null);
  const frozenRef = useRef(false);
  const [leftItemTops, setLeftItemTops] = useState<Record<string, number>>({});
  const [rightItemTops, setRightItemTops] = useState<Record<string, number>>({});
  const [binTop, setBinTop] = useState(0);
  const [frozen, setFrozen] = useState<FrozenLayout | null>(null);
  const [scale, setScale] = useState(1);

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

  // The whole page is measured once (after assets/fonts settle) and then frozen into a
  // fixed-size canvas: every item — including the bin — gets a permanent absolute position,
  // so dragging one to the trash never reflows the rest or shrinks the page. Until that
  // first freeze, items render in normal flow (today's dynamic nav-centered layout) purely
  // so their natural sizes/positions can be measured.
  useLayoutEffect(() => {
    const sidePanel = sidePanelRef.current;
    const sidePanelRight = sidePanelRightRef.current;
    const centerContent = centerContentRef.current;
    const bin = binRef.current;
    const navSection = document.getElementById('nav-section');
    const leftBadges = sidePanel
      ? Array.from(sidePanel.querySelectorAll('img[class*="navGif"]'))
      : [];
    const rightBadges = sidePanelRight
      ? Array.from(sidePanelRight.querySelectorAll('img[class*="navGif"]'))
      : [];
    const images = [...leftBadges, ...rightBadges].filter((img): img is HTMLImageElement => !!img);

    function alignToNavSection() {
      if (!navSection) return;
      const navSectionRect = navSection.getBoundingClientRect();
      const navSectionCenter = navSectionRect.top + navSectionRect.height / 2;

      // Official-site badge + Thank You gif: stacked, centered as a group on the nav section
      // (badge slightly above center, Thank You gif below it).
      if (sidePanel && leftBadges.length === 2) {
        const sidePanelRect = sidePanel.getBoundingClientRect();
        const [topBadge, bottomBadge] = leftBadges;
        const topHeight = topBadge.getBoundingClientRect().height;
        const bottomHeight = bottomBadge.getBoundingClientRect().height;
        const blockHeight = topHeight + STACK_GAP + bottomHeight;
        const topOffset = navSectionCenter - sidePanelRect.top - blockHeight / 2;
        const bottomOffset = topOffset + topHeight + STACK_GAP;
        setLeftItemTops({
          'official-site-badge': Math.max(0, topOffset),
          'thanks-for-visiting': Math.max(0, bottomOffset),
        });
      }

      // Webmaster-crossing sits alone, centered on the nav section.
      if (sidePanelRight && rightBadges.length === 1) {
        const sidePanelRightRect = sidePanelRight.getBoundingClientRect();
        const badgeHeight = rightBadges[0].getBoundingClientRect().height;
        const offset = navSectionCenter - sidePanelRightRect.top - badgeHeight / 2;
        setRightItemTops({ 'webmaster-crossing': Math.max(0, offset) });
      }

      // Bin sits in the gap between the bottom of the nav section and the flame bar.
      if (sidePanelRight && bin) {
        const sidePanelRightRect = sidePanelRight.getBoundingClientRect();
        const binHeight = bin.getBoundingClientRect().height;
        const flameBarEl = centerContent?.querySelector<HTMLElement>('[data-junk-id="flame-bar"]');
        const midY = flameBarEl
          ? (navSectionRect.bottom + flameBarEl.getBoundingClientRect().top) / 2
          : navSectionCenter;
        setBinTop(Math.max(0, midY - sidePanelRightRect.top - binHeight / 2));
      }
    }

    function freeze() {
      if (frozenRef.current) return;
      if (!sidePanel || !centerContent || !sidePanelRight || !bin) return;

      const leftRect = sidePanel.getBoundingClientRect();
      const centerRect = centerContent.getBoundingClientRect();
      const rightRect = sidePanelRight.getBoundingClientRect();

      function collect(container: HTMLElement, containerRect: DOMRect, ids: string[]) {
        const items: Record<string, { top: number; left: number }> = {};
        ids.forEach((id) => {
          const el = container.querySelector<HTMLElement>(`[data-junk-id="${id}"]`);
          if (!el) return;
          const r = el.getBoundingClientRect();
          items[id] = { top: r.top - containerRect.top, left: r.left - containerRect.left };
        });
        return items;
      }

      const leftIds = JUNK_ITEMS.filter((i) => i.placement === 'left').map((i) => i.id);
      const centerIds = JUNK_ITEMS.filter((i) => !i.placement).map((i) => i.id);
      const rightIds = [...JUNK_ITEMS.filter((i) => i.placement === 'right').map((i) => i.id), 'trash-bin'];

      frozenRef.current = true;
      setFrozen({
        left: { width: leftRect.width, height: leftRect.height, items: collect(sidePanel, leftRect, leftIds) },
        center: {
          width: centerRect.width,
          height: centerRect.height,
          items: collect(centerContent, centerRect, centerIds),
        },
        right: { width: rightRect.width, height: rightRect.height, items: collect(sidePanelRight, rightRect, rightIds) },
      });
      teardown();
    }

    let settleTimeout: ReturnType<typeof setTimeout> | undefined;
    function scheduleFreeze() {
      if (frozenRef.current) return;
      alignToNavSection();
      if (settleTimeout) clearTimeout(settleTimeout);
      settleTimeout = setTimeout(freeze, FREEZE_SETTLE_MS);
    }

    function teardown() {
      window.removeEventListener('resize', scheduleFreeze);
      pending.forEach((img) => img.removeEventListener('load', scheduleFreeze));
      resizeObserver?.disconnect();
      if (settleTimeout) clearTimeout(settleTimeout);
    }

    scheduleFreeze();
    window.addEventListener('resize', scheduleFreeze);

    const pending = images.filter((img) => !img.complete);
    pending.forEach((img) => img.addEventListener('load', scheduleFreeze));

    document.fonts?.ready.then(scheduleFreeze);

    let resizeObserver: ResizeObserver | undefined;
    if (navSection) {
      resizeObserver = new ResizeObserver(scheduleFreeze);
      resizeObserver.observe(navSection);
    }

    return teardown;
  }, []);

  // Once the natural (unscaled) size of the page is known, scale the whole stage as one
  // unit to exactly fit the current viewport — on any screen, in any direction — so nothing
  // ever needs its own scrollbar.
  useEffect(() => {
    if (!frozen) return;

    function updateScale() {
      if (!frozen) return;
      const scaleX = window.innerWidth / (frozen.left.width + frozen.center.width + frozen.right.width);
      const scaleY = window.innerHeight / Math.max(frozen.left.height, frozen.center.height, frozen.right.height);
      setScale(Math.min(scaleX, scaleY));
    }

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [frozen]);

  const visibleItems = JUNK_ITEMS.filter((item) => !clearedIds.has(item.id));
  const leftItems = visibleItems.filter((item) => item.placement === 'left');
  const rightItems = visibleItems.filter((item) => item.placement === 'right');
  const centerItems = visibleItems.filter((item) => !item.placement);

  const renderJunk = (item: (typeof JUNK_ITEMS)[number], frame?: ColumnFrame) => (
    <DraggableJunk
      key={item.id}
      id={item.id}
      trashBinRef={binRef}
      onCleared={clearItem}
      style={itemStyle(item.id, frame)}
    >
      <item.Component />
    </DraggableJunk>
  );

  const renderLeftJunk = (item: (typeof JUNK_ITEMS)[number]) => {
    const frame = frozen?.left.items[item.id];
    const style: CSSProperties = frame
      ? { position: 'absolute', top: frame.top, left: frame.left }
      : { position: 'absolute', right: LEFT_ITEM_RIGHT, top: leftItemTops[item.id] ?? 0 };
    return (
      <DraggableJunk key={item.id} id={item.id} trashBinRef={binRef} onCleared={clearItem} style={style}>
        <item.Component />
      </DraggableJunk>
    );
  };

  const renderRightJunk = (item: (typeof JUNK_ITEMS)[number]) => {
    const frame = frozen?.right.items[item.id];
    const style: CSSProperties = frame
      ? { position: 'absolute', top: frame.top, left: frame.left }
      : { position: 'absolute', left: RIGHT_ITEM_LEFT, top: rightItemTops[item.id] ?? 0 };
    return (
      <DraggableJunk key={item.id} id={item.id} trashBinRef={binRef} onCleared={clearItem} style={style}>
        <item.Component />
      </DraggableJunk>
    );
  };

  const binFrame = frozen?.right.items['trash-bin'];
  const binStyle: CSSProperties = binFrame
    ? { position: 'absolute', top: binFrame.top, left: binFrame.left }
    : { position: 'absolute', left: RIGHT_ITEM_LEFT, top: binTop };

  return (
  <div className={styles.retroLayer}>
    <div
      className={styles.stage}
      style={
        frozen
          ? {
              width: frozen.left.width + frozen.center.width + frozen.right.width,
              height: Math.max(frozen.left.height, frozen.center.height, frozen.right.height),
              transform: `scale(${scale})`,
            }
          : undefined
      }
    >
      <div
        ref={sidePanelRef}
        className={styles.sidePanel}
        style={
          frozen
            ? { width: frozen.left.width, height: frozen.left.height, justifySelf: 'end' }
            : undefined
        }
      >
        {leftItems.map(renderLeftJunk)}
      </div>

      <div
        ref={centerContentRef}
        className={styles.centerContent}
        style={frozen ? { width: frozen.center.width, height: frozen.center.height } : undefined}
      >
        {centerItems.map((item) => renderJunk(item, frozen?.center))}
      </div>

      <div
        ref={sidePanelRightRef}
        className={styles.sidePanelRight}
        style={
          frozen
            ? { width: frozen.right.width, height: frozen.right.height, justifySelf: 'start' }
            : undefined
        }
      >
        {rightItems.map(renderRightJunk)}
        <TrashBin ref={binRef} style={binStyle} />
      </div>
    </div>
  </div>
);
}

import { motion, useAnimation } from 'framer-motion';
import { type CSSProperties, type ReactNode, type RefObject } from 'react';

interface DraggableJunkProps {
  id: string;
  trashBinRef: RefObject<HTMLDivElement | null>;
  onCleared: (id: string) => void;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

function isOverBin(point: { x: number; y: number }, bin: HTMLDivElement) {
  const rect = bin.getBoundingClientRect();
  return (
    point.x >= rect.left &&
    point.x <= rect.right &&
    point.y >= rect.top &&
    point.y <= rect.bottom
  );
}

// The retro layer's stage is scaled via CSS transform to fit the viewport, and framer-motion
// runs its drag math through `transformPagePoint` to compensate — which also transforms
// `info.point` into that same unscaled space. `getBoundingClientRect()` is always real screen
// coordinates, so hit-testing against it needs the *native* event's client point instead.
function getClientPoint(event: MouseEvent | TouchEvent | PointerEvent): { x: number; y: number } {
  if ('clientX' in event) {
    return { x: event.clientX, y: event.clientY };
  }
  const touch = event.changedTouches[0] ?? event.touches[0];
  return { x: touch.clientX, y: touch.clientY };
}

export default function DraggableJunk({
  id,
  trashBinRef,
  onCleared,
  children,
  className,
  style,
}: DraggableJunkProps) {
  const controls = useAnimation();

  async function handleDragEnd(event: MouseEvent | TouchEvent | PointerEvent) {
    const bin = trashBinRef.current;
    if (bin && isOverBin(getClientPoint(event), bin)) {
      await controls.start({
        scale: 0,
        rotate: 180,
        opacity: 0,
        transition: { duration: 0.3, ease: 'easeIn' },
      });
      onCleared(id);
    } else {
      controls.start({ x: 0, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } });
    }
  }

  return (
    <motion.div
      data-junk-id={id}
      className={className}
      drag
      dragMomentum={false}
      dragElastic={0.15}
      whileDrag={{ scale: 1.08, zIndex: 999, cursor: 'grabbing' }}
      onDragEnd={handleDragEnd}
      animate={controls}
      style={{ touchAction: 'none', ...style }}
    >
      {children}
    </motion.div>
  );
}

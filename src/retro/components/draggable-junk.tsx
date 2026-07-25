import { motion, useAnimation, type PanInfo } from 'framer-motion';
import { type ReactNode, type RefObject } from 'react';

interface DraggableJunkProps {
  id: string;
  trashBinRef: RefObject<HTMLDivElement | null>;
  onCleared: (id: string) => void;
  children: ReactNode;
  className?: string;
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

export default function DraggableJunk({
  id,
  trashBinRef,
  onCleared,
  children,
  className,
}: DraggableJunkProps) {
  const controls = useAnimation();

  async function handleDragEnd(
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) {
    const bin = trashBinRef.current;
    if (bin && isOverBin(info.point, bin)) {
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
      className={className}
      drag
      dragMomentum={false}
      dragElastic={0.15}
      whileDrag={{ scale: 1.08, zIndex: 999, cursor: 'grabbing' }}
      onDragEnd={handleDragEnd}
      animate={controls}
      style={{ touchAction: 'none' }}
    >
      {children}
    </motion.div>
  );
}
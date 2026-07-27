import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react';

type LazyImageProps = ImgHTMLAttributes<HTMLImageElement> & { src: string };

// Defers the network request itself (not just decode/paint) until the
// element is within rootMargin of the viewport, verified against real
// scroll position rather than the browser's native `loading="lazy"`
// heuristic — on short pages that heuristic's distance threshold can cover
// the whole document, so it ends up fetching everything immediately anyway.
export default function LazyImage({ src, alt, ...rest }: LazyImageProps) {
  const ref = useRef<HTMLImageElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={ref}
      src={shouldLoad ? src : undefined}
      alt={alt}
      loading="lazy"
      decoding="async"
      {...rest}
    />
  );
}

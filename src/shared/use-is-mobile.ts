import { useEffect, useState } from 'react';

const MOBILE_BREAKPOINT_PX = 640;

export function useIsMobile(): boolean {
  const query = `(max-width: ${MOBILE_BREAKPOINT_PX}px)`;
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handleChange = () => setIsMobile(mql.matches);
    handleChange();
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, [query]);

  return isMobile;
}

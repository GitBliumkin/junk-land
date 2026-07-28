// Updates the address bar's #hash without touching react-router's own state
// (pathname is left untouched, so nothing about the current route changes) —
// pushState (not replaceState) so the browser's back/forward buttons step
// back through previously-visited sections, same as clicking a real anchor
// link would. Shared by both layers' nav components (see modern/components/
// nav-bar/nav-bar.tsx and retro/components/nav-section/nav-section.tsx).
export function setUrlHash(hash: string) {
  if (window.location.hash.slice(1) === hash) return;
  window.history.pushState(null, '', `#${hash}`);
}

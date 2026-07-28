// Shared with nav-bar.tsx: the poster/card hold-window timing that drives
// experience-cards.tsx's `x` transform, plus a helper that inverts it —
// given a card index, what scrollYProgress lands mid-way through that
// card's hold window. Kept in its own module (rather than exported straight
// off experience-cards.tsx) because that file must only export the one
// component for React Fast Refresh to work.

import { EXPERIENCE } from '../../../data/experience';

// experience-cards.tsx renders exactly one card per EXPERIENCE entry (see
// its CARDS array), so this stays in sync with the card count without a
// circular import back to that file.
export const CARD_COUNT = EXPERIENCE.length;

// Poster timing, as fractions of the container's total scroll range:
//   [0, POSTER_ASSEMBLE_END]   — the three lines slide into place.
//   [POSTER_ASSEMBLE_END, POSTER_HOLD_END] — fully assembled and held
//     static (the outer row transform doesn't start until POSTER_HOLD_END),
//     which is what actually produces the "pinned in place for a while"
//     feel — without this gap, the row would start sliding the instant the
//     lines finished assembling, with no true dwell in between.
//   [POSTER_HOLD_END, 1] — the whole assembled poster slides away with the
//     rest of the row as the cards take its place.
export const POSTER_ASSEMBLE_END = 0.15;
export const POSTER_HOLD_END = 0.35;

// The [POSTER_HOLD_END, 1] range is divided into one equal slice per card;
// within each slice, the row slides from the previous card's centered
// position to this card's (the "transit"), then sits still there (the
// "hold") until the slice ends — so every card gets a dwell at center
// before the next one starts sliding in, rather than one continuous slide
// straight through all three. The last card's hold simply runs to the end
// of the range, so scrolling further releases the sticky stage into
// whatever comes after this section.
export const HOLD_SHARE = 0.55;

// Inverts that hold-window math: given a card index, the scrollYProgress
// that lands mid-way through its hold (i.e. centered, not mid-transit) —
// used by nav-bar.tsx to jump straight to a card instead of only being able
// to scroll to the top of the section.
export function getExperienceCardScrollProgress(index: number): number {
  const sliceSize = (1 - POSTER_HOLD_END) / CARD_COUNT;
  const transitDuration = sliceSize * (1 - HOLD_SHARE);
  const holdStart = POSTER_HOLD_END + index * sliceSize + transitDuration;
  const holdEnd = POSTER_HOLD_END + (index + 1) * sliceSize;
  return (holdStart + holdEnd) / 2;
}

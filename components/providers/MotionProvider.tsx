'use client'

import { MotionConfig } from 'framer-motion';

/**
 * `reducedMotion="user"` makes every Framer Motion component on the page honour
 * the OS-level prefers-reduced-motion setting: transforms are dropped, opacity
 * still animates. The CSS half of this lives in globals.css.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

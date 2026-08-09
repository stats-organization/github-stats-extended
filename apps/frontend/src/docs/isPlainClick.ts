import type { MouseEvent } from "react";

/**
 * Whether a click should be handled in-app. Modified clicks are left to the
 * browser so "open in new tab" and friends keep working on documentation links.
 */
export function isPlainClick(event: MouseEvent): boolean {
  return !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

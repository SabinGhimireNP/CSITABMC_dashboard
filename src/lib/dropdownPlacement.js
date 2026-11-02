/**
 * Decide whether an in-flow dropdown should open below or above its trigger.
 *
 * Measures the free space inside the nearest scrolling ancestor (e.g. a modal
 * body) — or the viewport — so dropdowns near the bottom of a modal flip upward
 * instead of being clipped, and their height never exceeds the room available.
 */
export function getDropdownPlacement(triggerEl, preferredHeight = 224, gap = 8) {
  if (!triggerEl || typeof window === "undefined") {
    return { up: false, maxHeight: preferredHeight };
  }
  const rect = triggerEl.getBoundingClientRect();

  let top = 0;
  let bottom = window.innerHeight;
  for (let node = triggerEl.parentElement; node && node !== document.body; node = node.parentElement) {
    const { overflowY } = window.getComputedStyle(node);
    if (overflowY === "auto" || overflowY === "scroll" || overflowY === "hidden") {
      const box = node.getBoundingClientRect();
      top = Math.max(top, box.top);
      bottom = Math.min(bottom, box.bottom);
      break;
    }
  }

  const below = bottom - rect.bottom - gap;
  const above = rect.top - top - gap;
  const up = below < Math.min(preferredHeight, 160) && above > below;
  const room = up ? above : below;
  return { up, maxHeight: Math.max(120, Math.min(preferredHeight, Math.floor(room))) };
}

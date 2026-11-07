"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";

const GAP = 4;
const EDGE = 8;

/**
 * Shared row action menu used by every listing table and mobile record card.
 *
 * Renders into a portal with fixed positioning so it escapes overflow containers,
 * stays inside the viewport horizontally, flips above the trigger when there's no
 * room below, and closes on outside click/tap, Escape, scroll or resize.
 *
 * items: [{ key?, label, icon, onClick, destructive?, hidden?, disabled?, spinning? }]
 */
export function RowActionsMenu({ items = [], label = "Row actions", menuWidth = 144, className = "" }) {
  const visible = items.filter((item) => item && !item.hidden);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, ready: false });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const close = useCallback(() => setOpen(false), []);

  const place = useCallback(() => {
    const btn = triggerRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight || visible.length * 36 + 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const left = Math.max(EDGE, Math.min(rect.right - menuWidth, vw - menuWidth - EDGE));
    const fitsBelow = rect.bottom + GAP + menuHeight <= vh - EDGE;
    const top = fitsBelow ? rect.bottom + GAP : Math.max(EDGE, rect.top - GAP - menuHeight);
    setPos({ top, left, ready: true });
  }, [menuWidth, visible.length]);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e) => {
      if (menuRef.current?.contains(e.target) || triggerRef.current?.contains(e.target)) return;
      close();
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        close();
        triggerRef.current?.focus();
      }
    };
    const onScroll = (e) => {
      if (menuRef.current?.contains(e.target)) return;
      close();
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer, { passive: true });
    document.addEventListener("keydown", onKey);
    document.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", close);
    };
  }, [open, close]);

  if (visible.length === 0) {
    return <span className="text-muted-foreground text-xs">—</span>;
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setPos((p) => ({ ...p, ready: false }));
          setOpen((o) => !o);
        }}
        className={`inline-flex items-center justify-center h-8 w-8 rounded-md transition-colors cursor-pointer ${
          open ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
        } ${className}`}
      >
        <MoreHorizontal className="h-4 w-4 stroke-[2.3]" />
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: menuWidth,
              visibility: pos.ready ? "visible" : "hidden",
            }}
            className="bg-card text-foreground border border-border rounded-xl shadow-xl py-1 z-9999 animate-in fade-in duration-100"
          >
            {visible.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key || item.label}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item.disabled) return;
                    close();
                    item.onClick?.();
                  }}
                  className={`w-full text-left px-3 py-2.5 sm:py-2 text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
                    i > 0 ? "border-t border-border/60" : ""
                  } ${
                    item.destructive
                      ? "text-rose-500 hover:bg-rose-500/10"
                      : "text-foreground/80 hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {Icon && (
                    <Icon
                      className={`h-3.5 w-3.5 shrink-0 ${item.destructive ? "text-rose-400" : "text-muted-foreground"} ${
                        item.spinning ? "animate-spin" : ""
                      }`}
                    />
                  )}
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
}

export default RowActionsMenu;

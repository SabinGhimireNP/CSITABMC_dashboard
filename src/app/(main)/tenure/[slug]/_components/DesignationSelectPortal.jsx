import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

export const EXECUTIVE_POSTS = [
  "President",
  "Vice President",
  "Secretary",
  "Joint Secretary",
  "Treasurer",
  "Executive Member",
];

export const ADVISOR_POSTS = [
  "Advisor",
  "Senior Advisor",
  "Technical Advisor",
  "Faculty Advisor",
];

/**
 * DesignationSelectPortal renders the designation input and a floating fixed portal dropdown
 * with collision detection that breaks out of the modal's overflow container.
 */
export function DesignationSelectPortal({
  value = "",
  onChange,
  roleType = "EXECUTIVE",
  error,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const designationRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    openUpward: false,
  });

  const suggestions = useMemo(() => {
    return roleType === "ADVISOR" ? ADVISOR_POSTS : EXECUTIVE_POSTS;
  }, [roleType]);

  const updateDropdownPosition = useCallback(() => {
    if (!designationRef.current) return;
    const rect = designationRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const estimatedHeight = 220;
    const openUpward = spaceBelow < estimatedHeight && rect.top > estimatedHeight;

    setDropdownPosition({
      top: openUpward ? rect.top - 4 : rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      openUpward,
    });
  }, []);

  const openDropdown = useCallback(() => {
    updateDropdownPosition();
    setIsOpen(true);
  }, [updateDropdownPosition]);

  // Update position on resize or scroll
  useEffect(() => {
    if (!isOpen) return;
    updateDropdownPosition();

    function handleScrollOrResize() {
      updateDropdownPosition();
    }

    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("scroll", handleScrollOrResize, true);
    return () => {
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("scroll", handleScrollOrResize, true);
    };
  }, [isOpen, updateDropdownPosition]);

  // Click outside and Escape handling
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        designationRef.current &&
        !designationRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const inputBase =
    "w-full h-9 px-3 border rounded-lg focus:outline-none focus:ring-1 transition-all text-xs bg-white";
  const inputNormal = `${inputBase} border-slate-200 focus:ring-indigo-500`;
  const inputError = `${inputBase} border-rose-400 focus:ring-rose-500`;

  return (
    <div className="space-y-1.5" ref={designationRef}>
      <label className="font-semibold text-slate-700">Designation / Post *</label>
      <div className="relative">
        <input
          name="designation"
          type="text"
          autoComplete="off"
          value={value}
          onFocus={openDropdown}
          onClick={openDropdown}
          onChange={(e) => {
            onChange(e.target.value);
            openDropdown();
          }}
          placeholder={
            roleType === "ADVISOR"
              ? "e.g., Senior Advisor, Technical Advisor"
              : "e.g., President, Vice President, Secretary"
          }
          className={`${error ? inputError : inputNormal} pr-9`}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            if (isOpen) {
              setIsOpen(false);
            } else {
              openDropdown();
            }
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          aria-label="Toggle suggestions"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      <p className="text-[10px] text-slate-400">
        Choose a suggested title from the dropdown or type a custom designation.
      </p>
      {error && <p className="text-rose-500 text-[11px] font-medium">{error}</p>}

      {/* Floating Custom Designation Dropdown Portal rendered outside modal scroll container */}
      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: dropdownPosition.openUpward ? undefined : dropdownPosition.top,
              bottom: dropdownPosition.openUpward
                ? window.innerHeight - dropdownPosition.top
                : undefined,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
            }}
            className="bg-white border border-slate-200 rounded-xl shadow-2xl z-[99999] overflow-hidden py-1 max-h-52 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-100 text-xs"
          >
            <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/80 border-b border-slate-100">
              Suggested {roleType === "ADVISOR" ? "Advisor" : "Executive"} Posts
            </div>
            {suggestions.map((post) => {
              const isSelected = value === post;
              return (
                <div
                  key={post}
                  onClick={() => {
                    onChange(post);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2 flex items-center justify-between cursor-pointer transition-colors text-xs ${
                    isSelected
                      ? "bg-indigo-50/80 text-indigo-900 font-medium"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span>{post}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-indigo-600 shrink-0" />}
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}

import React, { useState, useRef, useEffect, useMemo, useId } from "react";
import { Search, ChevronDown, Check, User, X } from "lucide-react";

/**
 * MemberSearchCombobox provides a searchable popover to select a member with avatar, name, and email.
 * Shared by Tenure assignments and Blog authors.
 */
export function MemberSearchCombobox({
  members = [],
  selectedMemberId,
  // Shown while the member list is still loading (or if the member is no longer listed)
  selectedMemberFallback = null,
  onSelectMember,
  onClear,
  isLoading = false,
  loadError = false,
  error,
  label = "Select Member *",
  placeholder = "Choose an existing master member...",
  className = "",
  popoverClassName = "left-6 right-6",
}) {
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const comboboxRef = useRef(null);
  const listboxId = useId();

  const selectedMember = useMemo(() => {
    if (!selectedMemberId) return null;
    return (
      members.find((m) => String(m.id) === String(selectedMemberId)) ||
      (selectedMemberFallback && String(selectedMemberFallback.id) === String(selectedMemberId)
        ? selectedMemberFallback
        : null)
    );
  }, [members, selectedMemberId, selectedMemberFallback]);

  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return members;
    const q = memberSearch.toLowerCase();
    return members.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.slug?.toLowerCase().includes(q)
    );
  }, [members, memberSearch]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target)) {
        setComboboxOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setComboboxOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSelect = (member) => {
    onSelectMember(member);
    setComboboxOpen(false);
    setMemberSearch("");
  };

  return (
    <div className={`space-y-1.5 ${className}`} ref={comboboxRef}>
      {label && <label className="font-semibold text-foreground block text-xs">{label}</label>}

      {/* Combobox Trigger */}
      <div
        role="combobox"
        tabIndex={0}
        aria-expanded={comboboxOpen}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        onClick={() => setComboboxOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setComboboxOpen((prev) => !prev);
          }
        }}
        className={`w-full min-h-[42px] px-3 py-1.5 border rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-all bg-background focus:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
          error
            ? "border-destructive ring-1 ring-destructive"
            : comboboxOpen
              ? "border-primary ring-1 ring-primary"
              : "border-input hover:border-primary/50"
        }`}
      >
        {selectedMember ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-7 w-7 rounded-full bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center">
              {selectedMember.image ? (
                <img
                  src={selectedMember.image}
                  alt={selectedMember.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-foreground truncate text-xs">
                {selectedMember.name}
              </p>
              <p className="text-[10px] text-muted-foreground truncate font-mono">
                {selectedMember.email}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">
            {isLoading ? "Loading members..." : placeholder}
          </span>
        )}
        <div className="flex items-center gap-1 shrink-0">
          {selectedMember && onClear && (
            <button
              type="button"
              aria-label="Clear selection"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
              comboboxOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Dropdown Popover */}
      {comboboxOpen && (
        <div className={`absolute ${popoverClassName} mt-1 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100 max-h-60 flex flex-col`}>
          {/* Search bar inside combobox */}
          <div className="p-2 border-b border-border bg-muted/40">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                autoFocus
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search member by name, email, slug..."
                className="w-full h-8 pl-8 pr-3 text-xs bg-background border border-input text-foreground placeholder:text-muted-foreground rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Member List */}
          <div id={listboxId} role="listbox" className="overflow-y-auto flex-1 divide-y divide-border">
            {loadError ? (
              <div className="p-4 text-center text-destructive text-xs">Failed to load members.</div>
            ) : isLoading ? (
              <div className="p-4 text-center text-muted-foreground text-xs">Loading members...</div>
            ) : filteredMembers.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-xs">
                {memberSearch.trim()
                  ? <>No members matching &quot;{memberSearch}&quot;.</>
                  : "No members found. Add members in the Members section first."}
              </div>
            ) : (
              filteredMembers.map((member) => {
                const isSelected = String(member.id) === String(selectedMemberId);
                return (
                  <div
                    key={member.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(member)}
                    className={`p-2.5 flex items-center justify-between gap-2.5 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-7 w-7 rounded-full bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center">
                        {member.image ? (
                          <img
                            src={member.image}
                            alt={member.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs truncate">{member.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono truncate">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <p className="text-rose-500 text-[11px] font-medium">{error}</p>}
    </div>
  );
}

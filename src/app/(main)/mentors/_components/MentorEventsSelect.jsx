"use client";

import React, { useState, useRef, useEffect } from "react";
import { getDropdownPlacement } from "@/lib/dropdownPlacement";
import { ChevronDown, Plus, Trash2, Calendar } from "lucide-react";
import { MENTOR_EVENT_ROLES } from "@/lib/Constants/MentorEventRoles";

export function MentorEventsSelect({
  eventsList = [],
  assignments = [],
  onAddEvent,
  onRemoveEvent,
  onUpdateAssignment,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [placement, setPlacement] = useState({ up: false, maxHeight: 224 });
  const [searchFilter, setSearchFilter] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const assignedEventIds = new Set(
    assignments.map((a) => String(a.eventId || a.event_id))
  );

  const availableEvents = eventsList.filter(
    (ev) =>
      !assignedEventIds.has(String(ev.id)) &&
      (ev.title || "").toLowerCase().includes(searchFilter.toLowerCase().trim())
  );

  return (
    <div className="space-y-3 w-full">
      <div className="flex items-center justify-between">
        <label className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
          <Calendar className="h-4 w-4 text-primary" />
          Assigned Events & Roles
        </label>
        <span className="text-[11px] text-muted-foreground">
          {assignments.length} assigned
        </span>
      </div>

      {/* Add Event Combobox Dropdown */}
      <div className="relative w-full" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => {
            if (!dropdownOpen) setPlacement(getDropdownPlacement(dropdownRef.current));
            setDropdownOpen((prev) => !prev);
          }}
          className="w-full h-9 px-3 border border-input rounded-lg bg-background flex items-center justify-between text-left hover:bg-muted/50 transition-all cursor-pointer shadow-2xs"
        >
          <span className="text-muted-foreground text-xs flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5 text-primary" />
            Assign this mentor to an event...
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {dropdownOpen && (
          <div
            style={{ maxHeight: placement.maxHeight }}
            className={`absolute z-30 ${placement.up ? "bottom-full mb-1" : "top-full mt-1"} w-full bg-card dark:bg-[#1a1d24] border border-border rounded-xl shadow-xl overflow-y-auto p-1.5 animate-in fade-in duration-100`}>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search events by title..."
              className="w-full h-8 px-2.5 mb-1.5 text-xs bg-background border border-input text-foreground placeholder:text-muted-foreground rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />

            {availableEvents.length === 0 ? (
              <p className="px-3 py-3 text-center text-muted-foreground text-xs">
                {searchFilter
                  ? "No matching unassigned events found."
                  : "All available events are already assigned."}
              </p>
            ) : (
              availableEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => {
                    onAddEvent(event.id);
                    setDropdownOpen(false);
                    setSearchFilter("");
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-muted/60 text-xs text-foreground flex items-center justify-between gap-2 cursor-pointer transition-colors"
                >
                  <span className="font-medium text-foreground truncate">
                    {event.title}
                  </span>
                  {event.category && (
                    <span className="text-[10px] text-muted-foreground capitalize shrink-0">
                      {event.category}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Assigned Events List */}
      {assignments.length === 0 ? (
        <div className="border border-dashed border-slate-200 rounded-xl p-4 text-center text-slate-400 text-xs bg-slate-50/40">
          Not assigned to any events yet. Use the dropdown above to assign events.
        </div>
      ) : (
        <div className="space-y-2.5 w-full">
          {assignments.map((assignment) => {
            const currentEventId = assignment.eventId || assignment.event_id;
            const event = eventsList.find(
              (e) => String(e.id) === String(currentEventId)
            );
            const eventTitle =
              event?.title || assignment.eventTitle || `Event #${currentEventId}`;

            return (
              <div
                key={currentEventId}
                className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2.5 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                      <Calendar className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 text-xs truncate">
                        {eventTitle}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveEvent(currentEventId)}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Remove assignment"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Event Role *
                    </label>
                    <select
                      value={assignment.role || "main_mentor"}
                      onChange={(e) =>
                        onUpdateAssignment(currentEventId, "role", e.target.value)
                      }
                      className="w-full h-8 px-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      {MENTOR_EVENT_ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {assignment.role === "custom" && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Custom Role Title *
                      </label>
                      <input
                        type="text"
                        value={assignment.customRole || assignment.custom_role || ""}
                        onChange={(e) =>
                          onUpdateAssignment(
                            currentEventId,
                            "customRole",
                            e.target.value
                          )
                        }
                        placeholder="e.g., Lead Reviewer"
                        className="w-full h-8 px-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  )}

                  <div
                    className={`space-y-1 ${
                      assignment.role === "custom" ? "sm:col-span-2" : ""
                    }`}
                  >
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Responsibility / Description
                    </label>
                    <input
                      type="text"
                      value={assignment.responsibility || ""}
                      onChange={(e) =>
                        onUpdateAssignment(
                          currentEventId,
                          "responsibility",
                          e.target.value
                        )
                      }
                      placeholder="e.g., Deliver React Architecture session"
                      className="w-full h-8 px-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

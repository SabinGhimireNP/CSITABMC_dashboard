import React, { useState, useRef, useEffect } from "react";
import { getDropdownPlacement } from "@/lib/dropdownPlacement";
import { ChevronDown, Plus, Trash2, UserCheck, Shield } from "lucide-react";
import { MENTOR_EVENT_ROLES } from "@/lib/Constants/MentorEventRoles";

export { MENTOR_EVENT_ROLES };

/**
 * EventMentorsSelect renders mentor assignment management for events,
 * allowing selection of global mentors, assignment of roles (Main Mentor, Co-Mentor, etc.),
 * custom roles, and specific responsibilities.
 */
export function EventMentorsSelect({
  mentorsList = [],
  assignments = [],
  onAddMentor,
  onRemoveMentor,
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

  const assignedMentorIds = new Set(
    assignments.map((a) => String(a.mentor_id))
  );

  const availableMentors = mentorsList.filter(
    (m) =>
      !assignedMentorIds.has(String(m.id)) &&
      (m.fullName || "").toLowerCase().includes(searchFilter.toLowerCase().trim())
  );

  return (
    <div className="space-y-3 w-full">
      <div className="flex items-center justify-between">
        <label className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
          <UserCheck className="h-4 w-4 text-primary" />
          Event Mentors & Roles
        </label>
        <span className="text-[11px] text-muted-foreground">
          {assignments.length} assigned
        </span>
      </div>

      {/* Add Mentor Combobox Dropdown */}
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
            Assign a mentor to this event...
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
              placeholder="Search mentors by name..."
              className="w-full h-8 px-2.5 mb-1.5 text-xs bg-background border border-input text-foreground placeholder:text-muted-foreground rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />

            {availableMentors.length === 0 ? (
              <p className="px-3 py-3 text-center text-muted-foreground text-xs">
                {searchFilter
                  ? "No matching unassigned mentors found."
                  : "All available mentors are already assigned."}
              </p>
            ) : (
              availableMentors.map((mentor) => (
                <button
                  key={mentor.id}
                  type="button"
                  onClick={() => {
                    onAddMentor(mentor.id);
                    setDropdownOpen(false);
                    setSearchFilter("");
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-muted/60 text-xs text-foreground flex items-center justify-between gap-2 cursor-pointer transition-colors"
                >
                  <span className="font-medium text-foreground">
                    {mentor.fullName}
                  </span>
                  {mentor.role && (
                    <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                      {mentor.role}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Assigned Mentors List with Role & Responsibility controls */}
      {assignments.length === 0 ? (
        <div className="border border-dashed border-slate-200 rounded-xl p-4 text-center text-slate-400 text-xs bg-slate-50/40">
          No mentors assigned to this event yet. Use the dropdown above to add mentors.
        </div>
      ) : (
        <div className="space-y-2.5 w-full">
          {assignments.map((assignment) => {
            const mentor = mentorsList.find(
              (m) => String(m.id) === String(assignment.mentor_id)
            );
            const mentorName = mentor?.fullName || assignment.mentor_name || `Mentor #${assignment.mentor_id}`;

            return (
              <div
                key={assignment.mentor_id}
                className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-900/40 space-y-2.5 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-7 w-7 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-bold flex items-center justify-center text-xs shrink-0">
                      {mentorName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs truncate">
                        {mentorName}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveMentor(assignment.mentor_id)}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Remove assignment"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Event Role *
                    </label>
                    <select
                      value={assignment.role}
                      onChange={(e) =>
                        onUpdateAssignment(
                          assignment.mentor_id,
                          "role",
                          e.target.value
                        )
                      }
                      className="w-full h-8 px-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      {MENTOR_EVENT_ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Responsibility / Track
                    </label>
                    <input
                      type="text"
                      value={assignment.responsibility || ""}
                      onChange={(e) =>
                        onUpdateAssignment(
                          assignment.mentor_id,
                          "responsibility",
                          e.target.value
                        )
                      }
                      placeholder="e.g., Frontend Lead, AI Mentor"
                      className="w-full h-8 px-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {assignment.role === "custom" && (
                  <div className="space-y-1 pt-1">
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Custom Role Name *
                    </label>
                    <input
                      type="text"
                      value={assignment.custom_role || ""}
                      onChange={(e) =>
                        onUpdateAssignment(
                          assignment.mentor_id,
                          "custom_role",
                          e.target.value
                        )
                      }
                      placeholder="e.g., Panel Moderator, Guest Evaluator"
                      className="w-full h-8 px-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

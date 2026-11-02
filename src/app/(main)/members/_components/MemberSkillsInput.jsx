import React, { useState } from "react";
import { X } from "lucide-react";

/**
 * MemberSkillsInput allows adding and removing skills as interactive tag chips.
 * Supports Enter or comma keys to commit a new skill chip.
 */
export function MemberSkillsInput({ skills = [], onAddSkill, onRemoveSkill }) {
  const [skillInput, setSkillInput] = useState("");

  const handleCommit = (rawSkill) => {
    const trimmed = (rawSkill || skillInput).trim().replace(/^[,\s]+|[,\s]+$/g, "");
    if (!trimmed) return;
    onAddSkill(trimmed);
    setSkillInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleCommit(skillInput);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="font-semibold text-foreground text-xs">Skills</label>
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-background border border-input text-foreground rounded-lg min-h-[42px] focus-within:ring-1 focus-within:ring-primary">
        {skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
          >
            {skill}
            <button
              type="button"
              onClick={() => onRemoveSkill(skill)}
              className="text-primary/70 hover:text-primary cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (skillInput.trim()) {
              handleCommit(skillInput);
            }
          }}
          placeholder={
            skills.length === 0
              ? "Type a skill and press Enter or comma..."
              : "Add more..."
          }
          className="flex-1 min-w-[140px] text-xs outline-none bg-transparent text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <p className="text-[10px] text-muted-foreground">
        Press Enter or comma to add skills (e.g., Python, React, UI/UX).
      </p>
    </div>
  );
}

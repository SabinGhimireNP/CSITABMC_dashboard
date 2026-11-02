"use client";

import React from "react";

/**
 * Compact card list used in place of wide tables on small screens (< md).
 * Every listing keeps its full table from `md` up; this renders the same rows as
 * cards so no column data is lost and actions stay reachable without sideways scroll.
 *
 * Props:
 *  - items, getKey(item)
 *  - renderCard?(item)     full custom card renderer
 *  - renderLeading?(item)  thumbnail/avatar
 *  - renderTitle?(item)    primary identifier (string or node)
 *  - renderSubtitle?(item) secondary line
 *  - renderBadge?(item)    status pill
 *  - fields: [{ label, render(item) }]   label/value grid
 *  - renderActions?(item)  usually <RowActionsMenu/>
 *  - renderSelect?(item)   optional checkbox (bulk selection)
 *  - emptyText
 */
export function ResponsiveRecordList({
  items = [],
  getKey,
  renderCard,
  renderLeading,
  renderTitle,
  renderSubtitle,
  renderBadge,
  fields = [],
  renderActions,
  renderSelect,
  emptyText = "No records found.",
  className = "",
}) {
  if (items.length === 0) {
    return (
      <div className={`py-10 px-4 text-center text-sm text-muted-foreground font-medium bg-card ${className}`}>
        {emptyText}
      </div>
    );
  }

  return (
    <ul className={`divide-y divide-border bg-card text-foreground ${className}`}>
      {items.map((item) => {
        const itemKey = getKey ? getKey(item) : item?.id;

        if (renderCard) {
          return (
            <li key={itemKey}>
              {renderCard(item)}
            </li>
          );
        }

        const title = renderTitle ? renderTitle(item) : null;
        const subtitle = renderSubtitle?.(item);
        const badge = renderBadge?.(item);
        const visibleFields = fields
          .map((f) => ({ label: f.label, value: f.render(item) }))
          .filter((f) => f.value !== null && f.value !== undefined && f.value !== "");

        return (
          <li key={itemKey} className="px-4 py-3">
            <div className="flex items-start gap-3 min-w-0">
              {renderSelect && <div className="pt-0.5 shrink-0">{renderSelect(item)}</div>}
              {renderLeading && <div className="shrink-0">{renderLeading(item)}</div>}
              <div className="min-w-0 flex-1">
                {title && <div className="text-sm font-semibold text-foreground break-words">{title}</div>}
                {subtitle && <div className="text-xs text-muted-foreground mt-0.5 break-words">{subtitle}</div>}
                {badge && <div className="mt-1.5">{badge}</div>}
              </div>
              {renderActions && <div className="shrink-0 -mr-1.5 -mt-1">{renderActions(item)}</div>}
            </div>

            {visibleFields.length > 0 && (
              <dl className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                {visibleFields.map((f) => (
                  <div key={f.label} className="min-w-0">
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{f.label}</dt>
                    <dd className="text-foreground/90 mt-0.5 break-words">{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default ResponsiveRecordList;

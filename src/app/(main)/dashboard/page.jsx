"use client";

import React, { useMemo } from "react";
import DashboardWelcome from "./_components/DashboardWelcome";
import StatCard from "./_components/StatCard";
import RecentCard from "./_components/RecentCard";
import RecentItem from "./_components/RecentItem";
import EmptyState from "./_components/EmptyState";
import SectionError from "./_components/SectionError";
import QuickActions from "./_components/QuickActions";
import DashboardSkeleton from "./_components/DashboardSkeleton";
import { OVERVIEW_MODULES } from "./_config/overviewModules";
import { usePermission } from "@/hooks/usePermission";
import { useCurrentUser, useDashboardOverview } from "@/hooks/useDashboard";

export default function DashboardPage() {
  const { can, role, user, roleLabel: permRoleLabel } = usePermission();
  const { data, isLoading, isError, refetch, isFetching } = useDashboardOverview();
  const { data: me } = useCurrentUser();

  const displayName = me?.name || user?.name || user?.username || "";
  const roleLabel = me?.role_label || permRoleLabel || user?.role_label || role || "";


  // RBAC decides what may appear; the API decides what was returned for this user.
  const modules = useMemo(() => {
    const payload = data?.modules || {};
    return OVERVIEW_MODULES.filter((m) => can(m.permission) && payload[m.key]).map((m) => ({
      ...m,
      data: payload[m.key],
    }));
  }, [data, can]);

  const quickActions = useMemo(
    () =>
      OVERVIEW_MODULES.filter((m) => m.action && can(m.action.permission)).map((m) => m.action),
    [can]
  );

  if (isLoading) return <DashboardSkeleton />;

  const retry = () => refetch();

  return (
    <div className="w-full space-y-6">
      {isFetching && !isLoading && (
        <div className="progress-bar-track" aria-label="Refreshing dashboard">
          <div className="progress-bar-indicator" />
        </div>
      )}
      <DashboardWelcome name={displayName} roleLabel={roleLabel} />

      {isError ? (
        <SectionError
          message="The overview couldn't be loaded. Check your connection and try again."
          onRetry={retry}
          retrying={isFetching}
        />
      ) : modules.length === 0 ? (
        <EmptyState description="There are no modules assigned to your account yet." />
      ) : (
        <>
          <section aria-label="Overview statistics" className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {modules
              .filter((m) => m.stat)
              .map((m) => {
                if (m.data.error) {
                  return (
                    <StatCard key={m.key} label={m.label} value="—" detail="Unavailable" icon={m.icon} href={m.href} accent={m.accent} />
                  );
                }
                const stat = m.stat(m.data.stats || {});
                return <StatCard key={m.key} {...stat} icon={m.icon} href={m.href} accent={m.accent} />;
              })}
          </section>

          <QuickActions actions={quickActions} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {modules.map((m) => {
              const action = m.action && can(m.action.permission) ? m.action : null;
              const records = m.data.recent || [];
              return (
                <RecentCard key={m.key} title={m.recentLabel} icon={m.icon} accent={m.accent} viewAllHref={m.href}>
                  {m.data.error ? (
                    <div className="pt-3">
                      <SectionError onRetry={retry} retrying={isFetching} />
                    </div>
                  ) : records.length === 0 ? (
                    <div className="pt-3">
                      <EmptyState description={m.emptyText} action={action} />
                    </div>
                  ) : (
                    <ul className="divide-y divide-border">
                      {records.map((record) => {
                        const { key, ...row } = m.row(record);
                        return <RecentItem key={key} {...row} />;
                      })}
                    </ul>
                  )}
                </RecentCard>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

import { ChevronRight } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";

export function PageHeader({ title, subtitle, actions, breadcrumbs }: {
  title: string; subtitle?: string; actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; to?: string }>;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const parts = pathname.split("/").filter(Boolean);
  const crumbs = breadcrumbs ?? [{ label: "ATLAS", to: "/dashboard" }, ...parts.map((p) => ({ label: p }))];

  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pb-2 border-b border-border/50">
      <div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              {c.to ? <Link to={c.to} className="hover:text-foreground">{c.label}</Link> : <span className="capitalize">{c.label}</span>}
              {i < crumbs.length - 1 && <ChevronRight className="h-3 w-3" />}
            </span>
          ))}
        </div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

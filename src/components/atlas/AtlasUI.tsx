import { cn } from "@/lib/utils";
import { AlertTriangle, type LucideIcon } from "lucide-react";
import type { Seniority } from "@/types";

export function CompetencyLevelDots({ value, max = 4, className }: { value: number; max?: number; className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-2.5 w-2.5 rounded-full border border-border transition-colors",
            i < Math.round(value) ? "bg-primary border-primary" : "bg-transparent",
          )}
        />
      ))}
    </div>
  );
}

export function GapBadge({ gap, severity }: { gap: number; severity: "none" | "mild" | "moderate" | "critical" }) {
  const map = {
    none: "bg-muted text-muted-foreground border-border",
    mild: "bg-warning/15 text-warning border-warning/30",
    moderate: "bg-warning/25 text-warning border-warning/40",
    critical: "bg-danger/20 text-danger border-danger/40",
  } as const;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium", map[severity])}>
      gap {gap.toFixed(1)}
    </span>
  );
}

const seniorityColors: Record<Seniority, string> = {
  "Trainee": "bg-slate-500/20 text-slate-300 border-slate-500/30",
  "Junior": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Semi-Senior": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  "Senior": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "Tech Lead": "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "Architect": "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "Manager": "bg-pink-500/20 text-pink-300 border-pink-500/30",
  "Director": "bg-violet-500/20 text-violet-300 border-violet-500/30",
};

export function SeniorityBadge({ value }: { value: Seniority }) {
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", seniorityColors[value])}>
      {value}
    </span>
  );
}

export function UnitBadge({ value }: { value: "negocio" | "soporte" }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize",
      value === "negocio" ? "bg-sky-500/15 text-sky-300 border-sky-500/30" : "bg-violet-500/15 text-violet-300 border-violet-500/30",
    )}>
      {value}
    </span>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    "borrador": "bg-muted text-muted-foreground",
    "pendiente": "bg-warning/15 text-warning",
    "pendiente-aprobacion": "bg-warning/15 text-warning",
    "aprobado": "bg-success/15 text-success",
    "en-curso": "bg-primary/15 text-primary",
    "completado": "bg-success/15 text-success",
    "rechazado": "bg-danger/15 text-danger",
    "active": "bg-success/15 text-success",
    "onboarding": "bg-primary/15 text-primary",
    "in-review": "bg-warning/15 text-warning",
    "promoted": "bg-violet-500/15 text-violet-300",
    "requisitos": "bg-sky-500/15 text-sky-300 border-sky-500/30",
    "evaluacion": "bg-primary/15 text-primary",
    "revision-ld": "bg-warning/15 text-warning",
    "aprobacion-manager": "bg-warning/15 text-warning",
    "excepcion-ceo": "bg-orange-500/20 text-orange-400 border-orange-500/40",
  };
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border border-border/50", map[value] ?? "bg-muted text-muted-foreground")}>
      {value.replace("-", " ")}
    </span>
  );
}

export function ReadinessGauge({ value, size = 120 }: { value: number; size?: number }) {
  const pct = Math.max(0, Math.min(1, value / 10));
  const radius = size / 2 - 8;
  const circ = Math.PI * radius;
  const offset = circ * (1 - pct);
  const color = value >= 8 ? "var(--color-success)" : value >= 6 ? "var(--color-warning)" : "var(--color-danger)";
  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
        <path
          d={`M 8 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 8} ${size / 2}`}
          fill="none" stroke="var(--color-muted)" strokeWidth={10} strokeLinecap="round"
        />
        <path
          d={`M 8 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 8} ${size / 2}`}
          fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 600ms ease" }}
        />
      </svg>
      <div className="-mt-6 text-center">
        <div className="font-display text-2xl font-bold">{value.toFixed(1)}</div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Readiness</div>
      </div>
    </div>
  );
}

export function QuarterProgress({ quarter, percent }: { quarter: string; percent: number }) {
  const tone = percent >= 70 ? "text-success" : percent >= 40 ? "text-warning" : "text-danger";
  const bg = percent >= 70 ? "bg-success" : percent >= 40 ? "bg-warning" : "bg-danger";
  return (
    <div className="rounded-lg border border-border bg-surface/60 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="font-display font-semibold text-sm">{quarter}</span>
        <span className={cn("text-xs font-mono", tone)}>{percent}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", bg)} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function DiscrepancyAlert() {
  return (
    <span title="Discrepancia alta entre autoevaluación y líder — se recomienda calibración" className="inline-flex items-center text-warning">
      <AlertTriangle className="h-4 w-4" />
    </span>
  );
}

export function EmptyState({ icon: Icon, title, message, action }: { icon: LucideIcon; title: string; message: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface/40 p-10 text-center">
      <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-display font-semibold text-base">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-display font-semibold text-white shadow-inner"
      style={{
        width: size, height: size, fontSize: size * 0.38,
        background: `linear-gradient(135deg, hsl(${hue} 60% 45%), hsl(${(hue + 50) % 360} 65% 35%))`,
      }}
    >
      {initials}
    </span>
  );
}

export function AtlasSpinner({ label = "ATLAS está analizando..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
      <p className="text-sm text-muted-foreground font-mono">{label}</p>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useAtlas } from "@/store/atlasStore";
import { PageHeader } from "@/components/atlas/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/atlas/AtlasUI";

export const Route = createFileRoute("/_app/planes")({
  component: Planes,
});

const COLS = ["borrador", "pendiente-aprobacion", "aprobado", "en-curso", "completado"] as const;
const TITLES: Record<string, string> = {
  "borrador": "Borrador", "pendiente-aprobacion": "Pendiente L&D",
  "aprobado": "Aprobado", "en-curso": "En curso", "completado": "Completado",
};

function Planes() {
  const { plans, employees } = useAtlas();

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader title="Planes de formación" subtitle="Vista Kanban por estado" />
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {COLS.map((col) => {
          const items = plans.filter((p) => p.status === col);
          return (
            <div key={col} className="rounded-lg bg-surface/60 border border-border p-3 min-h-40">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-display font-semibold text-sm">{TITLES[col]}</h3>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((p) => {
                  const emp = employees.find((e) => e.id === p.employeeId);
                  const totalH = p.items.reduce((s, i) => s + i.durationHours, 0);
                  const pct = p.items.length === 0 ? 0 : Math.round(p.items.filter((i) => i.status === "completado").length / p.items.length * 100);
                  return (
                    <Link key={p.id} to="/empleados/$id" params={{ id: p.employeeId }}>
                      <Card className="bg-background/40 border-border hover:border-primary/50 transition-colors">
                        <CardContent className="p-3 space-y-2">
                          <div className="text-sm font-medium">{emp?.name}</div>
                          <div className="text-xs text-muted-foreground">{emp?.role}</div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{p.items.length} ítems</span>
                            <span>{totalH}h</span>
                          </div>
                          {col === "en-curso" && (
                            <div className="h-1 rounded bg-muted overflow-hidden"><div className="h-full bg-primary" style={{ width: `${pct}%` }} /></div>
                          )}
                          <StatusBadge value={p.status} />
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

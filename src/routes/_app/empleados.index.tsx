import { createFileRoute, Link } from "@tanstack/react-router";
import { useAtlas, useCurrentUser, visibleEmployees } from "@/store/atlasStore";
import { PageHeader } from "@/components/atlas/PageHeader";
import { Avatar, SeniorityBadge, StatusBadge, UnitBadge, ReadinessGauge } from "@/components/atlas/AtlasUI";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

export const Route = createFileRoute("/_app/empleados/")({
  component: EmployeesList,
});

function EmployeesList() {
  const user = useCurrentUser()!;
  const employees = useAtlas((s) => s.employees);
  const list = visibleEmployees(user.appRole, user.id, employees);
  const [q, setQ] = useState("");
  const [unit, setUnit] = useState<string>("all");

  const filtered = useMemo(() => list.filter((e) =>
    (unit === "all" || e.unit === unit) &&
    (q === "" || e.name.toLowerCase().includes(q.toLowerCase()) || e.role.toLowerCase().includes(q.toLowerCase()))
  ), [list, q, unit]);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader title="Empleados" subtitle={`${filtered.length} colaboradores`} />

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-60 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o rol..." className="pl-9 bg-surface/60" />
        </div>
        <select value={unit} onChange={(e) => setUnit(e.target.value)} className="h-9 rounded-md border border-border bg-surface/60 px-3 text-sm">
          <option value="all">Todas las unidades</option>
          <option value="negocio">Negocio</option>
          <option value="soporte">Soporte</option>
        </select>
      </div>

      <div className="rounded-xl border border-border bg-surface/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="text-left p-3">Colaborador</th>
              <th className="text-left p-3">Seniority</th>
              <th className="text-left p-3">Unidad</th>
              <th className="text-left p-3">Stack</th>
              <th className="text-left p-3">Readiness</th>
              <th className="text-left p-3">Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} className="border-t border-border/40 hover:bg-background/40">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={e.name} size={36} />
                    <div>
                      <div className="font-medium">{e.name}</div>
                      <div className="text-xs text-muted-foreground">{e.role}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3"><SeniorityBadge value={e.seniority} /></td>
                <td className="p-3"><UnitBadge value={e.unit} /></td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {e.stack.map((s) => <span key={s} className="rounded bg-accent/40 px-1.5 py-0.5 text-[10px] font-mono">{s}</span>)}
                  </div>
                </td>
                <td className="p-3 font-mono">{(e.readinessScore ?? 0).toFixed(1)}</td>
                <td className="p-3"><StatusBadge value={e.status} /></td>
                <td className="p-3 text-right">
                  <Link to="/empleados/$id" params={{ id: e.id }} className="text-primary text-xs hover:underline">Ver perfil</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

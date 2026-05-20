import { createFileRoute, Link } from "@tanstack/react-router";
import { useAtlas, useCurrentUser, visibleEmployees } from "@/store/atlasStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReadinessGauge, QuarterProgress, StatusBadge, UnitBadge, SeniorityBadge } from "@/components/atlas/AtlasUI";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import { Users, ClipboardCheck, GraduationCap, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/atlas/PageHeader";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const user = useCurrentUser()!;
  const { employees, plans, assessments, transitions, competencies } = useAtlas();
  const team = visibleEmployees(user.appRole, user.id, employees);

  const activeCount = team.filter((e) => e.status === "active" || e.status === "in-review").length;
  const pendingPlans = plans.filter((p) => p.status === "pendiente-aprobacion").length;
  const monthAssessments = assessments.length;
  const inTransition = transitions.filter((t) => !["aprobado", "rechazado"].includes(t.stage)).length;

  // avg by domain
  const domainAgg: Record<string, { sum: number; n: number }> = {};
  assessments.forEach((a) => a.competencies.forEach((c) => {
    const d = competencies.find((x) => x.id === c.competencyId)?.domain ?? "Técnica";
    domainAgg[d] = domainAgg[d] || { sum: 0, n: 0 };
    domainAgg[d].sum += c.averageScore; domainAgg[d].n++;
  }));
  const domainData = Object.entries(domainAgg).map(([name, v]) => ({ name, score: +(v.sum / v.n).toFixed(2) }));

  // top gaps
  const gapAgg: Record<string, { sum: number; n: number }> = {};
  assessments.forEach((a) => a.competencies.forEach((c) => {
    gapAgg[c.competencyId] = gapAgg[c.competencyId] || { sum: 0, n: 0 };
    gapAgg[c.competencyId].sum += c.gap; gapAgg[c.competencyId].n++;
  }));
  const topGaps = Object.entries(gapAgg)
    .map(([id, v]) => ({ name: competencies.find((c) => c.id === id)?.name ?? id, gap: +(v.sum / v.n).toFixed(2) }))
    .sort((a, b) => b.gap - a.gap).slice(0, 5);

  // critical-gap employees without active plan
  const criticalEmps = team.filter((e) => {
    const a = assessments.find((x) => x.employeeId === e.id);
    const hasCritical = a?.competencies.some((c) => c.gapSeverity === "critical");
    const plan = plans.find((p) => p.employeeId === e.id && (p.status === "aprobado" || p.status === "en-curso"));
    return hasCritical && !plan;
  });

  // current quarter from items
  const q = (new Date().getMonth() / 3) | 0; const quarter = `Q${q + 1}`;
  const allItems = plans.filter((p) => team.some((t) => t.id === p.employeeId)).flatMap((p) => p.items.filter((i) => i.quarter === quarter));
  const qPct = allItems.length === 0 ? 0 : Math.round(allItems.filter((i) => i.status === "completado").length / allItems.length * 100);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader title="Dashboard" subtitle={`Bienvenida/o, ${user.name.split(" ")[0]}`} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={<Users className="h-4 w-4" />} label="Colaboradores activos" value={activeCount} />
        <Kpi icon={<GraduationCap className="h-4 w-4" />} label="Planes pendientes" value={pendingPlans} danger={pendingPlans > 0} />
        <Kpi icon={<ClipboardCheck className="h-4 w-4" />} label="Assessments este mes" value={monthAssessments} />
        <Kpi icon={<TrendingUp className="h-4 w-4" />} label="En transición" value={inTransition} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="bg-surface/60 border-border">
          <CardHeader><CardTitle className="font-display text-sm">Promedio por dominio</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={domainData} layout="vertical" margin={{ left: 8, right: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" domain={[0, 4]} stroke="var(--color-muted-foreground)" />
                <YAxis dataKey="name" type="category" width={90} stroke="var(--color-muted-foreground)" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Bar dataKey="score" radius={[0, 6, 6, 0]} label={{ position: "right", fill: "var(--color-muted-foreground)", fontSize: 11 }}>
                  {domainData.map((d, i) => <Cell key={i} fill={d.name === "Soft" ? "var(--color-warning)" : "var(--color-primary)"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-surface/60 border-border">
          <CardHeader><CardTitle className="font-display text-sm">Top 5 competencias con mayor gap</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topGaps} margin={{ left: 0, right: 8, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
                <YAxis domain={[0, 4]} stroke="var(--color-muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Bar dataKey="gap" fill="var(--color-danger)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <QuarterSemaphoreCard quarter={quarter} percent={qPct} totalItems={allItems.length} completed={allItems.filter((i) => i.status === "completado").length} />
      </div>

      <div className="flex justify-center"><ReadinessGauge value={user.readinessScore ?? 7} /></div>

      <Card className="bg-surface/60 border-border">
        <CardHeader><CardTitle className="font-display">Colaboradores con gaps críticos sin plan activo</CardTitle></CardHeader>
        <CardContent>
          {criticalEmps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay colaboradores en esta situación.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground border-b border-border">
                <tr><th className="text-left py-2">Nombre</th><th className="text-left">Unidad</th><th className="text-left">Rol</th><th className="text-left">Seniority</th><th></th></tr>
              </thead>
              <tbody>
                {criticalEmps.map((e) => (
                  <tr key={e.id} className="border-b border-border/50">
                    <td className="py-2 font-medium">{e.name}</td>
                    <td><UnitBadge value={e.unit} /></td>
                    <td className="text-muted-foreground">{e.role}</td>
                    <td><SeniorityBadge value={e.seniority} /></td>
                    <td className="text-right"><Link to="/empleados/$id" params={{ id: e.id }} className="text-primary text-xs hover:underline">Ver</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card className="bg-surface/60 border-border">
        <CardHeader><CardTitle className="font-display">Equipo</CardTitle></CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {team.map((e) => (
              <Link key={e.id} to="/empleados/$id" params={{ id: e.id }} className="rounded-lg border border-border bg-background/40 p-3 hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-sm">{e.name}</div>
                    <div className="text-xs text-muted-foreground">{e.role}</div>
                  </div>
                  <StatusBadge value={e.status} />
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <SeniorityBadge value={e.seniority} />
                  <UnitBadge value={e.unit} />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({ icon, label, value, danger }: { icon: React.ReactNode; label: string; value: number; danger?: boolean }) {
  return (
    <Card className="bg-surface/60 border-border">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">{icon}{label}</div>
        <div className={`mt-2 font-display font-bold text-3xl ${danger && value > 0 ? "text-danger" : ""}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

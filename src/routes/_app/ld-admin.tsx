import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAtlas, useCurrentUser } from "@/store/atlasStore";
import { PageHeader } from "@/components/atlas/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/atlas/AtlasUI";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid, Cell } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/ld-admin")({
  component: LdAdmin,
});

function LdAdmin() {
  const user = useCurrentUser();
  const { plans, employees, assessments, competencies, approvePlan, transitions } = useAtlas();
  if (user?.appRole !== "ld_admin") {
    return <div className="p-8 text-center text-muted-foreground">Acceso solo para L&D Admin.</div>;
  }
  const pendingPlans = plans.filter((p) => p.status === "pendiente-aprobacion");
  const pendingTrans = transitions.filter((t) => t.stage === "revision-ld" || t.stage === "excepcion-ceo");

  // gap chart
  const gapAgg: Record<string, { sum: number; n: number }> = {};
  assessments.forEach((a) => a.competencies.forEach((c) => {
    gapAgg[c.competencyId] = gapAgg[c.competencyId] || { sum: 0, n: 0 };
    gapAgg[c.competencyId].sum += c.gap; gapAgg[c.competencyId].n++;
  }));
  const topGaps = Object.entries(gapAgg)
    .map(([id, v]) => ({ name: competencies.find((c) => c.id === id)?.name.slice(0, 18) ?? id, gap: +(v.sum / v.n).toFixed(2) }))
    .sort((a, b) => b.gap - a.gap).slice(0, 8);

  // readiness evolution mock
  const monthly = ["May", "Jun", "Jul", "Ago", "Sep", "Oct"].map((m, i) => ({
    month: m,
    negocio: +(6.5 + i * 0.2 + Math.random() * 0.2).toFixed(1),
    soporte: +(7.0 + i * 0.15 + Math.random() * 0.2).toFixed(1),
  }));

  // plans by quarter stacked
  const quarterData = (["Q1","Q2","Q3","Q4"] as const).map((q) => {
    const items = plans.flatMap((p) => p.items.filter((i) => i.quarter === q));
    return {
      quarter: q,
      completado: items.filter((i) => i.status === "completado").length,
      "en-curso": items.filter((i) => i.status === "en-curso").length,
      pendiente: items.filter((i) => i.status === "pendiente").length,
    };
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader title="L&D Admin" subtitle="Panel de aprobaciones y reportes globales" />

      <Card className="bg-surface/60 border-border">
        <CardHeader><CardTitle className="font-display">Planes pendientes ({pendingPlans.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {pendingPlans.length === 0 && <p className="text-sm text-muted-foreground">No hay planes pendientes.</p>}
          {pendingPlans.map((p) => {
            const emp = employees.find((e) => e.id === p.employeeId);
            return (
              <div key={p.id} className="flex items-center justify-between rounded-md border border-border bg-background/40 p-3">
                <div>
                  <div className="text-sm font-medium">{emp?.name}</div>
                  <div className="text-xs text-muted-foreground">{p.items.length} ítems · {p.items.reduce((s,i)=>s+i.durationHours,0)}h</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => { approvePlan(p.id, user.name); toast.success("Plan aprobado"); }}>Aprobar</Button>
                  <Button size="sm" variant="outline" onClick={() => toast("Devuelto para revisión")}>Devolver</Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="bg-surface/60 border-border">
        <CardHeader><CardTitle className="font-display">Transiciones pendientes ({pendingTrans.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {pendingTrans.map((t) => {
            const emp = employees.find((e) => e.id === t.employeeId);
            return (
              <div key={t.id} className="flex items-center justify-between rounded-md border border-border bg-background/40 p-3">
                <div>
                  <div className="text-sm font-medium">{emp?.name} — {t.fromSeniority} → {t.toSeniority}</div>
                  <div className="text-xs text-muted-foreground">{t.readinessPercentage}% cumplimiento técnico</div>
                </div>
                <StatusBadge value={t.stage} />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="bg-surface/60 border-border">
          <CardHeader><CardTitle className="font-display">Top competencias con mayor brecha</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topGaps}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" height={70} />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Bar dataKey="gap" radius={[6, 6, 0, 0]}>
                  {topGaps.map((g, i) => <Cell key={i} fill={g.gap >= 2.5 ? "var(--color-danger)" : g.gap >= 1.5 ? "var(--color-warning)" : "var(--color-primary)"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-surface/60 border-border">
          <CardHeader><CardTitle className="font-display">Evolución del readiness promedio</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                <YAxis domain={[0, 10]} stroke="var(--color-muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="negocio" stroke="var(--color-primary)" fill="url(#g1)" />
                <Area type="monotone" dataKey="soporte" stroke="var(--color-success)" fill="url(#g2)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-surface/60 border-border lg:col-span-2">
          <CardHeader><CardTitle className="font-display">Estado de planes por Quarter</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={quarterData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="quarter" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Bar dataKey="completado" stackId="a" fill="var(--color-success)" />
                <Bar dataKey="en-curso" stackId="a" fill="var(--color-primary)" />
                <Bar dataKey="pendiente" stackId="a" fill="var(--color-warning)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Button onClick={() => toast.success("Exportación .xlsx simulada")}>Exportar datos (.xlsx)</Button>
    </div>
  );
}

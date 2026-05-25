import { createFileRoute, Link } from "@tanstack/react-router";
import { useAtlas, useCurrentUser } from "@/store/atlasStore";
import { PageHeader } from "@/components/atlas/PageHeader";
import { Avatar, SeniorityBadge, UnitBadge, ReadinessGauge, GapBadge, CompetencyLevelDots, DiscrepancyAlert, StatusBadge, EmptyState } from "@/components/atlas/AtlasUI";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CompetencyRadar } from "@/components/atlas/CompetencyRadar";
import { Calendar, FileDown, GraduationCap, ChevronLeft, Check, ClipboardEdit, ChevronDown, ExternalLink, Clock, Sparkles } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CvTab } from "@/components/atlas/CvTab";

export const Route = createFileRoute("/_app/empleados/$id")({
  component: EmployeeDetail,
});

function EmployeeDetail() {
  const { id } = Route.useParams();
  const currentUser = useCurrentUser();
  const isOwner = currentUser?.id === id;
  const { employees, assessments, plans, transitions, competencies, cvs, updateCV, toggleTrainingItem, successionPlans } = useAtlas();
  const emp = employees.find((e) => e.id === id);
  if (!emp) return <div className="p-8"><Link to="/empleados" className="text-primary text-sm">← Volver</Link><p className="mt-4">No encontrado.</p></div>;

  const assessment = assessments.find((a) => a.employeeId === emp.id);
  const plan = plans.find((p) => p.employeeId === emp.id);
  const empTransitions = transitions.filter((t) => t.employeeId === emp.id);
  const cv = cvs.find((c) => c.employeeId === emp.id);
  const leader = employees.find((e) => e.id === emp.leaderId);
  const manager = employees.find((e) => e.id === emp.managerId);

  const radarData = (assessment?.competencies ?? [])
    .filter((_, i) => i < 10)
    .map((c) => ({
      name: competencies.find((x) => x.id === c.competencyId)?.name.slice(0, 14) ?? "",
      actual: c.averageScore, expected: c.expectedLevel,
    }));

  type CA = NonNullable<typeof assessment>["competencies"][number];
  const byDomain: Record<string, CA[]> = { "Técnica": [], "Soft": [] };
  assessment?.competencies.forEach((c) => {
    const d = competencies.find((x) => x.id === c.competencyId)?.domain ?? "Técnica";
    byDomain[d].push(c);
  });

  const quarters = ["Q1", "Q2", "Q3", "Q4"] as const;
  const planByQ = (q: string) => plan?.items.filter((i) => i.quarter === q) ?? [];
  const planPct = plan && plan.items.length > 0
    ? Math.round(plan.items.filter((i) => i.status === "completado").length / plan.items.length * 100)
    : 0;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Link to="/empleados" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="h-4 w-4" />Empleados</Link>
      <PageHeader title={emp.name} subtitle={emp.role} />

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <aside className="space-y-4">
          <Card className="bg-surface/60 border-border">
            <CardContent className="p-5 flex flex-col items-center text-center">
              <Avatar name={emp.name} size={80} />
              <h2 className="mt-3 font-display font-semibold text-lg">{emp.name}</h2>
              <p className="text-sm text-muted-foreground">{emp.role}</p>
              <div className="flex flex-wrap gap-2 justify-center mt-3">
                <SeniorityBadge value={emp.seniority} />
                <UnitBadge value={emp.unit} />
                <StatusBadge value={emp.status} />
              </div>
              <div className="mt-4 w-full">
                <ReadinessGauge value={emp.readinessScore ?? 0} />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-surface/60 border-border">
            <CardContent className="p-4 text-sm space-y-2">
              <Info label="Email" value={emp.email} />
              <Info label="Ingreso" value={emp.joinDate} />
              <Info label="Líder" value={leader?.name ?? "—"} />
              <Info label="Manager" value={manager?.name ?? "—"} />
              <div>
                <div className="text-xs uppercase text-muted-foreground mb-1">Stack</div>
                <div className="flex flex-wrap gap-1">
                  {emp.stack.map((s) => <span key={s} className="rounded bg-accent/40 px-1.5 py-0.5 text-[10px] font-mono">{s}</span>)}
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        <div>
          <Tabs defaultValue="comp">
            <TabsList className="bg-surface/60 border border-border">
              <TabsTrigger value="comp">Competencias</TabsTrigger>
              <TabsTrigger value="plan">Plan</TabsTrigger>
              <TabsTrigger value="hist">Assessments</TabsTrigger>
              <TabsTrigger value="trans">Transiciones</TabsTrigger>
              <TabsTrigger value="cv">CV</TabsTrigger>
            </TabsList>

            <TabsContent value="comp" className="space-y-4">
              {!assessment ? (
                <EmptyState
                  icon={GraduationCap}
                  title="Sin assessment"
                  message="Aún no se realizó un assessment."
                  action={isOwner ? (
                    <Button onClick={() => toast.success("Autoevaluación iniciada")}>
                      <ClipboardEdit className="h-4 w-4 mr-1" />Iniciar autoevaluación
                    </Button>
                  ) : undefined}
                />
              ) : (
                <>
                  {isOwner && (
                    <div className="flex justify-end">
                      <Button onClick={() => toast.success("Autoevaluación iniciada")}>
                        <ClipboardEdit className="h-4 w-4 mr-1" />Iniciar autoevaluación
                      </Button>
                    </div>
                  )}
                  <Card className="bg-surface/60 border-border">
                    <CardHeader><CardTitle className="font-display">Perfil actual vs. esperado</CardTitle></CardHeader>
                    <CardContent><CompetencyRadar data={radarData} /></CardContent>
                  </Card>
                  {(["Técnica", "Soft"] as const).map((dom) => (
                    <Card key={dom} className="bg-surface/60 border-border">
                      <CardHeader><CardTitle className="font-display text-base">{dom}</CardTitle></CardHeader>
                      <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-surface/80 text-xs uppercase text-muted-foreground">
                            <tr>
                              <th className="text-left p-3">Competencia</th>
                              <th className="text-left p-3">Autoevaluación</th>
                              <th className="text-left p-3">Líder</th>
                              <th className="text-left p-3">Promedio</th>
                              <th className="text-left p-3">Esperado</th>
                              <th className="text-left p-3">Gap</th>
                              <th className="text-left p-3">Discrepancia</th>
                            </tr>
                          </thead>
                          <tbody>
                            {byDomain[dom].length === 0 && (
                              <tr><td colSpan={7} className="p-4 text-center text-xs text-muted-foreground">Sin competencias en este dominio.</td></tr>
                            )}
                            {byDomain[dom].map((c) => (
                              <tr key={c.competencyId} className="border-t border-border/40">
                                <td className="p-3 font-medium">{competencies.find((x) => x.id === c.competencyId)?.name}</td>
                                <td className="p-3"><CompetencyLevelDots value={c.selfScore} /></td>
                                <td className="p-3"><CompetencyLevelDots value={c.managerScore} /></td>
                                <td className="p-3 font-mono">{c.averageScore.toFixed(1)}</td>
                                <td className="p-3 font-mono">{c.expectedLevel}</td>
                                <td className="p-3"><GapBadge gap={c.gap} severity={c.gapSeverity} /></td>
                                <td className="p-3">{c.discrepancy ? <DiscrepancyAlert /> : <span className="text-muted-foreground/40 text-xs">—</span>}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </TabsContent>

            <TabsContent value="plan" className="space-y-4">
              {!plan ? (
                <EmptyState icon={GraduationCap} title="Sin plan" message="Generá un plan basado en los gaps del último assessment."
                  action={<Button onClick={() => toast.success("Plan sugerido por ATLAS generado")}>Generar plan sugerido</Button>} />
              ) : (
                <>
                  <Card className="bg-surface/60 border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-xs uppercase tracking-wide text-muted-foreground">Avance general del plan</div>
                          <div className="font-display font-bold text-3xl">{planPct}%</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {plan.items.filter((i) => i.status === "completado").length} de {plan.items.length} ítems
                          </div>
                        </div>
                        <StatusBadge value={plan.status} />
                      </div>
                      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full transition-all ${planPct >= 70 ? "bg-success" : planPct >= 40 ? "bg-warning" : "bg-danger"}`}
                          style={{ width: `${planPct}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-3">
                    {quarters.map((q) => {
                      const items = planByQ(q);
                      const pct = items.length === 0 ? 0 : Math.round(items.filter((i) => i.status === "completado").length / items.length * 100);
                      const tones = pct >= 70
                        ? { dot: "bg-success", bar: "bg-success", text: "text-success" }
                        : pct >= 40
                        ? { dot: "bg-warning", bar: "bg-warning", text: "text-warning" }
                        : { dot: "bg-danger", bar: "bg-danger", text: "text-danger" };
                      return (
                        <Collapsible key={q} defaultOpen={items.length > 0}>
                          <Card className="bg-surface/60 border-border">
                            <CollapsibleTrigger className="w-full group">
                              <CardHeader className="py-3">
                                <div className="flex items-center gap-4">
                                  <span className={`h-3 w-3 rounded-full ${tones.dot}`} />
                                  <CardTitle className="font-display text-base flex-1 text-left">{q}</CardTitle>
                                  <span className="text-xs text-muted-foreground">{items.filter((i) => i.status === "completado").length}/{items.length}</span>
                                  <span className={`text-sm font-mono font-semibold ${tones.text}`}>{pct}%</span>
                                  <div className="w-32 h-1.5 rounded-full bg-muted overflow-hidden hidden sm:block">
                                    <div className={`h-full ${tones.bar}`} style={{ width: `${pct}%` }} />
                                  </div>
                                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                                </div>
                              </CardHeader>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <CardContent className="space-y-2 pt-0">
                                {items.length === 0 && <p className="text-xs text-muted-foreground py-2">Sin ítems en este quarter.</p>}
                                {items.map((it) => {
                                  const comp = competencies.find((c) => c.id === it.competencyIds[0]);
                                  const prioTone = it.priority === "Alta" ? "bg-danger/15 text-danger border-danger/30"
                                    : it.priority === "Media" ? "bg-warning/15 text-warning border-warning/30"
                                    : "bg-muted text-muted-foreground border-border";
                                  return (
                                    <div key={it.id} className="flex items-start gap-3 rounded-md border border-border/50 bg-background/30 p-3">
                                      <button
                                        onClick={() => toggleTrainingItem(plan.id, it.id)}
                                        className={`mt-0.5 h-5 w-5 rounded border flex items-center justify-center transition-colors ${it.status === "completado" ? "bg-success border-success" : "border-border hover:border-primary"}`}
                                        aria-label="Marcar como completado"
                                      >
                                        {it.status === "completado" && <Check className="h-3.5 w-3.5 text-white" />}
                                      </button>
                                      <div className="flex-1 min-w-0 space-y-1.5">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className={`text-sm font-medium ${it.status === "completado" ? "line-through text-muted-foreground" : ""}`}>{it.title}</span>
                                          {it.suggestedByAtlas && (
                                            <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                                              <Sparkles className="h-2.5 w-2.5 mr-0.5" />Sugerido por ATLAS
                                            </Badge>
                                          )}
                                          <Badge variant="outline" className={`text-[10px] ${prioTone}`}>{it.priority}</Badge>
                                          <StatusBadge value={it.status} />
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                                          <span className="font-mono">{it.platform}</span>
                                          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{it.durationHours}h</span>
                                          {comp && <span className="inline-flex items-center gap-1"><GraduationCap className="h-3 w-3" />{comp.name}</span>}
                                          {it.url && (
                                            <a href={it.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                                              <ExternalLink className="h-3 w-3" />Ir al curso
                                            </a>
                                          )}
                                        </div>
                                        {it.status === "en-curso" && (
                                          <div className="mt-1 h-1 rounded bg-muted overflow-hidden">
                                            <div className="h-full bg-primary transition-all" style={{ width: `${it.progressPercent ?? 0}%` }} />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </CardContent>
                            </CollapsibleContent>
                          </Card>
                        </Collapsible>
                      );
                    })}
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="hist">
              {!assessment ? <EmptyState icon={Calendar} title="Sin historial" message="No hay assessments registrados." /> : (
                <Card className="bg-surface/60 border-border">
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium capitalize">{assessment.type}</div>
                        <div className="text-xs text-muted-foreground">{new Date(assessment.date).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Readiness</div>
                        <div className="font-display text-xl">{assessment.readinessScore}</div>
                      </div>
                    </div>
                    {assessment.managerNotes && <p className="mt-3 text-sm text-muted-foreground italic">"{assessment.managerNotes}"</p>}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="trans" className="space-y-4">
              {empTransitions.length === 0 ? <EmptyState icon={Calendar} title="Sin transiciones" message="No hay transiciones registradas para este colaborador." /> :
                empTransitions.map((t) => (
                  <Card key={t.id} className="bg-surface/60 border-border">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{t.fromSeniority} → {t.toSeniority}</div>
                          <div className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString()}</div>
                        </div>
                        <StatusBadge value={t.stage} />
                      </div>
                      <p className="mt-2 text-sm">{t.executiveSummary}</p>
                    </CardContent>
                  </Card>
                ))}
              {(currentUser?.appRole === "ld_admin" || currentUser?.appRole === "super_admin") && (() => {
                const inPlans = successionPlans.filter((sp) => sp.successorCandidates.some((c) => c.employeeId === emp.id));
                if (inPlans.length === 0) return null;
                return (
                  <Card className="bg-surface/60 border-border">
                    <CardHeader><CardTitle className="font-display text-base">Planes de sucesión</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {inPlans.map((sp) => {
                        const c = sp.successorCandidates.find((x) => x.employeeId === emp.id)!;
                        const tone = c.readinessLevel === "Listo ahora" ? "bg-success/15 text-success border-success/30"
                          : c.readinessLevel === "Listo en 1 año" ? "bg-primary/15 text-primary border-primary/30"
                          : "bg-warning/15 text-warning border-warning/30";
                        return (
                          <div key={sp.id} className="flex items-center justify-between gap-2 rounded-md border border-border bg-background/40 p-3 flex-wrap">
                            <div>
                              <div className="text-sm font-medium">{sp.targetRoleName}</div>
                              <div className="text-xs text-muted-foreground">Readiness {c.readinessPercentage}%</div>
                            </div>
                            <Badge variant="outline" className={tone}>{c.readinessLevel}</Badge>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                );
              })()}
            </TabsContent>


            <TabsContent value="cv">
              {cv && <CvTab emp={emp} cv={cv} plan={plan} competencies={competencies} updateCV={updateCV} />}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><div className="text-xs uppercase text-muted-foreground">{label}</div><div className="text-sm">{value}</div></div>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="mb-4"><h4 className="font-display font-semibold text-sm uppercase tracking-wide text-primary mb-2">{title}</h4>{children}</div>;
}
function CvSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="mb-4"><h4 className="font-display font-semibold text-xs uppercase tracking-wider text-blue-700 mb-1.5">{title}</h4>{children}</div>;
}

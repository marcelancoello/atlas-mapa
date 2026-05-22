import { useState } from "react";
import { useAtlas, useCurrentUser } from "@/store/atlasStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { ChevronLeft, Plus, Users, FileDown, Trash2, CheckCircle2 } from "lucide-react";
import type { SuccessionCandidate, SuccessionPlan, SuccessionReadiness } from "@/types";
import { toast } from "sonner";
import { exportSuccessionReport } from "@/lib/successionExport";

const READINESS: SuccessionReadiness[] = ["Listo ahora", "Listo en 1 año", "Listo en 2-3 años"];

function coverageTone(sp: SuccessionPlan): { dot: string; label: string; tone: string } {
  if (sp.successorCandidates.length === 0) return { dot: "bg-danger", label: "Sin candidatos", tone: "text-danger" };
  const hasReady = sp.successorCandidates.some((c) => c.readinessLevel === "Listo ahora" || c.readinessLevel === "Listo en 1 año");
  if (hasReady) return { dot: "bg-success", label: "Cobertura adecuada", tone: "text-success" };
  return { dot: "bg-warning", label: "Solo listos a 2-3 años", tone: "text-warning" };
}

export function SuccessionPanel() {
  const user = useCurrentUser();
  const { successionPlans, employees, createSuccessionPlan } = useAtlas();
  const [openId, setOpenId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [newHolder, setNewHolder] = useState<string>("");
  const [newNotes, setNewNotes] = useState("");

  if (openId) {
    const sp = successionPlans.find((s) => s.id === openId);
    if (sp) return <SuccessionDetail plan={sp} onBack={() => setOpenId(null)} />;
  }

  const handleCreate = () => {
    if (!newRole.trim()) { toast.error("El nombre del rol es obligatorio"); return; }
    createSuccessionPlan({
      targetRoleId: `role-${Date.now()}`,
      targetRoleName: newRole.trim(),
      currentHolderId: newHolder || undefined,
      notes: newNotes.trim() || undefined,
      updatedBy: user?.name ?? "L&D Admin",
    });
    setShowNew(false); setNewRole(""); setNewHolder(""); setNewNotes("");
    toast.success("Plan de sucesión creado");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-display text-lg font-semibold">Planes de sucesión</h3>
          <p className="text-xs text-muted-foreground">Roles clave y sus candidatos identificados.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { exportSuccessionReport(successionPlans, employees); toast.success("Reporte exportado"); }}>
            <FileDown className="h-4 w-4 mr-1" />Generar reporte
          </Button>
          <Dialog open={showNew} onOpenChange={setShowNew}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" />Nuevo plan de sucesión</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nuevo plan de sucesión</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <label className="block text-sm">
                  <span className="text-xs uppercase text-muted-foreground">Rol objetivo</span>
                  <Input value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="Ej: Tech Lead Backend" />
                </label>
                <label className="block text-sm">
                  <span className="text-xs uppercase text-muted-foreground">Titular actual</span>
                  <select value={newHolder} onChange={(e) => setNewHolder(e.target.value)}
                    className="mt-1 w-full h-9 rounded-md border border-border bg-background px-2 text-sm">
                    <option value="">Vacante</option>
                    {employees.map((e) => <option key={e.id} value={e.id}>{e.name} — {e.role}</option>)}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="text-xs uppercase text-muted-foreground">Notas</span>
                  <Textarea value={newNotes} onChange={(e) => setNewNotes(e.target.value)} rows={3} />
                </label>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
                <Button onClick={handleCreate}>Crear</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {successionPlans.length === 0 ? (
        <Card className="bg-surface/60 border-border"><CardContent className="p-8 text-center text-sm text-muted-foreground">No hay planes de sucesión. Creá el primero.</CardContent></Card>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {successionPlans.map((sp) => {
            const holder = employees.find((e) => e.id === sp.currentHolderId);
            const tone = coverageTone(sp);
            return (
              <Card key={sp.id} className="bg-surface/60 border-border hover:border-primary/40 transition-colors cursor-pointer" onClick={() => setOpenId(sp.id)}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="font-display font-semibold truncate">{sp.targetRoleName}</h4>
                      <p className="text-xs text-muted-foreground truncate">
                        Titular: {holder ? holder.name : <span className="text-warning">Vacante</span>}
                      </p>
                    </div>
                    <span className={`h-3 w-3 rounded-full shrink-0 mt-1 ${tone.dot}`} title={tone.label} />
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{sp.successorCandidates.length} candidato{sp.successorCandidates.length === 1 ? "" : "s"}</span>
                    <span className={`ml-auto ${tone.tone}`}>{tone.label}</span>
                  </div>
                  {sp.notes && <p className="text-xs text-muted-foreground line-clamp-2 italic">{sp.notes}</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SuccessionDetail({ plan, onBack }: { plan: SuccessionPlan; onBack: () => void }) {
  const { employees, assessments, addSuccessionCandidate, removeSuccessionCandidate, plans } = useAtlas();
  const holder = employees.find((e) => e.id === plan.currentHolderId);
  const [empId, setEmpId] = useState("");
  const [level, setLevel] = useState<SuccessionReadiness>("Listo en 1 año");
  const [strengths, setStrengths] = useState("");
  const [devAreas, setDevAreas] = useState("");
  const [hasDevPlan, setHasDevPlan] = useState(false);

  const handleAdd = () => {
    if (!empId) { toast.error("Seleccioná un colaborador"); return; }
    const a = assessments.find((x) => x.employeeId === empId);
    const pct = Math.round((a?.readinessScore ?? 5) * 10);
    const candidate: SuccessionCandidate = {
      employeeId: empId, readinessLevel: level, readinessPercentage: pct,
      strengths: strengths.split(",").map((s) => s.trim()).filter(Boolean),
      developmentAreas: devAreas.split(",").map((s) => s.trim()).filter(Boolean),
      hasDevelopmentPlan: hasDevPlan,
    };
    addSuccessionCandidate(plan.id, candidate);
    setEmpId(""); setStrengths(""); setDevAreas(""); setHasDevPlan(false);
    toast.success("Candidato agregado");
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" />Volver a planes
      </button>

      <Card className="bg-surface/60 border-border">
        <CardHeader>
          <CardTitle className="font-display flex items-center justify-between flex-wrap gap-2">
            <span>{plan.targetRoleName}</span>
            <Badge variant="outline">Titular: {holder?.name ?? "Vacante"}</Badge>
          </CardTitle>
        </CardHeader>
        {plan.notes && <CardContent className="pt-0"><p className="text-sm text-muted-foreground italic">{plan.notes}</p></CardContent>}
      </Card>

      <Card className="bg-surface/60 border-border">
        <CardHeader><CardTitle className="font-display text-base">Candidatos ({plan.successorCandidates.length})</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {plan.successorCandidates.length === 0 && <p className="text-sm text-muted-foreground">Sin candidatos aún.</p>}
          {plan.successorCandidates.map((c) => {
            const emp = employees.find((e) => e.id === c.employeeId);
            const hasPlan = c.hasDevelopmentPlan || plans.some((p) => p.employeeId === c.employeeId && p.status !== "borrador");
            const tone = c.readinessLevel === "Listo ahora" ? "bg-success/15 text-success border-success/30"
              : c.readinessLevel === "Listo en 1 año" ? "bg-primary/15 text-primary border-primary/30"
              : "bg-warning/15 text-warning border-warning/30";
            return (
              <div key={c.employeeId} className="rounded-md border border-border bg-background/40 p-3">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <div className="font-medium text-sm">{emp?.name}</div>
                    <div className="text-xs text-muted-foreground">{emp?.role} · {emp?.seniority}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={tone}>{c.readinessLevel}</Badge>
                    <span className="text-sm font-mono font-semibold">{c.readinessPercentage}%</span>
                    {hasPlan && <span title="Tiene plan de formación"><CheckCircle2 className="h-4 w-4 text-success" /></span>}
                    <Button variant="ghost" size="sm" onClick={() => removeSuccessionCandidate(plan.id, c.employeeId)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full ${c.readinessPercentage >= 75 ? "bg-success" : c.readinessPercentage >= 50 ? "bg-primary" : "bg-warning"}`} style={{ width: `${c.readinessPercentage}%` }} />
                </div>
                {c.strengths.length > 0 && (
                  <div className="mt-2 text-xs"><span className="text-muted-foreground">Fortalezas: </span>{c.strengths.join(", ")}</div>
                )}
                {c.developmentAreas.length > 0 && (
                  <div className="text-xs"><span className="text-muted-foreground">A desarrollar: </span>{c.developmentAreas.join(", ")}</div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="bg-surface/60 border-border">
        <CardHeader><CardTitle className="font-display text-base">Agregar candidato</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="text-xs uppercase text-muted-foreground">Colaborador</span>
              <select value={empId} onChange={(e) => setEmpId(e.target.value)}
                className="mt-1 w-full h-9 rounded-md border border-border bg-background px-2 text-sm">
                <option value="">Seleccionar…</option>
                {employees.filter((e) => e.id !== plan.currentHolderId).map((e) => (
                  <option key={e.id} value={e.id}>{e.name} — {e.role}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-xs uppercase text-muted-foreground">Nivel de readiness</span>
              <select value={level} onChange={(e) => setLevel(e.target.value as SuccessionReadiness)}
                className="mt-1 w-full h-9 rounded-md border border-border bg-background px-2 text-sm">
                {READINESS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </label>
          </div>
          <label className="block text-sm">
            <span className="text-xs uppercase text-muted-foreground">Fortalezas (separadas por coma)</span>
            <Input value={strengths} onChange={(e) => setStrengths(e.target.value)} placeholder="Ownership, Comunicación, ..." />
          </label>
          <label className="block text-sm">
            <span className="text-xs uppercase text-muted-foreground">Áreas de desarrollo (separadas por coma)</span>
            <Input value={devAreas} onChange={(e) => setDevAreas(e.target.value)} placeholder="Mentoring, Roadmap, ..." />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={hasDevPlan} onChange={(e) => setHasDevPlan(e.target.checked)} />
            Tiene plan de formación orientado a este rol
          </label>
          <Button onClick={handleAdd}><Plus className="h-4 w-4 mr-1" />Agregar candidato</Button>
        </CardContent>
      </Card>
    </div>
  );
}

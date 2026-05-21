import { createFileRoute } from "@tanstack/react-router";
import { useAtlas, useCurrentUser } from "@/store/atlasStore";
import { PageHeader } from "@/components/atlas/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, AtlasSpinner } from "@/components/atlas/AtlasUI";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, ShieldAlert, CheckCircle2 } from "lucide-react";

const STAGES = ["requisitos", "evaluacion", "revision-ld", "aprobacion-manager", "aprobado"] as const;

export const Route = createFileRoute("/_app/transiciones")({
  component: Transiciones,
});

function Transiciones() {
  const {
    transitions, employees, transitionRequirements,
    setTransitionRequirement, advanceTransitionStage, requestCeoException,
  } = useAtlas();
  const me = useCurrentUser();
  const [analyzing, setAnalyzing] = useState<string | null>(null);

  const canManage = (employeeId: string) => {
    if (!me) return false;
    if (me.appRole === "ld_admin" || me.appRole === "manager") return true;
    const emp = employees.find((e) => e.id === employeeId);
    return me.appRole === "leader" && emp?.leaderId === me.id;
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader title="Transiciones de Seniority" />
      <div className="space-y-4">
        {transitions.map((t) => {
          const emp = employees.find((e) => e.id === t.employeeId);
          const stageIdx = STAGES.indexOf(t.stage as typeof STAGES[number]);
          const reqDef = transitionRequirements.find(
            (r) => r.fromSeniority === t.fromSeniority && r.toSeniority === t.toSeniority,
          );
          const items = reqDef?.mandatoryItems ?? Object.keys(t.requirementsFulfilled);
          const allMet = items.length > 0 && items.every((k) => !!t.requirementsFulfilled[k]);
          const missing = items.filter((k) => !t.requirementsFulfilled[k]);
          const isRequisitos = t.stage === "requisitos";
          const isException = t.stage === "excepcion-ceo";
          const editable = canManage(t.employeeId);

          return (
            <Card key={t.id} className="bg-surface/60 border-border">
              <CardContent className="p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-display font-semibold text-lg">{emp?.name}</div>
                    <div className="text-sm text-muted-foreground">{t.fromSeniority} → {t.toSeniority}</div>
                  </div>
                  <StatusBadge value={t.stage} />
                </div>

                <div className="flex gap-1 items-center overflow-x-auto pb-1">
                  {STAGES.map((s, i) => (
                    <div key={s} className="flex items-center gap-1">
                      <div className={`h-7 px-2 rounded text-[10px] flex items-center whitespace-nowrap ${i <= stageIdx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        {s}
                      </div>
                      {i < STAGES.length - 1 && <div className={`h-px w-4 ${i < stageIdx ? "bg-primary" : "bg-border"}`} />}
                    </div>
                  ))}
                  {isException && (
                    <div className="ml-2 h-7 px-2 rounded text-[10px] flex items-center whitespace-nowrap border border-orange-500/40 bg-orange-500/20 text-orange-400">
                      excepcion-ceo
                    </div>
                  )}
                </div>

                {(isRequisitos || isException) && (
                  <div className="rounded-lg border border-border bg-background/40 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-primary" />
                      <h4 className="font-display font-semibold text-sm">Requisitos excluyentes</h4>
                      <span className="text-xs text-muted-foreground">
                        Configurados por L&D Admin para {t.fromSeniority} → {t.toSeniority}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {items.map((key) => {
                        const checked = !!t.requirementsFulfilled[key];
                        return (
                          <li key={key} className="flex items-start gap-2 text-sm">
                            <Checkbox
                              id={`${t.id}-${key}`}
                              checked={checked}
                              disabled={!editable || isException}
                              onCheckedChange={(v) => setTransitionRequirement(t.id, key, !!v)}
                              className="mt-0.5"
                            />
                            <label htmlFor={`${t.id}-${key}`} className={`leading-relaxed ${checked ? "text-foreground" : "text-muted-foreground"}`}>
                              {key}
                            </label>
                          </li>
                        );
                      })}
                    </ul>

                    {!allMet && missing.length > 0 && (
                      <div className="flex items-start gap-2 rounded-md border border-orange-500/40 bg-orange-500/10 p-3 text-sm text-orange-300">
                        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                        <div>
                          <div className="font-medium">Requiere excepción del CEO</div>
                          <div className="text-xs text-orange-300/80">
                            Hay {missing.length} requisito(s) sin cumplir. La promoción no puede avanzar al flujo normal sin aprobación excepcional del CEO.
                          </div>
                        </div>
                      </div>
                    )}

                    {allMet && !isException && (
                      <div className="flex items-start gap-2 rounded-md border border-success/40 bg-success/10 p-3 text-sm text-success">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                        <div>Todos los requisitos excluyentes están cumplidos. La transición puede pasar a evaluación técnica.</div>
                      </div>
                    )}

                    {editable && isRequisitos && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button
                          size="sm"
                          disabled={!allMet}
                          onClick={() => { advanceTransitionStage(t.id); toast.success("Requisitos validados — pasa a evaluación técnica"); }}
                        >
                          Pasar a evaluación
                        </Button>
                        {!allMet && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-orange-500/40 text-orange-400 hover:bg-orange-500/10"
                            onClick={() => { requestCeoException(t.id); toast("Solicitud de excepción enviada al CEO", { description: "Visible en L&D Admin" }); }}
                          >
                            Solicitar excepción del CEO
                          </Button>
                        )}
                      </div>
                    )}

                    {editable && isException && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button
                          size="sm"
                          onClick={() => { advanceTransitionStage(t.id); toast.success("Excepción aprobada — continúa con evaluación"); }}
                        >
                          Aprobar excepción (CEO)
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {!isRequisitos && !isException && (
                  <>
                    <div className="grid sm:grid-cols-3 gap-3 text-center">
                      <div className="rounded-md bg-background/40 p-3"><div className="text-xs text-muted-foreground">Cumplimiento técnico</div><div className="font-display text-2xl">{t.readinessPercentage}%</div></div>
                      <div className="rounded-md bg-background/40 p-3"><div className="text-xs text-muted-foreground">Dimensiones referente/demostrada</div><div className="font-display text-2xl">{Object.values(t.dimensionScores).filter((v) => v === "demostrada" || v === "referente").length}/5</div></div>
                      <div className="rounded-md bg-background/40 p-3"><div className="text-xs text-muted-foreground">Dictamen ATLAS</div><div className={`font-display text-lg ${t.dictamen === "listo" ? "text-success" : t.dictamen === "en-camino" ? "text-warning" : "text-danger"}`}>{t.dictamen ?? "—"}</div></div>
                    </div>

                    <p className="text-sm italic text-muted-foreground">"{t.executiveSummary}"</p>

                    {analyzing === t.id ? <AtlasSpinner /> : (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => {
                          setAnalyzing(t.id);
                          setTimeout(() => { setAnalyzing(null); toast.success("Dictamen regenerado por ATLAS"); }, 1500);
                        }}>Regenerar dictamen</Button>
                        <Button size="sm" variant="outline" onClick={() => toast.success("Enviado a L&D")}>Enviar a L&D</Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

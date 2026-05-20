import { createFileRoute } from "@tanstack/react-router";
import { useAtlas } from "@/store/atlasStore";
import { PageHeader } from "@/components/atlas/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, AtlasSpinner } from "@/components/atlas/AtlasUI";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

const STAGES = ["requisitos", "evaluacion", "revision-ld", "aprobacion-manager", "excepcion-ceo", "aprobado"] as const;

export const Route = createFileRoute("/_app/transiciones")({
  component: Transiciones,
});

function Transiciones() {
  const { transitions, employees } = useAtlas();
  const [analyzing, setAnalyzing] = useState<string | null>(null);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader title="Transiciones de Seniority" />
      <div className="space-y-4">
        {transitions.map((t) => {
          const emp = employees.find((e) => e.id === t.employeeId);
          const stageIdx = STAGES.indexOf(t.stage as typeof STAGES[number]);
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
                  {STAGES.slice(0, 5).map((s, i) => (
                    <div key={s} className="flex items-center gap-1">
                      <div className={`h-7 px-2 rounded text-[10px] flex items-center whitespace-nowrap ${i <= stageIdx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        {s}
                      </div>
                      {i < 4 && <div className={`h-px w-4 ${i < stageIdx ? "bg-primary" : "bg-border"}`} />}
                    </div>
                  ))}
                </div>

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
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

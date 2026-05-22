import { createFileRoute } from "@tanstack/react-router";
import { useAtlas, useCurrentUser } from "@/store/atlasStore";
import { PageHeader } from "@/components/atlas/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { CompetencyLevelDots, SeniorityBadge, EmptyState } from "@/components/atlas/AtlasUI";
import { useMemo, useState } from "react";
import { Search, X, Plus, Users, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/competencias")({
  component: Competencias,
});

function Competencias() {
  const competencies = useAtlas((s) => s.competencies);
  const employees = useAtlas((s) => s.employees);
  const assessments = useAtlas((s) => s.assessments);
  const me = useCurrentUser();
  const canSearch = me && (me.appRole === "leader" || me.appRole === "manager" || me.appRole === "ld_admin");

  const [q, setQ] = useState("");
  const [dom, setDom] = useState<string>("all");
  const filtered = competencies.filter((c) =>
    (dom === "all" || c.domain === dom) &&
    (q === "" || c.name.toLowerCase().includes(q.toLowerCase()))
  );

  // ------- Búsqueda por competencias -------
  const [criteria, setCriteria] = useState<{ competencyId: string; minLevel: number }[]>([]);
  const [mode, setMode] = useState<"AND" | "OR">("AND");
  const [pickerId, setPickerId] = useState<string>("");
  const [pickerLevel, setPickerLevel] = useState<number>(3);

  const addCriterion = () => {
    if (!pickerId) return;
    if (criteria.some((c) => c.competencyId === pickerId)) return;
    setCriteria([...criteria, { competencyId: pickerId, minLevel: pickerLevel }]);
    setPickerId("");
  };

  const results = useMemo(() => {
    if (criteria.length === 0) return [];
    return employees
      .map((emp) => {
        const a = assessments.find((x) => x.employeeId === emp.id);
        const levels = criteria.map((c) => {
          const cs = a?.competencies.find((cc) => cc.competencyId === c.competencyId);
          const score = cs?.averageScore ?? 0;
          return { competencyId: c.competencyId, score, meets: score >= c.minLevel };
        });
        const meetsAll = levels.every((l) => l.meets);
        const meetsAny = levels.some((l) => l.meets);
        const passes = mode === "AND" ? meetsAll : meetsAny;
        return { emp, levels, passes };
      })
      .filter((r) => r.passes);
  }, [criteria, mode, employees, assessments]);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader title="Catálogo de competencias" subtitle={`${competencies.length} competencias`} />

      {canSearch && (
        <Card className="bg-surface/60 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-display">
              <Search className="h-4 w-4 text-primary" /> Búsqueda por competencias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex-1 min-w-[220px]">
                <label className="text-xs text-muted-foreground">Competencia</label>
                <select
                  value={pickerId}
                  onChange={(e) => setPickerId(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm"
                >
                  <option value="">Seleccionar…</option>
                  {competencies
                    .filter((c) => !criteria.some((cr) => cr.competencyId === c.id))
                    .map((c) => (
                      <option key={c.id} value={c.id}>{c.domain} · {c.name}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Nivel mínimo</label>
                <select
                  value={pickerLevel}
                  onChange={(e) => setPickerLevel(Number(e.target.value))}
                  className="mt-1 h-9 rounded-md border border-border bg-surface px-3 text-sm"
                >
                  {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <Button onClick={addCriterion} disabled={!pickerId} size="sm">
                <Plus className="h-4 w-4 mr-1" /> Agregar
              </Button>
              <div className="ml-auto flex items-center gap-2 rounded-md border border-border bg-surface p-1">
                <button
                  onClick={() => setMode("AND")}
                  className={`px-3 py-1 text-xs rounded ${mode === "AND" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                  Cumplen TODAS (AND)
                </button>
                <button
                  onClick={() => setMode("OR")}
                  className={`px-3 py-1 text-xs rounded ${mode === "OR" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                  Al menos UNA (OR)
                </button>
              </div>
            </div>

            {criteria.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {criteria.map((c) => {
                  const comp = competencies.find((x) => x.id === c.competencyId);
                  return (
                    <Badge key={c.competencyId} variant="secondary" className="gap-1.5 pr-1">
                      <span>{comp?.name} · ≥ {c.minLevel}</span>
                      <button
                        onClick={() => setCriteria(criteria.filter((x) => x.competencyId !== c.competencyId))}
                        className="rounded-sm hover:bg-muted p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}

            {criteria.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Agregá competencias para buscar"
                message="Seleccioná una o más competencias y un nivel mínimo. Los resultados aparecerán acá."
              />
            ) : results.length === 0 ? (
              <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Ningún colaborador cumple las condiciones.
              </div>
            ) : (
              <div className="overflow-auto rounded-md border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-surface text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="text-left p-2">Colaborador</th>
                      <th className="text-left p-2">Rol</th>
                      <th className="text-left p-2">Seniority</th>
                      {criteria.map((c) => {
                        const comp = competencies.find((x) => x.id === c.competencyId);
                        return <th key={c.competencyId} className="text-left p-2">{comp?.name}</th>;
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map(({ emp, levels }) => (
                      <tr key={emp.id} className="border-t border-border/40">
                        <td className="p-2 font-medium">{emp.name}</td>
                        <td className="p-2 text-muted-foreground">{emp.role}</td>
                        <td className="p-2"><SeniorityBadge value={emp.seniority} /></td>
                        {levels.map((l) => (
                          <td key={l.competencyId} className="p-2">
                            <div className="flex items-center gap-2">
                              <CompetencyLevelDots value={Math.round(l.score)} />
                              <span className={`text-xs font-mono ${l.meets ? "text-success" : "text-muted-foreground"}`}>
                                {l.score.toFixed(1)}
                              </span>
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border bg-surface/60">
                  {results.length} colaborador(es) · modo {mode}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar..." className="max-w-md bg-surface/60" />
        <select value={dom} onChange={(e) => setDom(e.target.value)} className="h-9 rounded-md border border-border bg-surface/60 px-3 text-sm">
          <option value="all">Todos los dominios</option>
          <option value="Técnica">Técnica</option>
          <option value="Soft">Soft</option>
        </select>
      </div>
      <Card className="bg-surface/60 border-border">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-surface text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-3">Dominio</th>
                <th className="text-left p-3">Nombre</th>
                <th className="text-left p-3">Stack</th>
                <th className="text-left p-3">Descripción</th>
                <th className="text-left p-3">T</th><th>J</th><th>SS</th><th>S</th><th>TL</th><th>A</th><th>M</th><th>D</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-border/40">
                  <td className="p-3"><span className={`rounded px-1.5 py-0.5 text-[10px] ${c.domain === "Técnica" ? "bg-primary/15 text-primary" : "bg-violet-500/15 text-violet-300"}`}>{c.domain}</span></td>
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3 text-xs text-muted-foreground">{c.stack ?? "—"}</td>
                  <td className="p-3 text-xs text-muted-foreground max-w-xs">{c.description}</td>
                  {(["Trainee","Junior","Semi-Senior","Senior","Tech Lead","Architect","Manager","Director"] as const).map((s) => (
                    <td key={s} className="p-2"><CompetencyLevelDots value={c.expectedLevelBySeniority[s]} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

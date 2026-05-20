import { createFileRoute } from "@tanstack/react-router";
import { useAtlas } from "@/store/atlasStore";
import { PageHeader } from "@/components/atlas/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { CompetencyLevelDots } from "@/components/atlas/AtlasUI";
import { useState } from "react";

export const Route = createFileRoute("/_app/matriz-roles")({
  component: Matriz,
});

const SENIORITIES = ["Trainee","Junior","Semi-Senior","Senior","Tech Lead","Architect","Manager","Director"] as const;

function Matriz() {
  const competencies = useAtlas((s) => s.competencies);
  const [dom, setDom] = useState<string>("all");
  const filtered = competencies.filter((c) => dom === "all" || c.domain === dom);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader title="Matriz de roles" subtitle="Niveles esperados por seniority" />
      <select value={dom} onChange={(e) => setDom(e.target.value)} className="h-9 rounded-md border border-border bg-surface/60 px-3 text-sm">
        <option value="all">Todos</option>
        <option value="Técnica">Técnica</option>
        <option value="Soft">Soft</option>
      </select>
      <Card className="bg-surface/60 border-border">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-3 sticky left-0 bg-surface">Competencia</th>
                {SENIORITIES.map((s) => <th key={s} className="p-2 text-center">{s.slice(0, 3)}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-border/40">
                  <td className="p-3 sticky left-0 bg-surface/80 font-medium">{c.name}</td>
                  {SENIORITIES.map((s) => (
                    <td key={s} className="p-2 text-center"><div className="inline-block"><CompetencyLevelDots value={c.expectedLevelBySeniority[s]} /></div></td>
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

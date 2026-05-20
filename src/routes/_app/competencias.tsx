import { createFileRoute } from "@tanstack/react-router";
import { useAtlas } from "@/store/atlasStore";
import { PageHeader } from "@/components/atlas/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CompetencyLevelDots } from "@/components/atlas/AtlasUI";
import { useState } from "react";

export const Route = createFileRoute("/_app/competencias")({
  component: Competencias,
});

function Competencias() {
  const competencies = useAtlas((s) => s.competencies);
  const [q, setQ] = useState("");
  const [dom, setDom] = useState<string>("all");
  const filtered = competencies.filter((c) =>
    (dom === "all" || c.domain === dom) &&
    (q === "" || c.name.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader title="Catálogo de competencias" subtitle={`${competencies.length} competencias`} />
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

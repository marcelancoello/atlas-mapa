import { createFileRoute } from "@tanstack/react-router";
import { useAtlas } from "@/store/atlasStore";
import { PageHeader } from "@/components/atlas/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, AtlasSpinner } from "@/components/atlas/AtlasUI";
import { ClipboardCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/assessments")({
  component: Assessments,
});

function Assessments() {
  const { assessments, employees } = useAtlas();
  const [busy, setBusy] = useState(false);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Assessments 360°"
        subtitle={`${assessments.length} assessments registrados`}
        actions={
          <Button onClick={() => {
            setBusy(true);
            setTimeout(() => { setBusy(false); toast.success("Assessment iniciado (demo)"); }, 1500);
          }}>
            <ClipboardCheck className="h-4 w-4 mr-1" />Nuevo assessment
          </Button>
        }
      />
      {busy && <AtlasSpinner />}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assessments.map((a) => {
          const emp = employees.find((e) => e.id === a.employeeId);
          const critical = a.competencies.filter((c) => c.gapSeverity === "critical").length;
          return (
            <Card key={a.id} className="bg-surface/60 border-border">
              <CardContent className="p-5 space-y-2">
                <div className="flex justify-between">
                  <div>
                    <div className="font-display font-semibold">{emp?.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">{a.type} · {new Date(a.date).toLocaleDateString()}</div>
                  </div>
                  <StatusBadge value={a.status} />
                </div>
                <div className="flex justify-between items-end pt-2 border-t border-border/40">
                  <div>
                    <div className="text-xs text-muted-foreground">Readiness</div>
                    <div className="font-display text-2xl">{a.readinessScore}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Gaps críticos</div>
                    <div className={`font-display text-xl ${critical > 0 ? "text-danger" : ""}`}>{critical}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

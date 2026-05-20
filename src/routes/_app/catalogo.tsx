import { createFileRoute } from "@tanstack/react-router";
import { useAtlas, useCurrentUser } from "@/store/atlasStore";
import { PageHeader } from "@/components/atlas/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/catalogo")({
  component: Catalogo,
});

function Catalogo() {
  const user = useCurrentUser()!;
  const { courses, requestCourse, courseRequests, approveCourseRequest, rejectCourseRequest, employees } = useAtlas();
  const [q, setQ] = useState("");
  const [type, setType] = useState<string>("all");

  const filtered = courses.filter((c) =>
    (type === "all" || c.type === type) &&
    (q === "" || c.title.toLowerCase().includes(q.toLowerCase()))
  );

  const canApprove = user.appRole !== "employee";
  const pending = courseRequests.filter((r) => r.status === "pendiente");

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader title="Catálogo de formaciones" subtitle={`${courses.length} cursos disponibles`} />

      <div className="flex flex-wrap gap-3">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar curso..." className="max-w-md bg-surface/60" />
        <select value={type} onChange={(e) => setType(e.target.value)} className="h-9 rounded-md border border-border bg-surface/60 px-3 text-sm">
          <option value="all">Todos los tipos</option>
          <option value="Interno">Interno</option>
          <option value="Externo">Externo</option>
        </select>
      </div>

      {canApprove && pending.length > 0 && (
        <Card className="bg-warning/5 border-warning/30">
          <CardContent className="p-4">
            <h3 className="font-display font-semibold mb-3">Solicitudes pendientes ({pending.length})</h3>
            <div className="space-y-2">
              {pending.map((r) => {
                const emp = employees.find((e) => e.id === r.employeeId);
                const course = courses.find((c) => c.id === r.courseId);
                return (
                  <div key={r.id} className="flex items-center justify-between rounded-md border border-border bg-background/40 p-3">
                    <div>
                      <div className="text-sm font-medium">{emp?.name} solicitó "{course?.title}"</div>
                      <div className="text-xs text-muted-foreground">{new Date(r.requestedAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => { approveCourseRequest(r.id, user.name); toast.success("Solicitud aprobada"); }}>Aprobar</Button>
                      <Button size="sm" variant="outline" onClick={() => { rejectCourseRequest(r.id, user.name); toast("Solicitud rechazada"); }}>Rechazar</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <Card key={c.id} className="bg-surface/60 border-border hover:border-primary/50 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className={`rounded px-1.5 py-0.5 text-[10px] ${c.type === "Interno" ? "bg-primary/15 text-primary" : "bg-violet-500/15 text-violet-300"}`}>{c.type}</span>
                <span className="text-xs text-muted-foreground">{c.level}</span>
              </div>
              <h3 className="font-display font-semibold leading-tight">{c.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{c.platform} · {c.durationHours}h</p>
              <Button
                size="sm" className="mt-4 w-full"
                onClick={() => { requestCourse(user.id, c.id); toast.success("Solicitud enviada"); }}
              >
                Pedir este curso
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

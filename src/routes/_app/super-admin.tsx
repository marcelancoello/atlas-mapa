import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "@/store/atlasStore";
import { PageHeader } from "@/components/atlas/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings2 } from "lucide-react";

export const Route = createFileRoute("/_app/super-admin")({
  component: SuperAdmin,
});

const TABS = [
  { value: "empleados", label: "Empleados" },
  { value: "competencias", label: "Competencias" },
  { value: "roles", label: "Roles por Practice" },
  { value: "cursos", label: "Cursos" },
  { value: "planes", label: "Planes Personalizados" },
];

function SuperAdmin() {
  const user = useCurrentUser();
  if (user?.appRole !== "super_admin") {
    return <div className="p-8 text-center text-muted-foreground">Acceso solo para Super Admin.</div>;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader title="Super Admin" subtitle="Configuración global del sistema ATLAS" />

      <Tabs defaultValue="empleados">
        <TabsList className="bg-surface/60 border border-border">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
          ))}
        </TabsList>
        {TABS.map((t) => (
          <TabsContent key={t.value} value={t.value} className="mt-4">
            <div className="rounded-xl border border-dashed border-border bg-surface/40 p-16 text-center">
              <div className="mx-auto h-12 w-12 rounded-xl bg-violet-600/20 text-violet-300 flex items-center justify-center mb-4">
                <Settings2 className="h-6 w-6" />
              </div>
              <div className="font-display font-semibold text-lg">{t.label}</div>
              <div className="text-sm text-muted-foreground mt-1">Próximamente</div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

import { createFileRoute, redirect } from "@tanstack/react-router";
import { useCurrentUser } from "@/store/atlasStore";
import { PageHeader } from "@/components/atlas/PageHeader";
import { SuccessionPanel } from "@/components/atlas/SuccessionPanel";

export const Route = createFileRoute("/_app/sucesion")({
  component: SucesionPage,
});

function SucesionPage() {
  const user = useCurrentUser();
  if (!user || (user.appRole !== "ld_admin" && user.appRole !== "super_admin")) {
    throw redirect({ to: "/dashboard" });
  }
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Planificación de Sucesión"
        subtitle="Roles clave, candidatos y readiness de la organización."
      />
      <SuccessionPanel />
    </div>
  );
}

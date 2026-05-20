import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAtlas } from "@/store/atlasStore";
import { Avatar } from "@/components/atlas/AtlasUI";
import { employees as seedEmployees } from "@/data/mockData";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  component: Login,
});

const ROLE_BADGE: Record<string, string> = {
  ld_admin: "bg-primary/20 text-primary border-primary/40",
  manager: "bg-pink-500/20 text-pink-300 border-pink-500/40",
  leader: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  employee: "bg-slate-500/20 text-slate-300 border-slate-500/40",
};
const ROLE_LABEL: Record<string, string> = {
  ld_admin: "L&D Admin", manager: "Manager", leader: "Líder", employee: "Empleado",
};

function Login() {
  const { login, currentUserId } = useAtlas();
  const navigate = useNavigate();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  useEffect(() => {
    if (hydrated && currentUserId) navigate({ to: "/dashboard" });
  }, [hydrated, currentUserId, navigate]);

  const featured = seedEmployees.filter((e) =>
    ["u-1", "u-2", "u-3", "u-4", "u-5", "u-6"].includes(e.id)
  );

  return (
    <div className="min-h-screen flex items-center justify-center atlas-grid-bg p-6">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-12 atlas-fade-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center font-display font-bold text-primary-foreground text-3xl shadow-2xl shadow-primary/30">
              A
            </div>
            <span className="font-display text-5xl font-bold tracking-tight">ATLAS</span>
          </div>
          <p className="text-muted-foreground text-lg font-mono">Tu mapa de crecimiento profesional</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {featured.map((u, i) => (
            <button
              key={u.id}
              onClick={() => { login(u.id); navigate({ to: "/dashboard" }); }}
              style={{ animationDelay: `${i * 60}ms` }}
              className="group atlas-fade-in flex items-center gap-3 rounded-xl border border-border bg-surface/60 backdrop-blur p-4 text-left hover:border-primary/60 hover:bg-surface transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/10"
            >
              <Avatar name={u.name} size={44} />
              <div className="min-w-0">
                <div className="font-display font-semibold text-sm group-hover:text-primary transition-colors truncate">
                  {u.name}
                </div>
                <span className={`inline-flex mt-1 items-center rounded border px-1.5 py-0.5 text-[10px] font-medium ${ROLE_BADGE[u.appRole]}`}>
                  {ROLE_LABEL[u.appRole]}
                </span>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center mt-10 text-xs text-muted-foreground">
          Modo demo · Seleccioná un perfil para ingresar
        </p>
      </div>
    </div>
  );
}

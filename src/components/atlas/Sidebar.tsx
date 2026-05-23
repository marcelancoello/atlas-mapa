import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, BookOpen, ClipboardCheck, GraduationCap,
  Library, TrendingUp, Map, ShieldCheck, User, Bell, LogOut, Settings2,
} from "lucide-react";
import { useAtlas, useCurrentUser } from "@/store/atlasStore";
import { Avatar } from "@/components/atlas/AtlasUI";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { UserRole } from "@/types";

const NAV: Array<{ icon: typeof LayoutDashboard; label: string; to: string; roles: UserRole[]; separatorBefore?: boolean }> = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard", roles: ["leader", "manager", "ld_admin", "super_admin"] },
  { icon: Users, label: "Empleados", to: "/empleados", roles: ["leader", "manager", "ld_admin", "super_admin"] },
  { icon: BookOpen, label: "Competencias", to: "/competencias", roles: ["employee", "leader", "manager", "ld_admin", "super_admin"] },
  { icon: ClipboardCheck, label: "Assessments", to: "/assessments", roles: ["leader", "manager", "ld_admin", "super_admin"] },
  { icon: GraduationCap, label: "Planes", to: "/planes", roles: ["leader", "manager", "ld_admin", "super_admin"] },
  { icon: Library, label: "Catálogo", to: "/catalogo", roles: ["employee", "leader", "manager", "ld_admin", "super_admin"] },
  { icon: TrendingUp, label: "Transiciones", to: "/transiciones", roles: ["leader", "manager", "ld_admin", "super_admin"] },
  { icon: Map, label: "Matriz de roles", to: "/matriz-roles", roles: ["employee", "leader", "manager", "ld_admin", "super_admin"] },
  { icon: ShieldCheck, label: "L&D Admin", to: "/ld-admin", roles: ["ld_admin", "super_admin"] },
  { icon: Settings2, label: "Super Admin", to: "/super-admin", roles: ["super_admin"], separatorBefore: true },
  { icon: User, label: "Mi perfil", to: "/mi-perfil", roles: ["employee", "leader", "manager", "ld_admin", "super_admin"] },
];

const ROLE_LABEL: Record<UserRole, string> = {
  employee: "Empleado", leader: "Líder", manager: "Manager", ld_admin: "L&D Admin", super_admin: "SA",
};
const ROLE_TONE: Record<UserRole, string> = {
  employee: "bg-slate-500/20 text-slate-300",
  leader: "bg-emerald-500/20 text-emerald-300",
  manager: "bg-pink-500/20 text-pink-300",
  ld_admin: "bg-primary/20 text-primary",
  super_admin: "bg-violet-600/30 text-violet-300",
};

export function Sidebar() {
  const user = useCurrentUser();
  const { logout, notifications, markAllRead } = useAtlas();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [openBell, setOpenBell] = useState(false);
  if (!user) return null;

  const unread = notifications.filter((n) => n.userId === user.id && !n.read);
  const visible = NAV.filter((n) => n.roles.includes(user.appRole));

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex items-center gap-2 px-5 pt-6 pb-5">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center font-display font-bold text-primary-foreground text-lg shadow-lg shadow-primary/20">
          A
        </div>
        <div>
          <div className="font-display font-bold leading-none">ATLAS</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Mapa de crecimiento</div>
        </div>
      </div>
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {visible.map((item) => {
          const active = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
          return (
            <div key={item.to}>
              {item.separatorBefore && <div className="my-2 border-t border-sidebar-border/70" />}
              <Link
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </div>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3 relative">
        <div className="flex items-center gap-3 rounded-md p-2 hover:bg-sidebar-accent/40">
          <Avatar name={user.name} size={36} />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">{user.name}</div>
            <span className={cn("inline-block mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium", ROLE_TONE[user.appRole])}>
              {ROLE_LABEL[user.appRole]}
            </span>
          </div>
          <button
            onClick={() => setOpenBell((v) => !v)}
            className="relative rounded-md p-1.5 hover:bg-sidebar-accent text-muted-foreground hover:text-foreground"
            title="Notificaciones"
          >
            <Bell className="h-4 w-4" />
            {unread.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-danger text-[10px] font-bold text-white px-1 flex items-center justify-center">
                {unread.length}
              </span>
            )}
          </button>
          <button onClick={logout} title="Cerrar sesión" className="rounded-md p-1.5 hover:bg-sidebar-accent text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        {openBell && (
          <div className="absolute bottom-20 left-3 right-3 z-50 rounded-lg border border-border bg-popover shadow-2xl shadow-black/40 atlas-fade-in">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
              <span className="text-sm font-semibold">Notificaciones</span>
              {unread.length > 0 && (
                <button onClick={() => markAllRead(user.id)} className="text-xs text-primary hover:underline">
                  Marcar todas
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.filter((n) => n.userId === user.id).length === 0 && (
                <div className="p-4 text-center text-xs text-muted-foreground">Sin notificaciones</div>
              )}
              {notifications.filter((n) => n.userId === user.id).map((n) => (
                <div key={n.id} className={cn("px-3 py-2 border-b border-border/50 last:border-0", !n.read && "bg-primary/5")}>
                  <div className="text-sm font-medium">{n.title}</div>
                  <div className="text-xs text-muted-foreground">{n.message}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

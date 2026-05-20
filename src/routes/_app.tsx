import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Sidebar } from "@/components/atlas/Sidebar";
import { useAtlas } from "@/store/atlasStore";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const [hydrated, setHydrated] = useState(false);
  const currentUserId = useAtlas((s) => s.currentUserId);

  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    if (hydrated && !currentUserId) {
      // client-side redirect after hydration
      window.location.href = "/";
    }
  }, [hydrated, currentUserId]);

  if (!hydrated) return null;
  if (!currentUserId) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0 atlas-fade-in">
        <Outlet />
      </main>
    </div>
  );
}

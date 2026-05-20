import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useCurrentUser } from "@/store/atlasStore";

export const Route = createFileRoute("/_app/mi-perfil")({
  component: MiPerfil,
});

function MiPerfil() {
  const user = useCurrentUser();
  const navigate = useNavigate();
  useEffect(() => {
    if (user) navigate({ to: "/empleados/$id", params: { id: user.id } });
  }, [user, navigate]);
  return null;
}

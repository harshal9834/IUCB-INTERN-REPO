import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/credentials")({
  beforeLoad: ({ location }) => {
    if (
      location.pathname === "/admin/credentials" ||
      location.pathname === "/admin/credentials/"
    ) {
      throw redirect({ to: "/admin/credentials/generated" });
    }
  },
  component: () => <Outlet />,
});

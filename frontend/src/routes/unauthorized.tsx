import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

export const Route = createFileRoute("/unauthorized")({
  component: UnauthorizedComponent,
});

function UnauthorizedComponent() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-200 mb-6">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
        403 - Access Denied
      </h1>
      <p className="text-lg text-slate-600 max-w-md mb-8">
        You do not possess the required administrative clearance to access this system resource.
        Sessions are logged.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Button
          onClick={() => navigate({ to: "/admin/login" })}
          className="bg-[#0F2942] text-white hover:bg-[#1a446c]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Go to Login
        </Button>
        <Button
          onClick={() => navigate({ to: "/" })}
          variant="outline"
          className="border-slate-300 text-slate-700 hover:bg-slate-100"
        >
          <Home className="mr-2 h-4 w-4" /> Public Home
        </Button>
      </div>
    </div>
  );
}

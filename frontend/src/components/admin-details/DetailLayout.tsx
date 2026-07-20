import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

interface DetailLayoutProps {
  children: React.ReactNode;
  backTo: string;
  backLabel: string;
}

export function DetailLayout({ children, backTo, backLabel }: DetailLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pb-12 max-w-[1600px] mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center gap-4 text-sm text-slate-500">
        <button 
          onClick={() => navigate({ to: backTo as any })}
          className="flex items-center hover:text-[#0F2942] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> {backLabel}
        </button>
      </div>

      {children}
    </div>
  );
}

export function DetailContent({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-10 gap-6">
      {/* LEFT COLUMN (70%) */}
      <div className="xl:col-span-7 space-y-6">
        {left}
      </div>

      {/* RIGHT COLUMN (30%) */}
      <div className="xl:col-span-3 space-y-6">
        {right}
      </div>
    </div>
  );
}

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function SectionCard({ title, icon, children, action }: SectionCardProps) {
  return (
    <Card>
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-lg text-[#0F2942] flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        {action && (
          <div className="flex items-center">
            {action}
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        {children}
      </CardContent>
    </Card>
  );
}

export function DataField({ label, value, fullWidth = false, children }: { label: string, value?: React.ReactNode, fullWidth?: boolean, children?: React.ReactNode }) {
  return (
    <div className={fullWidth ? "md:col-span-full" : ""}>
      <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">{label}</p>
      {children ? children : (
        <p className="font-medium text-slate-900">{value}</p>
      )}
    </div>
  );
}

export function DataGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-4">
      {children}
    </div>
  );
}

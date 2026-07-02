import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "../../lib/utils";
import { Database, Globe, Lock, Mail, HardDrive, RefreshCw } from "lucide-react";

export type HealthStatus = "operational" | "degraded" | "down";

export interface HealthIndicator {
  name: string;
  status: HealthStatus;
  uptime: string;
  lastChecked: Date;
  icon: React.ReactNode;
}

const healthColors: Record<HealthStatus, string> = {
  operational: "bg-emerald-50 text-emerald-700 border-emerald-200",
  degraded: "bg-amber-50 text-amber-700 border-amber-200",
  down: "bg-red-50 text-red-700 border-red-200",
};

const healthDots: Record<HealthStatus, string> = {
  operational: "bg-emerald-500",
  degraded: "bg-amber-500",
  down: "bg-red-500",
};

interface SystemHealthProps {
  indicators: HealthIndicator[];
  isLoading?: boolean;
}

export const SystemHealth: React.FC<SystemHealthProps> = ({ indicators, isLoading = false }) => {
  const operationalCount = indicators.filter((i) => i.status === "operational").length;
  const overallHealth =
    operationalCount === indicators.length
      ? "operational"
      : operationalCount >= indicators.length * 0.75
        ? "degraded"
        : "down";

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">System Health</CardTitle>
          <div className="flex items-center gap-2">
            <div className={cn("h-2 w-2 rounded-full animate-pulse", healthDots[overallHealth])} />
            <span className="text-xs font-semibold text-slate-600 capitalize">
              {overallHealth === "operational"
                ? "All Systems Operational"
                : overallHealth === "degraded"
                  ? "Degraded Performance"
                  : "System Issues"}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {indicators.map((indicator) => (
              <div
                key={indicator.name}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  healthColors[indicator.status],
                )}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="flex-shrink-0 h-5 w-5 flex items-center justify-center">
                    {indicator.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold">{indicator.name}</p>
                    <p className="text-xs opacity-75">{indicator.uptime}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    "text-xs font-bold px-2 py-1 rounded",
                    healthColors[indicator.status],
                  )}
                >
                  {indicator.status === "operational" ? "✓" : "!"}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

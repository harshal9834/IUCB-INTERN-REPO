import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { cn } from "../lib/utils";

// 1. PageHeader
interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, action }) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-100">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#0F2942]">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-slate-500">{description}</p>}
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  );
};

// 2. MetricCard
interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string | number;
    isPositive?: boolean;
  };
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  className,
}) => {
  return (
    <Card
      className={cn(
        "border-slate-150 shadow-sm hover:shadow-md transition-shadow duration-200",
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </CardTitle>
        {icon && <div className="text-[#D4AF37] bg-amber-50 p-2 rounded-lg">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-[#0F2942]">{value}</div>
        {(description || trend) && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={cn(
                  "font-semibold px-1.5 py-0.5 rounded",
                  trend.isPositive ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50",
                )}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}
              </span>
            )}
            {description && <span className="text-slate-500">{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// 3. StatusBadge
interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const norm = status.toUpperCase();

  const getStyle = () => {
    switch (norm) {
      case "ACTIVE":
      case "APPROVED":
      case "VALID":
      case "SUCCESS":
        return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "PENDING":
      case "WARNING":
      case "ASSOCIATE":
        return "text-amber-700 bg-amber-50 border-amber-200";
      case "SUSPENDED":
      case "REJECTED":
      case "REVOKED":
      case "EXPIRED":
      case "FAILED":
      case "ERROR":
        return "text-rose-700 bg-rose-50 border-rose-200";
      default:
        return "text-slate-700 bg-slate-50 border-slate-200";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold select-none",
        getStyle(),
        className,
      )}
    >
      {status}
    </span>
  );
};

// 4. EmptyState
interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon, action }) => {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-250 bg-white p-8 text-center shadow-sm">
      {icon && (
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-[#0F2942]">{title}</h3>
      <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

// 5. LoadingSkeleton
export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-slate-100">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-72 animate-pulse rounded bg-slate-150" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-slate-150">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
              <div className="h-8 w-8 animate-pulse rounded bg-slate-200" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-8 w-16 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-32 animate-pulse rounded bg-slate-150" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="h-[300px] w-full animate-pulse rounded-xl bg-slate-150" />
    </div>
  );
};

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "../../lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface MetricCardProps {
  title: string;
  value: number | string;
  subValue?: string;
  description?: string;
  icon: React.ReactNode;
  iconBg: string;
  trendLabel?: string;
  trendPositive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subValue,
  description,
  icon,
  iconBg,
  trendLabel,
  trendPositive,
  onClick,
  className,
}) => {
  return (
    <Card
      className={cn(
        "border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5",
        onClick && "cursor-pointer",
        className,
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </CardTitle>
        </div>
        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", iconBg)}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-3xl font-bold text-slate-900">{value.toLocaleString?.() || value}</div>
        {subValue && <p className="text-xs text-slate-500">{subValue}</p>}
        {description && <p className="text-xs text-slate-600">{description}</p>}
        {trendLabel && (
          <div
            className={cn(
              "inline-flex items-center gap-1 text-xs font-semibold mt-2 px-2 py-1 rounded-md",
              trendPositive ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50",
            )}
          >
            {trendPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {trendLabel}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

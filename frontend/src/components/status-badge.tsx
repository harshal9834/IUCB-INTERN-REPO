import React from "react";
import { cn } from "../lib/utils";

type StatusVariant =
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "REVOKED"
  | "EXPIRED"
  | "VALID"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "ASSOCIATE"
  | "SENIOR"
  | "LEAD";

const variantStyles: Record<StatusVariant, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  INACTIVE: "bg-slate-50 text-slate-600 border-slate-200",
  SUSPENDED: "bg-amber-50 text-amber-700 border-amber-200",
  REVOKED: "bg-red-50 text-red-700 border-red-200",
  EXPIRED: "bg-orange-50 text-orange-700 border-orange-200",
  VALID: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING: "bg-blue-50 text-blue-700 border-blue-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  ASSOCIATE: "bg-slate-50 text-slate-700 border-slate-200",
  SENIOR: "bg-violet-50 text-violet-700 border-violet-200",
  LEAD: "bg-[#0F2942]/10 text-[#0F2942] border-[#0F2942]/20",
};

const dotStyles: Record<StatusVariant, string> = {
  ACTIVE: "bg-emerald-500",
  INACTIVE: "bg-slate-400",
  SUSPENDED: "bg-amber-500",
  REVOKED: "bg-red-500",
  EXPIRED: "bg-orange-500",
  VALID: "bg-emerald-500",
  PENDING: "bg-blue-500",
  APPROVED: "bg-emerald-500",
  REJECTED: "bg-red-500",
  ASSOCIATE: "bg-slate-400",
  SENIOR: "bg-violet-500",
  LEAD: "bg-[#0F2942]",
};

interface StatusBadgeProps {
  status: string;
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({ status, showDot = true, className }: StatusBadgeProps) {
  const variant = status as StatusVariant;
  const styles = variantStyles[variant] ?? "bg-slate-50 text-slate-600 border-slate-200";
  const dot = dotStyles[variant] ?? "bg-slate-400";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        styles,
        className,
      )}
    >
      {showDot && <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />}
      {status}
    </span>
  );
}

export default StatusBadge;

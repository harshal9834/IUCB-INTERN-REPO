import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Link } from "@tanstack/react-router";
import { cn } from "../../lib/utils";
import { ArrowRight } from "lucide-react";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  iconColor: string;
  borderColor: string;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  icon,
  href,
  iconColor,
  borderColor,
}) => {
  return (
    <Link to={href as never}>
      <Card
        className={cn(
          "border-l-4 bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer",
          borderColor,
        )}
      >
        <CardHeader className="flex flex-row items-start justify-between pb-3">
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900">{title}</CardTitle>
            <p className="text-xs text-slate-500 mt-1">{description}</p>
          </div>
          <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", iconColor)}>
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
            Go to page <ArrowRight className="h-3 w-3" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

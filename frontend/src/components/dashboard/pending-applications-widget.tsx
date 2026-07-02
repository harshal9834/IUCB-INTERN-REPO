import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { StatusBadge } from "../reusable-components";
import { ArrowRight, Calendar } from "lucide-react";
import { Link } from "@tanstack/react-router";

export interface PendingApplication {
  id: string;
  applicantName: string;
  type: string;
  status: string;
  submittedDate: Date;
}

interface PendingApplicationsWidgetProps {
  applications: PendingApplication[];
  isLoading?: boolean;
}

export const PendingApplicationsWidget: React.FC<PendingApplicationsWidgetProps> = ({
  applications,
  isLoading = false,
}) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base">Pending Applications</CardTitle>
        <Link
          to="/admin/applications"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          View All →
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500">No pending applications</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {applications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{app.applicantName}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-slate-500">{app.type}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(app.submittedDate)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <StatusBadge status={app.status} />
                  <ArrowRight className="h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-600" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

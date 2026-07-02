import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Award, Building2, Users, FileCheck, CheckCircle, Bell } from "lucide-react";
import { cn } from "../../lib/utils";

export interface ActivityItem {
  id: string;
  type: "credential" | "organization" | "auditor" | "application" | "approval" | "news";
  title: string;
  description: string;
  timestamp: Date;
  icon: React.ReactNode;
  color: string;
}

const activityIcons: Record<string, React.ReactNode> = {
  credential: <Award className="h-4 w-4" />,
  organization: <Building2 className="h-4 w-4" />,
  auditor: <Users className="h-4 w-4" />,
  application: <FileCheck className="h-4 w-4" />,
  approval: <CheckCircle className="h-4 w-4" />,
  news: <Bell className="h-4 w-4" />,
};

const activityColors: Record<string, string> = {
  credential: "bg-emerald-50 text-emerald-700 border-emerald-200",
  organization: "bg-blue-50 text-blue-700 border-blue-200",
  auditor: "bg-violet-50 text-violet-700 border-violet-200",
  application: "bg-amber-50 text-amber-700 border-amber-200",
  approval: "bg-green-50 text-green-700 border-green-200",
  news: "bg-slate-50 text-slate-700 border-slate-200",
};

interface ActivityTimelineProps {
  activities: ActivityItem[];
  isLoading?: boolean;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  isLoading = false,
}) => {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return new Date(date).toLocaleDateString();
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, idx) => (
              <div
                key={activity.id}
                className="flex gap-4 pb-4"
                style={{
                  borderBottom: idx < activities.length - 1 ? "1px solid #e2e8f0" : "none",
                }}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
                    activityColors[activity.type],
                  )}
                >
                  {activityIcons[activity.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{activity.description}</p>
                  <p className="text-xs text-slate-400 mt-1">{formatTime(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

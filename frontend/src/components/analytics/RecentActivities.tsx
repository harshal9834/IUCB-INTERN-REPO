import { RecentActivitiesResponse } from "../../types/analytics";
import { Clock, Activity, FileText, Award } from "lucide-react";

interface RecentActivitiesProps {
  data?: RecentActivitiesResponse;
}

export function RecentActivities({ data }: RecentActivitiesProps) {
  if (!data || data.activities.length === 0) {
    return <div className="text-center p-8 text-muted-foreground">No recent activities available.</div>;
  }

  const getIcon = (type: string) => {
    switch(type) {
      case 'AUDIT_LOG': return <Activity className="h-4 w-4 text-blue-500" />;
      case 'APPLICATION': return <FileText className="h-4 w-4 text-orange-500" />;
      case 'CREDENTIAL': return <Award className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-card rounded-xl border shadow-sm mt-6 p-5">
      <h3 className="text-lg font-bold mb-4">Recent Activities</h3>
      <div className="space-y-4">
        {data.activities.map((activity, i) => (
          <div key={activity.id + i} className="flex items-start gap-4 p-3 hover:bg-muted/50 rounded-lg transition-colors">
            <div className="mt-1 bg-background p-2 rounded-full border shadow-sm">
              {getIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
              <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
            </div>
            <div className="text-xs text-muted-foreground whitespace-nowrap">
              {new Date(activity.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

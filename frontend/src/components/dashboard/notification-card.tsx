import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "../../lib/utils";
import { X, Bell, AlertTriangle, Info } from "lucide-react";

export type NotificationType = "info" | "warning" | "critical";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
}

const notificationStyles: Record<NotificationType, string> = {
  info: "bg-blue-50 border-blue-200 text-blue-900",
  warning: "bg-amber-50 border-amber-200 text-amber-900",
  critical: "bg-red-50 border-red-200 text-red-900",
};

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  info: <Info className="h-4 w-4" />,
  warning: <AlertTriangle className="h-4 w-4" />,
  critical: <AlertTriangle className="h-4 w-4" />,
};

interface NotificationCardProps {
  notifications: Notification[];
  onDismiss?: (id: string) => void;
  isLoading?: boolean;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notifications,
  onDismiss,
  isLoading = false,
}) => {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-slate-600" />
          <CardTitle className="text-base">Admin Notifications</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500">No notifications</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-3 rounded-lg border flex items-start justify-between gap-3",
                  notificationStyles[notification.type],
                )}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 mt-0.5">{notificationIcons[notification.type]}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{notification.title}</p>
                    <p className="text-xs opacity-75 mt-0.5">{notification.message}</p>
                    <p className="text-xs opacity-60 mt-1">{formatTime(notification.timestamp)}</p>
                  </div>
                </div>
                {onDismiss && (
                  <button
                    onClick={() => onDismiss(notification.id)}
                    className="flex-shrink-0 p-1 hover:bg-white/30 rounded transition-colors"
                    aria-label="Dismiss notification"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

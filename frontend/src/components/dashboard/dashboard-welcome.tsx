import React from "react";
import { Card, CardContent } from "../ui/card";
import { Calendar, Clock } from "lucide-react";

interface DashboardWelcomeProps {
  adminName: string;
}

export const DashboardWelcome: React.FC<DashboardWelcomeProps> = ({ adminName }) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <Card className="border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {getGreeting()}, <span className="text-blue-600">{adminName}</span>
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Welcome to the IUCB Administration Dashboard. Here's your quick overview of the system
              status.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>{currentDate}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>{currentTime}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

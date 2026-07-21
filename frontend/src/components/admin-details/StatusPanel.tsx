import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { StatusBadge } from "../status-badge";
import { CheckCircle } from "lucide-react";

interface StatusPanelProps {
  memberStatus: string;
  applicationStatus?: string;
  profileCompletion: number;
}

export function StatusPanel({ memberStatus, applicationStatus, profileCompletion }: StatusPanelProps) {
  return (
    <Card className="border-t-4 border-t-[#D4AF37]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-[#0F2942]">System Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-sm font-medium text-slate-500">Member Status</span>
            <StatusBadge status={memberStatus} />
          </div>
          {applicationStatus && (
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-500">Application</span>
              <StatusBadge status={applicationStatus} />
            </div>
          )}
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-sm font-medium text-slate-500">Account Status</span>
            <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Active</span>
          </div>
          <div className="py-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-500">Profile Completion</span>
              <span className="text-sm font-bold text-[#0F2942]">{profileCompletion}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-[#D4AF37] h-2 rounded-full" style={{ width: `${profileCompletion}%` }}></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

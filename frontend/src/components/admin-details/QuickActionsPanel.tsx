import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Pencil, FileText, Send, ShieldAlert, XCircle, CheckCircle } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

interface QuickActionsPanelProps {
  status: string;
  onEditClick: () => void;
  onStatusChange: (status: string) => void;
  onEmailClick?: () => void;
  applicationId?: string;
}

export function QuickActionsPanel({ status, onEditClick, onStatusChange, onEmailClick, applicationId }: QuickActionsPanelProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-[#0F2942]">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button variant="outline" className="w-full justify-start text-left font-medium" onClick={onEditClick}>
          <Pencil className="w-4 h-4 mr-3 text-slate-400" /> Edit Profile
        </Button>
        {applicationId && (
          <Button variant="outline" className="w-full justify-start text-left font-medium" onClick={() => navigate({ to: `/admin/applications/${applicationId}` as any })}>
            <FileText className="w-4 h-4 mr-3 text-slate-400" /> View Application
          </Button>
        )}
        {onEmailClick && (
          <Button variant="outline" className="w-full justify-start text-left font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200" onClick={onEmailClick}>
            <Send className="w-4 h-4 mr-3" /> Send Email
          </Button>
        )}
        {status === "ACTIVE" ? (
          <>
            <Button variant="outline" className="w-full justify-start text-left font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200" onClick={() => onStatusChange("SUSPENDED")}>
              <ShieldAlert className="w-4 h-4 mr-3" /> Suspend
            </Button>
            <Button variant="outline" className="w-full justify-start text-left font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => onStatusChange("INACTIVE")}>
              <XCircle className="w-4 h-4 mr-3" /> Deactivate
            </Button>
          </>
        ) : (
          <Button variant="outline" className="w-full justify-start text-left font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200" onClick={() => onStatusChange("ACTIVE")}>
            <CheckCircle className="w-4 h-4 mr-3" /> Activate
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

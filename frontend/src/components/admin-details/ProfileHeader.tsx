import React from "react";
import { Card } from "../ui/card";
import { StatusBadge } from "../status-badge";
import { Briefcase, UserCheck, Mail, Phone, MapPin, Calendar, FileText, Pencil, ShieldAlert, XCircle, CheckCircle, Save, X } from "lucide-react";
import { Button } from "../ui/button";
import { Link, useNavigate } from "@tanstack/react-router";

interface ProfileHeaderProps {
  name: string;
  avatarText: string;
  status: string;
  subtitle: React.ReactNode;
  metadata: {
    id: string;
    email: string;
    phone: string;
    country: string;
    joinedDate: string;
    applicationId?: string;
    applicationNumber?: string;
  };
  actions: {
    isEditing: boolean;
    onEditClick: () => void;
    onCancelEdit: () => void;
    onSave: () => void;
    onStatusChange: (status: string) => void;
    isSaving?: boolean;
    viewApplicationTo?: string; // Route path or ID
  };
}

export function ProfileHeader({ name, avatarText, status, subtitle, metadata, actions }: ProfileHeaderProps) {
  const navigate = useNavigate();

  return (
    <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          <div className="flex items-center justify-center h-24 w-24 bg-[#0F2942] text-white rounded-2xl text-3xl font-bold shadow-md border-4 border-white shrink-0">
            {avatarText}
          </div>
          
          <div className="space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{name}</h1>
              <StatusBadge status={status} />
            </div>
            <p className="text-slate-600 font-medium text-lg flex items-center justify-center md:justify-start gap-2">
              {subtitle}
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-slate-500 mt-2">
              <span className="flex items-center gap-1.5"><UserCheck className="w-4 h-4" /> ID: {metadata.id}</span>
              <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {metadata.email}</span>
              <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {metadata.phone}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {metadata.country}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Joined: {metadata.joinedDate}</span>
              {metadata.applicationId && metadata.applicationNumber && (
                <Link to="/admin/applications/$id" params={{ id: metadata.applicationId }} className="flex items-center gap-1.5 text-blue-600 hover:underline">
                  <FileText className="w-4 h-4" /> App: {metadata.applicationNumber}
                </Link>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-200">
          {!actions.isEditing ? (
            <>
              <Button variant="outline" className="bg-white" onClick={actions.onEditClick}>
                <Pencil className="w-4 h-4 mr-2" /> Edit Profile
              </Button>
              {status === "ACTIVE" && (
                <>
                  <Button variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50 bg-white" onClick={() => actions.onStatusChange("SUSPENDED")}>
                    <ShieldAlert className="w-4 h-4 mr-2" /> Suspend
                  </Button>
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 bg-white" onClick={() => actions.onStatusChange("INACTIVE")}>
                    <XCircle className="w-4 h-4 mr-2" /> Deactivate
                  </Button>
                </>
              )}
              {status === "SUSPENDED" && (
                <>
                  <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50 bg-white" onClick={() => actions.onStatusChange("ACTIVE")}>
                    <CheckCircle className="w-4 h-4 mr-2" /> Activate
                  </Button>
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 bg-white" onClick={() => actions.onStatusChange("INACTIVE")}>
                    <XCircle className="w-4 h-4 mr-2" /> Deactivate
                  </Button>
                </>
              )}
              {(status === "INACTIVE" || status === "REVOKED") && (
                <>
                  <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50 bg-white" onClick={() => actions.onStatusChange("ACTIVE")}>
                    <CheckCircle className="w-4 h-4 mr-2" /> Activate
                  </Button>
                  <Button variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50 bg-white" onClick={() => actions.onStatusChange("SUSPENDED")}>
                    <ShieldAlert className="w-4 h-4 mr-2" /> Suspend
                  </Button>
                </>
              )}
              {metadata.applicationId && (
                <Button variant="default" className="bg-[#0F2942] text-white" onClick={() => navigate({ to: `/admin/applications/${metadata.applicationId}` as any })}>
                  <FileText className="w-4 h-4 mr-2" /> View Original Application
                </Button>
              )}
            </>
          ) : (
            <>
              <Button variant="outline" className="bg-white" onClick={actions.onCancelEdit}>
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button onClick={actions.onSave} className="bg-[#0F2942] text-white" disabled={actions.isSaving}>
                <Save className="w-4 h-4 mr-2" /> {actions.isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          )}
        </div>
        
      </div>
    </Card>
  );
}

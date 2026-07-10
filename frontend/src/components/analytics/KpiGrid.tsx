import { KpiCard } from "./KpiCard";
import { AnalyticsOverview } from "../../types/analytics";
import { 
  Building2, 
  FileText, 
  Award, 
  CheckCircle, 
  Activity, 
  Briefcase 
} from "lucide-react";

export function KpiGrid({ data }: { data?: AnalyticsOverview }) {
  if (!data) return null;

  const kpis = [
    { title: "Total Organizations", value: data.totalOrganizations, icon: <Building2 className="h-5 w-5" /> },
    { title: "Active Organizations", value: data.activeOrganizations, icon: <CheckCircle className="h-5 w-5" /> },
    { title: "Total Applications", value: data.applications, icon: <FileText className="h-5 w-5" /> },
    { title: "Pending Applications", value: data.pendingApplications, icon: <Activity className="h-5 w-5" /> },
    { title: "Credentials Issued", value: data.credentials, icon: <Award className="h-5 w-5" /> },
    { title: "Certificates Generated", value: data.certificates, icon: <Award className="h-5 w-5" /> },
    { title: "Training Institutes", value: data.trainingInstitutes, icon: <Building2 className="h-5 w-5" /> },
    { title: "Auditors", value: data.auditors, icon: <Briefcase className="h-5 w-5" /> }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => (
        <KpiCard key={kpi.title} {...kpi} delay={idx * 0.05} />
      ))}
    </div>
  );
}

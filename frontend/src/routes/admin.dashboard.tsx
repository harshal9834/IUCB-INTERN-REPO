import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Building2,
  Users,
  Award,
  FileCheck,
  Briefcase,
  GraduationCap,
  Bell,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { PageHeader } from "../components/reusable-components";
import { useDashboardOverview } from "../hooks/use-dashboard";
import { DashboardWelcome } from "../components/dashboard/dashboard-welcome";
import { Skeleton } from "../components/ui/skeleton";
import { StatusBadge } from "../components/status-badge";
import { Button } from "../components/ui/button";

export const Route = createFileRoute("/admin/dashboard")({
  component: DashboardComponent,
});

function KPICardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
    </div>
  );
}

function DashboardComponent() {
  const navigate = useNavigate();
  const { data: overview, isLoading, isError } = useDashboardOverview();

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Dashboard"
        description="Real-time overview of the IUCB Administration Authority"
      />

      <DashboardWelcome adminName="Administrator" />

      {isError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Failed to load dashboard data</p>
            <p className="text-xs mt-1 opacity-75">
              Please check your database connection or try again later.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {isLoading ? (
          <>
            <KPICardSkeleton />
            <KPICardSkeleton />
            <KPICardSkeleton />
            <KPICardSkeleton />
            <KPICardSkeleton />
            <KPICardSkeleton />
          </>
        ) : overview ? (
          <>
            {/* Organizations */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Organizations</p>
                  <h3 className="text-2xl font-bold text-slate-800 mt-1">{overview.organizations.total}</h3>
                </div>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Active</span>
                  <span className="font-medium text-emerald-600">{overview.organizations.active}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Inactive</span>
                  <span className="font-medium text-red-600">{overview.organizations.inactive}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-1.5 mt-1.5">
                  <span className="text-slate-500">Pending</span>
                  <span className="font-medium text-amber-600">{overview.organizations.pending}</span>
                </div>
              </div>
            </div>

            {/* Applications */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Applications</p>
                  <h3 className="text-2xl font-bold text-slate-800 mt-1">{overview.applications.total}</h3>
                </div>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <FileCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Pending</span>
                  <span className="font-medium text-amber-600">{overview.applications.pending}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Approved</span>
                  <span className="font-medium text-emerald-600">{overview.applications.approved}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-1.5 mt-1.5">
                  <span className="text-slate-500">Rejected</span>
                  <span className="font-medium text-red-600">{overview.applications.rejected}</span>
                </div>
              </div>
            </div>

            {/* Auditors */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Auditors</p>
                  <h3 className="text-2xl font-bold text-slate-800 mt-1">{overview.auditors.total}</h3>
                </div>
                <div className="p-2 bg-violet-50 text-violet-600 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Active</span>
                  <span className="font-medium text-emerald-600">{overview.auditors.active}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Suspended</span>
                  <span className="font-medium text-amber-600">{overview.auditors.suspended}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-1.5 mt-1.5">
                  <span className="text-slate-500">Inactive</span>
                  <span className="font-medium text-slate-400">{overview.auditors.inactive}</span>
                </div>
              </div>
            </div>

            {/* Training Institutes */}
            <div 
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm cursor-pointer hover:border-[#D4AF37] transition-all"
              onClick={() => navigate({ to: '/admin/training-institutes' })}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Training Institutes</p>
                  <h3 className="text-2xl font-bold text-slate-800 mt-1">{overview.trainingInstitutes.total}</h3>
                </div>
                <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                  <GraduationCap className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Active</span>
                  <span className="font-medium text-emerald-600">{overview.trainingInstitutes.active}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Inactive</span>
                  <span className="font-medium text-slate-400">{overview.trainingInstitutes.inactive}</span>
                </div>
              </div>
            </div>

            {/* Advisory Board */}
            <div 
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm cursor-pointer hover:border-[#D4AF37] transition-all"
              onClick={() => navigate({ to: '/admin/advisory' })}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Advisory Board</p>
                  <h3 className="text-2xl font-bold text-slate-800 mt-1">{overview.advisors.total}</h3>
                </div>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Briefcase className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Active</span>
                  <span className="font-medium text-emerald-600">{overview.advisors.active}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Inactive</span>
                  <span className="font-medium text-slate-400">{overview.advisors.inactive}</span>
                </div>
              </div>
            </div>

            {/* Credentials */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Credentials</p>
                  <h3 className="text-2xl font-bold text-slate-800 mt-1">{overview.credentials.generated}</h3>
                </div>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1.5 text-xs grid grid-cols-2 gap-x-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Valid</span>
                  <span className="font-medium text-emerald-600">{overview.credentials.valid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pending</span>
                  <span className="font-medium text-amber-600">{overview.credentials.pending}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-1.5 mt-1.5">
                  <span className="text-slate-500">Expired</span>
                  <span className="font-medium text-red-500">{overview.credentials.expired}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-1.5 mt-1.5">
                  <span className="text-slate-500">Revoked</span>
                  <span className="font-medium text-red-600">{overview.credentials.revoked}</span>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Lists Section */}
      {overview && !isLoading && (
        <div className="grid gap-6 lg:grid-cols-2">
          
          {/* Pending Applications */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-slate-800">Pending Applications</h3>
              </div>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-blue-600" onClick={() => navigate({ to: '/admin/applications' })}>
                View All <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="divide-y divide-slate-100 flex-1">
              {overview.lists.pendingApplications.length > 0 ? overview.lists.pendingApplications.map((app: any) => (
                <div key={app.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate({ to: `/admin/applications/${app.id}` })}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-mono font-medium text-slate-500">{app.applicationNumber}</span>
                    <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded font-medium">Pending</span>
                  </div>
                  <p className="text-sm font-medium text-slate-800">{app.company || app.fullName}</p>
                  <p className="text-xs text-slate-500">{app.applicationType.replace('_', ' ')} • {new Date(app.createdAt).toLocaleDateString()}</p>
                </div>
              )) : (
                <div className="p-8 text-center text-sm text-slate-500">No pending applications</div>
              )}
            </div>
          </div>

          {/* Pending Credentials */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-slate-800">Pending Credentials</h3>
              </div>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-blue-600" onClick={() => navigate({ to: '/admin/credentials/pending' })}>
                View All <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="divide-y divide-slate-100 flex-1">
              {overview.lists.pendingCredentials.length > 0 ? overview.lists.pendingCredentials.map((app: any) => (
                <div key={app.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate({ to: `/admin/credentials/pending` })}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-mono font-medium text-slate-500">{app.applicationNumber}</span>
                    <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded font-medium">Awaiting Generation</span>
                  </div>
                  <p className="text-sm font-medium text-slate-800">{app.company || app.fullName}</p>
                  <p className="text-xs text-slate-500">Approved on {new Date(app.reviewedAt).toLocaleDateString()}</p>
                </div>
              )) : (
                <div className="p-8 text-center text-sm text-slate-500">No pending credentials</div>
              )}
            </div>
          </div>

          {/* Recent Approvals */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-semibold text-slate-800">Recent Approvals</h3>
              </div>
            </div>
            <div className="divide-y divide-slate-100 flex-1">
              {overview.lists.recentApprovals.length > 0 ? overview.lists.recentApprovals.map((app: any) => (
                <div key={app.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate({ to: `/admin/applications/${app.id}` })}>
                  <p className="text-sm font-medium text-slate-800">{app.company || app.fullName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Approved by {app.reviewedBy?.fullName || 'Admin'} • {new Date(app.reviewedAt).toLocaleDateString()}</p>
                </div>
              )) : (
                <div className="p-8 text-center text-sm text-slate-500">No recent approvals</div>
              )}
            </div>
          </div>

          {/* Recent Credentials */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-semibold text-slate-800">Recent Credentials</h3>
              </div>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-blue-600" onClick={() => navigate({ to: '/admin/credentials' })}>
                View All <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="divide-y divide-slate-100 flex-1">
              {overview.lists.recentCredentials.length > 0 ? overview.lists.recentCredentials.map((cred: any) => (
                <div key={cred.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate({ to: `/admin/credentials/${cred.id}` })}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-mono font-medium text-slate-800">{cred.credentialId}</span>
                    <StatusBadge status={cred.status} />
                  </div>
                  <p className="text-sm text-slate-600">{cred.organization?.organizationName || cred.application?.company || cred.application?.fullName}</p>
                  <p className="text-xs text-slate-400">{cred.standard}</p>
                </div>
              )) : (
                <div className="p-8 text-center text-sm text-slate-500">No recent credentials</div>
              )}
            </div>
          </div>

          {/* Recent Organizations */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-semibold text-slate-800">Recent Organizations</h3>
              </div>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-blue-600" onClick={() => navigate({ to: '/admin/organizations' })}>
                View All <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="divide-y divide-slate-100 flex-1">
              {overview.lists.recentOrganizations.length > 0 ? overview.lists.recentOrganizations.map((org: any) => (
                <div key={org.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate({ to: `/admin/organizations` })}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium text-slate-800">{org.organizationName}</span>
                    <StatusBadge status={org.accreditationStatus} />
                  </div>
                  <p className="text-xs text-slate-500">{org.country} • Registered {new Date(org.createdAt).toLocaleDateString()}</p>
                </div>
              )) : (
                <div className="p-8 text-center text-sm text-slate-500">No recent organizations</div>
              )}
            </div>
          </div>

          {/* Recent Auditors */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-500" />
                <h3 className="text-sm font-semibold text-slate-800">Recent Auditors</h3>
              </div>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-blue-600" onClick={() => navigate({ to: '/admin/auditors' })}>
                View All <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="divide-y divide-slate-100 flex-1">
              {overview.lists.recentAuditors.length > 0 ? overview.lists.recentAuditors.map((auditor: any) => (
                <div key={auditor.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate({ to: `/admin/auditors` })}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium text-slate-800">{auditor.fullName}</span>
                    <StatusBadge status={auditor.status} />
                  </div>
                  <p className="text-xs text-slate-500">{auditor.tier} Auditor • {auditor.organization?.organizationName}</p>
                </div>
              )) : (
                <div className="p-8 text-center text-sm text-slate-500">No recent auditors</div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

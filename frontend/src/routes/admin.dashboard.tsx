import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  Users,
  Award,
  FileCheck,
  Plus,
  User,
  FileText,
  Bell,
  Database,
  Globe,
  Lock,
  Mail,
  HardDrive,
  RefreshCw,
} from "lucide-react";
import { PageHeader } from "../components/reusable-components";
import {
  useDashboardMetrics,
  useDashboardActivity,
  useSystemHealth,
  usePendingApplications,
  useDashboardNotifications,
} from "../hooks/use-dashboard";
import { MetricCard } from "../components/dashboard/metric-card";
import { DashboardWelcome } from "../components/dashboard/dashboard-welcome";
import { QuickActionCard } from "../components/dashboard/quick-action-card";
import { ActivityTimeline } from "../components/dashboard/activity-timeline";
import { SystemHealth } from "../components/dashboard/system-health";
import { PendingApplicationsWidget } from "../components/dashboard/pending-applications-widget";
import { NotificationCard } from "../components/dashboard/notification-card";
import { Skeleton } from "../components/ui/skeleton";

export const Route = createFileRoute("/admin/dashboard")({
  component: DashboardComponent,
});

function MetricCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
    </div>
  );
}

function DashboardComponent() {
  // Fetch all dashboard data
  const metricsQuery = useDashboardMetrics();
  const activityQuery = useDashboardActivity();
  const healthQuery = useSystemHealth();
  const applicationsQuery = usePendingApplications();
  const notificationsQuery = useDashboardNotifications();

  const metrics = metricsQuery.data;
  const activities = activityQuery.data || [];
  const healthIndicators = healthQuery.data || [];
  const pendingApps = applicationsQuery.data || [];
  const notifications = notificationsQuery.data || [];

  const isLoading =
    metricsQuery.isLoading ||
    activityQuery.isLoading ||
    healthQuery.isLoading ||
    applicationsQuery.isLoading ||
    notificationsQuery.isLoading;

  const isError =
    metricsQuery.isError ||
    activityQuery.isError ||
    healthQuery.isError ||
    applicationsQuery.isError ||
    notificationsQuery.isError;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Dashboard"
        description="Real-time overview of the IUCB Administration Authority"
      />

      {/* Welcome Section */}
      <DashboardWelcome adminName="Administrator" />

      {/* Error State */}
      {isError && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <Bell className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Some data couldn't be loaded</p>
            <p className="text-xs mt-1 opacity-75">
              Showing cached data. Please refresh the page if you continue to see this message.
            </p>
          </div>
        </div>
      )}

      {/* Section 1: Key Metrics */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">
          Key Metrics
        </h3>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {metricsQuery.isLoading ? (
            <>
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </>
          ) : (
            <>
              <MetricCard
                title="Organizations"
                value={metrics?.organizations.total ?? 0}
                subValue={`${metrics?.organizations.active ?? 0} active`}
                description="Accredited bodies"
                icon={<Building2 className="h-5 w-5 text-blue-600" />}
                iconBg="bg-blue-50"
                trendLabel="+12 this month"
                trendPositive
              />
              <MetricCard
                title="Auditors"
                value={metrics?.auditors.total ?? 0}
                subValue={`${metrics?.auditors.active ?? 0} active`}
                description="Registered auditors"
                icon={<Users className="h-5 w-5 text-violet-600" />}
                iconBg="bg-violet-50"
                trendLabel="+8 this month"
                trendPositive
              />
              <MetricCard
                title="Credentials"
                value={metrics?.credentials.total ?? 0}
                subValue={`${metrics?.credentials.valid ?? 0} valid`}
                description="Issued credentials"
                icon={<Award className="h-5 w-5 text-emerald-600" />}
                iconBg="bg-emerald-50"
                trendLabel="+156 this month"
                trendPositive
              />
              <MetricCard
                title="Applications"
                value={metrics?.applications.pending ?? 0}
                subValue={`${metrics?.applications.approved ?? 0} approved`}
                description="Pending review"
                icon={<FileCheck className="h-5 w-5 text-amber-600" />}
                iconBg="bg-amber-50"
                trendLabel="23 need review"
                trendPositive={false}
              />
            </>
          )}
        </div>
      </div>

      {/* Section 2: Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">
          Quick Actions
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <QuickActionCard
            title="Add Organization"
            description="Register a new accredited body"
            icon={<Plus className="h-4 w-4" />}
            href="/admin/organizations"
            iconColor="bg-blue-50 text-blue-600"
            borderColor="border-l-blue-500"
          />
          <QuickActionCard
            title="Enroll Auditor"
            description="Register a new auditor"
            icon={<User className="h-4 w-4" />}
            href="/admin/auditors"
            iconColor="bg-violet-50 text-violet-600"
            borderColor="border-l-violet-500"
          />
          <QuickActionCard
            title="Issue Credential"
            description="Create and issue credentials"
            icon={<FileText className="h-4 w-4" />}
            href="/admin/credentials"
            iconColor="bg-emerald-50 text-emerald-600"
            borderColor="border-l-emerald-500"
          />
        </div>
      </div>

      {/* Section 3: Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity */}
          <ActivityTimeline activities={activities} isLoading={activityQuery.isLoading} />

          {/* System Health */}
          <SystemHealth indicators={healthIndicators} isLoading={healthQuery.isLoading} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pending Applications Widget */}
          <PendingApplicationsWidget
            applications={pendingApps}
            isLoading={applicationsQuery.isLoading}
          />

          {/* Notifications */}
          <NotificationCard
            notifications={notifications}
            isLoading={notificationsQuery.isLoading}
          />
        </div>
      </div>

      {/* Section 4: Summary Footer */}
      <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">System Overview</h3>
        <div className="grid gap-4 text-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <span className="text-slate-600">Total Advisors</span>
            <span className="font-semibold text-slate-900">{metrics?.advisors.total ?? 0}</span>
          </div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <span className="text-slate-600">Published Resources</span>
            <span className="font-semibold text-slate-900">{metrics?.resources.total ?? 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Last Updated</span>
            <span className="text-xs text-slate-500">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

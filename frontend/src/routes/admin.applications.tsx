import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { PageHeader } from "../components/reusable-components";
import { DataTable, DataTableColumn } from "../components/data-table";
import { StatusBadge } from "../components/status-badge";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import applicationsApi from "../services/api/applications.api";

export const Route = createFileRoute("/admin/applications")({
  component: ApplicationsComponent,
});

interface Application {
  id: string;
  fullName: string;
  email: string;
  linkedinUrl: string;
  company: string;
  designation: string;
  expertiseArea: string;
  experienceYears: number;
  statementOfMerit: string;
  resumeUrl?: string;
  applicationStatus: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: { fullName: string };
}

function ApplicationsComponent() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewTarget, setViewTarget] = useState<Application | null>(null);
  const [decisionTarget, setDecisionTarget] = useState<{
    app: Application;
    decision: "APPROVED" | "REJECTED";
  } | null>(null);
  const [remarks, setRemarks] = useState("");

  const queryKey = ["applications", page, search, statusFilter];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const params: any = { page, limit: 15 };
      if (search) params.search = search;
      if (statusFilter !== "ALL") params.status = statusFilter;
      const res = await applicationsApi.getApplications(params);
      return res.data.data;
    },
    staleTime: 10_000,
  });

  const decisionMutation = useMutation({
    mutationFn: ({ id, status, remarks }: { id: string; status: string; remarks?: string }) =>
      applicationsApi.decideApplication(id, { status, remarks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      setDecisionTarget(null);
      setViewTarget(null);
      setRemarks("");
    },
  });

  const applications: Application[] = data?.applications ?? [];
  const pagination = data?.pagination;

  const columns: DataTableColumn<Application>[] = [
    {
      header: "Applicant",
      accessor: (r) => (
        <div>
          <p className="font-semibold text-[#0F2942] text-sm">{r.fullName}</p>
          <p className="text-xs text-slate-400 mt-0.5">{r.email}</p>
        </div>
      ),
    },
    {
      header: "Company",
      accessor: (r) => (
        <div>
          <p className="text-sm text-slate-700">{r.company}</p>
          <p className="text-xs text-slate-400">{r.designation}</p>
        </div>
      ),
    },
    { header: "Expertise", accessor: "expertiseArea", className: "hidden lg:table-cell" },
    {
      header: "Experience",
      accessor: (r) => (
        <span className="text-xs">
          {r.experienceYears} yr{r.experienceYears !== 1 ? "s" : ""}
        </span>
      ),
      className: "hidden xl:table-cell",
    },
    { header: "Status", accessor: (r) => <StatusBadge status={r.applicationStatus} /> },
    {
      header: "Applied",
      accessor: (r) => (
        <span className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</span>
      ),
      className: "hidden xl:table-cell",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Advisory Applications"
        description="Review and process applications for the IUCB Advisory Board"
      />

      <DataTable
        data={applications}
        columns={columns}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search by name, email, company…"
        page={page}
        totalPages={pagination?.totalPages ?? 1}
        onPageChange={setPage}
        total={pagination?.total}
        emptyTitle="No applications found"
        emptyDescription="Advisory board applications submitted through the public portal will appear here."
        headerSlot={
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-32 text-xs h-9 bg-white border-slate-200">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        }
        actions={(app) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500"
              onClick={() => setViewTarget(app)}
              title="View Application"
            >
              <Eye className="h-4 w-4" />
            </Button>
            {app.applicationStatus === "PENDING" && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  onClick={() => {
                    setDecisionTarget({ app, decision: "APPROVED" });
                    setRemarks("");
                  }}
                  title="Approve"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => {
                    setDecisionTarget({ app, decision: "REJECTED" });
                    setRemarks("");
                  }}
                  title="Reject"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        )}
      />

      {/* View Application Detail Modal */}
      <Dialog open={!!viewTarget} onOpenChange={() => setViewTarget(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application — {viewTarget?.fullName}</DialogTitle>
          </DialogHeader>
          {viewTarget && (
            <div className="space-y-4 mt-2 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">
                    Email
                  </p>
                  <p className="mt-1 text-slate-700">{viewTarget.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">
                    Status
                  </p>
                  <div className="mt-1">
                    <StatusBadge status={viewTarget.applicationStatus} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">
                    Company
                  </p>
                  <p className="mt-1 text-slate-700">{viewTarget.company}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">
                    Designation
                  </p>
                  <p className="mt-1 text-slate-700">{viewTarget.designation}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">
                    Expertise Area
                  </p>
                  <p className="mt-1 text-slate-700">{viewTarget.expertiseArea}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">
                    Experience
                  </p>
                  <p className="mt-1 text-slate-700">{viewTarget.experienceYears} years</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">
                  LinkedIn
                </p>
                <a
                  href={viewTarget.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#0F2942] underline text-xs break-all"
                >
                  {viewTarget.linkedinUrl}
                </a>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-2">
                  Statement of Merit
                </p>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-xs bg-slate-50 rounded-lg p-4 border border-slate-100">
                  {viewTarget.statementOfMerit}
                </p>
              </div>
              {viewTarget.applicationStatus === "PENDING" && (
                <>
                  <Separator />
                  <div className="flex gap-3 pt-1">
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                      onClick={() => {
                        setDecisionTarget({ app: viewTarget, decision: "APPROVED" });
                        setRemarks("");
                      }}
                    >
                      <CheckCircle className="h-4 w-4" /> Approve Application
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50 gap-2"
                      onClick={() => {
                        setDecisionTarget({ app: viewTarget, decision: "REJECTED" });
                        setRemarks("");
                      }}
                    >
                      <XCircle className="h-4 w-4" /> Reject Application
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Decision Confirm Modal */}
      <Dialog open={!!decisionTarget} onOpenChange={() => setDecisionTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle
              className={
                decisionTarget?.decision === "APPROVED" ? "text-emerald-700" : "text-red-700"
              }
            >
              {decisionTarget?.decision === "APPROVED"
                ? "✓ Approve Application"
                : "✗ Reject Application"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-slate-600">
              {decisionTarget?.decision === "APPROVED"
                ? `Approving "${decisionTarget?.app.fullName}" will create an Advisor profile and make them publicly visible.`
                : `Rejecting "${decisionTarget?.app.fullName}" will close this application.`}
            </p>
            <div className="space-y-1.5">
              <Label>Remarks (optional)</Label>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add internal notes about this decision…"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDecisionTarget(null)}
              disabled={decisionMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              className={
                decisionTarget?.decision === "APPROVED"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }
              onClick={() =>
                decisionTarget &&
                decisionMutation.mutate({
                  id: decisionTarget.app.id,
                  status: decisionTarget.decision,
                  remarks: remarks || undefined,
                })
              }
              disabled={decisionMutation.isPending}
            >
              {decisionMutation.isPending
                ? "Processing…"
                : decisionTarget?.decision === "APPROVED"
                  ? "Confirm Approval"
                  : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

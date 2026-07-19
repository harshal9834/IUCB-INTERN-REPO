import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  FileCode2,
  Mail,
  Loader2,
  Download,
  FileSpreadsheet,
  Users,
  RefreshCw,
} from 'lucide-react';
import { bulkEmailApi } from '../../services/api/bulk-email.api';

// ─── Step indicator ────────────────────────────────────────────────────────────

const STEPS = [
  { n: 1, label: 'Upload Excel' },
  { n: 2, label: 'Upload Template' },
  { n: 3, label: 'Verify Placeholders' },
  { n: 4, label: 'Generate Certificates' },
  { n: 5, label: 'Configure Email' },
  { n: 6, label: 'Send Emails' },
  { n: 7, label: 'Report' },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
      {STEPS.map((s, i) => (
        <React.Fragment key={s.n}>
          <div
            className={`flex-shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
              s.n < current
                ? 'bg-green-100 text-green-700'
                : s.n === current
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            {s.n < current ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <span className="h-4 w-4 flex items-center justify-center">{s.n}</span>
            )}
            <span className="hidden sm:inline">{s.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`flex-1 h-px min-w-[8px] ${s.n < current ? 'bg-green-300' : 'bg-slate-200'}`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Main wizard ───────────────────────────────────────────────────────────────

export function BulkEmailWizard() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Excel state
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelRows, setExcelRows] = useState<any[]>([]);
  const [excelColumns, setExcelColumns] = useState<string[]>([]);
  const [rowCount, setRowCount] = useState(0);

  // Template state
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [templateHtml, setTemplateHtml] = useState<string>('');
  const [placeholders, setPlaceholders] = useState<{
    matched: string[];
    systemGenerated: string[];
    missing: string[];
  }>({ matched: [], systemGenerated: [], missing: [] });

  // Campaign state
  const [campaignId, setCampaignId] = useState<string>('');
  const [campaignDbId, setCampaignDbId] = useState<string>('');

  // Email config
  const [emailConfig, setEmailConfig] = useState({
    subject: 'Your Certificate from IUCB',
    fromName: 'IUCB Administration',
    replyTo: 'no-reply@iucb.org',
    body: 'Dear {{Candidate Name}},<br><br>Please find your certificate attached.<br><br>Best regards,<br>IUCB',
  });

  const [report, setReport] = useState<any>(null);

  // ── Step 1: Upload Excel ──────────────────────────────────────────────────────

  const handleExcelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      setError('Please upload a valid .xlsx file (Excel 2007+).');
      return;
    }
    setExcelFile(file);
  };

  const submitExcel = async () => {
    if (!excelFile) return setError('Please select an Excel file first.');
    setLoading(true);
    setError(null);
    try {
      const res = await bulkEmailApi.uploadExcel(excelFile);
      const { allRows, excelColumns: cols, rowCount: count } = res.data.data;
      setExcelRows(allRows);
      setExcelColumns(cols);
      setRowCount(count ?? allRows.length);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message ?? err.message ?? 'Failed to parse Excel file.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Upload HTML Template ──────────────────────────────────────────────

  const handleTemplateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.html')) {
      setError('Please upload a valid .html file.');
      return;
    }
    setTemplateFile(file);
  };

  const submitTemplate = async () => {
    if (!templateFile) return setError('Please select an HTML file first.');
    setLoading(true);
    setError(null);
    try {
      const res = await bulkEmailApi.uploadTemplate(templateFile, excelColumns);
      const { htmlContent, matchResult } = res.data.data;
      setTemplateHtml(htmlContent);
      setPlaceholders(matchResult);

      if (matchResult.missing.length > 0) {
        setError(
          `Some template placeholders could not be matched: ${matchResult.missing.join(', ')}. ` +
            `Add matching columns to your Excel file or remove these placeholders from the template.`,
        );
        // Show the verification step anyway so user can see details
        setStep(3);
      } else {
        setStep(3);
      }
    } catch (err: any) {
      setError(err.response?.data?.message ?? err.message ?? 'Failed to parse template.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3 → 4: Generate credentials & certificates ──────────────────────────

  const generateCredentials = async () => {
    if (placeholders.missing.length > 0) {
      return setError(
        `Cannot generate: unresolved template placeholders: ${placeholders.missing.join(', ')}`,
      );
    }
    setStep(4); // move to "generating" step immediately so user sees progress
    setLoading(true);
    setError(null);
    try {
      const freshCampaignId = `CMP-${Date.now()}-${Math.random().toString(16).slice(2, 10).toUpperCase()}`;
      setCampaignId(freshCampaignId);

      const res = await bulkEmailApi.generateCampaign(
        freshCampaignId,
        excelRows,
        templateHtml,
        window.location.origin,
      );

      setCampaignDbId(res.data.data.campaignDbId);
      setStep(5);
    } catch (err: any) {
      setError(err.response?.data?.message ?? err.message ?? 'Failed to generate certificates.');
      setStep(3); // go back so user can retry
    } finally {
      setLoading(false);
    }
  };

  // ── Step 5 → 6: Send emails ───────────────────────────────────────────────────

  const sendEmails = async () => {
    setLoading(true);
    setError(null);
    try {
      await bulkEmailApi.sendEmails(campaignDbId, emailConfig);
      setStep(6);

      const interval = setInterval(async () => {
        try {
          const res = await bulkEmailApi.getReport(campaignDbId);
          const status = res.data.data?.status;
          if (status === 'COMPLETED' || status === 'FAILED') {
            clearInterval(interval);
            setReport(res.data.data);
            setLoading(false);
            setStep(7);
          }
        } catch {
          // keep polling
        }
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message ?? err.message ?? 'Failed to send emails.');
      setLoading(false);
    }
  };

  // ── Restart wizard ────────────────────────────────────────────────────────────

  const restart = () => {
    setStep(1);
    setLoading(false);
    setError(null);
    setExcelFile(null);
    setExcelRows([]);
    setExcelColumns([]);
    setRowCount(0);
    setTemplateFile(null);
    setTemplateHtml('');
    setPlaceholders({ matched: [], systemGenerated: [], missing: [] });
    setCampaignId('');
    setCampaignDbId('');
    setReport(null);
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bulk Email Campaign</CardTitle>
        <CardDescription>
          Follow the steps to generate and send certificates.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <StepIndicator current={step} />

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* ── Step 1: Upload Excel ─────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4">
            <Alert>
              <FileSpreadsheet className="h-4 w-4" />
              <AlertTitle>Excel File Requirements</AlertTitle>
              <AlertDescription>
                Upload a <strong>.xlsx</strong> file. The first row must be the header row.
                <br />
                <br />
                <strong>Required columns:</strong> Candidate Name, Email, Institute Name
                <br />
                Any additional columns will be available as template placeholders.
              </AlertDescription>
            </Alert>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="excel">Upload .xlsx File</Label>
              <Input
                id="excel"
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleExcelChange}
              />
            </div>
            {excelFile && (
              <p className="text-sm text-slate-500">
                Selected: <strong>{excelFile.name}</strong> ({(excelFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
            <Button onClick={submitExcel} disabled={!excelFile || loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Parse Excel &amp; Continue
            </Button>
          </div>
        )}

        {/* ── Step 2: Upload HTML Template ─────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-4">
            <Alert>
              <FileCode2 className="h-4 w-4" />
              <AlertTitle>HTML Certificate Template</AlertTitle>
              <AlertDescription>
                Upload your <strong>.html</strong> certificate template.
                Use <code>{`{{Placeholder Name}}`}</code> syntax for dynamic fields.
                <br />
                <br />
                <strong>Detected Excel columns:</strong>{' '}
                {excelColumns.length > 0 ? excelColumns.join(', ') : 'none'}
                <br />
                <strong>Rows to process:</strong> {rowCount}
              </AlertDescription>
            </Alert>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="html">Upload .html File</Label>
              <Input
                id="html"
                type="file"
                accept=".html,text/html"
                onChange={handleTemplateChange}
              />
            </div>
            {templateFile && (
              <p className="text-sm text-slate-500">
                Selected: <strong>{templateFile.name}</strong>
              </p>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} disabled={loading}>
                Back
              </Button>
              <Button onClick={submitTemplate} disabled={!templateFile || loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Verify Template
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Verify Placeholders ──────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="font-medium text-lg">Placeholder Matching</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm text-green-700">
                    ✓ Matched from Excel ({placeholders.matched.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  {placeholders.matched.length === 0 ? (
                    <span className="text-xs text-slate-400">None</span>
                  ) : (
                    placeholders.matched.map((p) => (
                      <div key={p} className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                        {p}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm text-blue-700">
                    ⚙ System Generated ({placeholders.systemGenerated.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  {placeholders.systemGenerated.length === 0 ? (
                    <span className="text-xs text-slate-400">None</span>
                  ) : (
                    placeholders.systemGenerated.map((p) => (
                      <div key={p} className="text-sm text-blue-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                        {p}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm text-red-700">
                    ✗ Unresolved ({placeholders.missing.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  {placeholders.missing.length === 0 ? (
                    <span className="text-xs text-green-600 font-medium">All placeholders resolved!</span>
                  ) : (
                    placeholders.missing.map((p) => (
                      <div key={p} className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        {p}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {placeholders.missing.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Unresolved Placeholders</AlertTitle>
                <AlertDescription>
                  Add the missing columns to your Excel file or remove these placeholders from the
                  template, then re-upload.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} disabled={loading}>
                Back
              </Button>
              <Button
                onClick={generateCredentials}
                disabled={loading || placeholders.missing.length > 0}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Users className="mr-2 h-4 w-4" />
                )}
                Generate Credentials &amp; Certificates
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 4: Generating (progress) ───────────────────────────────── */}
        {step === 4 && (
          <div className="flex flex-col items-center justify-center py-16 space-y-5">
            <Loader2 className="h-14 w-14 animate-spin text-blue-600" />
            <h3 className="text-xl font-semibold">Generating Credentials &amp; Certificates…</h3>
            <p className="text-slate-500 text-sm text-center max-w-sm">
              Processing <strong>{rowCount}</strong> record{rowCount !== 1 ? 's' : ''}. Each
              certificate is rendered to PDF — this may take a minute.
            </p>
            {error && (
              <Alert variant="destructive" className="mt-4 max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Generation Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* ── Step 5: Configure Email ──────────────────────────────────────── */}
        {step === 5 && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-700">Certificates Generated</AlertTitle>
              <AlertDescription>
                Campaign <code>{campaignId}</code> is ready. Configure the email below and send.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>From Name</Label>
              <Input
                value={emailConfig.fromName}
                onChange={(e) => setEmailConfig({ ...emailConfig, fromName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Reply-To</Label>
              <Input
                value={emailConfig.replyTo}
                onChange={(e) => setEmailConfig({ ...emailConfig, replyTo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={emailConfig.subject}
                onChange={(e) => setEmailConfig({ ...emailConfig, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email Body (HTML allowed, use {`{{Candidate Name}}`} etc.)</Label>
              <Textarea
                rows={6}
                value={emailConfig.body}
                onChange={(e) => setEmailConfig({ ...emailConfig, body: e.target.value })}
              />
            </div>
            <Button onClick={sendEmails} disabled={loading} className="w-full mt-4">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              Send Emails to {rowCount} Recipient{rowCount !== 1 ? 's' : ''}
            </Button>
          </div>
        )}

        {/* ── Step 6: Sending (polling) ────────────────────────────────────── */}
        {step === 6 && (
          <div className="flex flex-col items-center justify-center py-16 space-y-5">
            <Loader2 className="h-14 w-14 animate-spin text-blue-600" />
            <h3 className="text-xl font-semibold">Sending Emails…</h3>
            <p className="text-slate-500 text-sm text-center max-w-sm">
              Dispatching certificates to all recipients. You'll see the report as soon as all
              emails are processed.
            </p>
          </div>
        )}

        {/* ── Step 7: Report ───────────────────────────────────────────────── */}
        {step === 7 && report && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-green-600 mb-2">
              <CheckCircle2 className="h-8 w-8" />
              <h2 className="text-2xl font-bold">Campaign Completed</h2>
            </div>
            <p className="text-sm text-slate-500">Campaign ID: <code>{report.campaignId}</code></p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-xs text-slate-500 uppercase tracking-wide">
                    Total Recipients
                  </CardTitle>
                  <div className="text-2xl font-bold">{report.totalRecipients}</div>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-xs text-slate-500 uppercase tracking-wide">
                    Credentials
                  </CardTitle>
                  <div className="text-2xl font-bold">{report.credentialsGenerated}</div>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-xs text-slate-500 uppercase tracking-wide">
                    Certificates
                  </CardTitle>
                  <div className="text-2xl font-bold">{report.certificatesGenerated}</div>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-xs text-slate-500 uppercase tracking-wide">
                    Emails Sent
                  </CardTitle>
                  <div className="text-2xl font-bold text-green-600">{report.emailsSent}</div>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-xs text-slate-500 uppercase tracking-wide">
                    Failed
                  </CardTitle>
                  <div className="text-2xl font-bold text-red-600">{report.failedEmails}</div>
                </CardHeader>
              </Card>
            </div>

            {report.credentials && report.credentials.length > 0 && (
              <div className="mt-4 border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">
                        Candidate
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">
                        Email
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">
                        Note
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.credentials.map((c: any, i: number) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="px-4 py-2">{c.candidateName}</td>
                        <td className="px-4 py-2 text-slate-500">{c.email}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              c.status === 'SENT'
                                ? 'bg-green-100 text-green-700'
                                : c.status === 'FAILED'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-xs text-slate-400">
                          {c.errorMessage ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h4 className="font-semibold text-sm mb-1">Certificate Storage Location</h4>
              <p className="text-xs text-slate-600 font-mono">
                backend/uploads/certificates/{report.campaignId}/
              </p>
            </div>

            <Button variant="outline" className="w-full" onClick={restart}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Start New Campaign
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

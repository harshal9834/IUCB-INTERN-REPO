import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Upload, CheckCircle2, AlertCircle, FileSpreadsheet, FileCode2, Mail, Loader2, Download } from 'lucide-react';
import { bulkEmailApi } from '../../services/api/bulk-email.api';
// campaignId generated fresh on each generate call — no uuid dependency needed

export function BulkEmailWizard() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelRows, setExcelRows] = useState<any[]>([]);
  const [excelColumns, setExcelColumns] = useState<string[]>([]);
  
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [templateHtml, setTemplateHtml] = useState<string>('');
  const [placeholders, setPlaceholders] = useState<any>({ matched: [], systemGenerated: [], missing: [] });
  
  const [campaignId, setCampaignId] = useState<string>('');
  const [campaignDbId, setCampaignDbId] = useState<string>('');
  
  const [emailConfig, setEmailConfig] = useState({
    subject: 'Your Certificate from IUCB',
    fromName: 'IUCB Administration',
    replyTo: 'no-reply@iucb.org',
    body: 'Dear {{Candidate Name}},<br><br>Please find your certificate attached.<br><br>Best regards,<br>IUCB',
  });

  const [report, setReport] = useState<any>(null);

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    if (!file.name.endsWith('.xlsx')) {
      setError('Please upload a valid .xlsx file.');
      return;
    }
    setExcelFile(file);
    setError(null);
  };

  const submitExcel = async () => {
    if (!excelFile) return setError('Please select an Excel file first.');
    setLoading(true);
    setError(null);
    try {
      const res = await bulkEmailApi.uploadExcel(excelFile);
      setExcelRows(res.data.data.allRows); // Store all parsed rows
      setExcelColumns(res.data.data.excelColumns);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    if (!file.name.endsWith('.html')) {
      setError('Please upload a valid .html file.');
      return;
    }
    setTemplateFile(file);
    setError(null);
  };

  const submitTemplate = async () => {
    if (!templateFile) return setError('Please select an HTML file first.');
    setLoading(true);
    setError(null);
    try {
      const res = await bulkEmailApi.uploadTemplate(templateFile, excelColumns);
      setTemplateHtml(res.data.data.htmlContent);
      setPlaceholders(res.data.data.matchResult);
      if (res.data.data.matchResult.missing.length > 0) {
        setError(`Missing placeholders: ${res.data.data.matchResult.missing.join(', ')}`);
        setLoading(false);
        return; // Don't proceed if missing
      }
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateCredentials = async () => {
    setLoading(true);
    setError(null);
    try {
      // Generate a FRESH unique campaignId on every attempt.
      // Format: CMP-<unix-ms>-<8 random hex chars>
      const freshCampaignId = `CMP-${Date.now()}-${Math.random().toString(16).slice(2, 10).toUpperCase()}`;
      setCampaignId(freshCampaignId);

      const res = await bulkEmailApi.generateCampaign(
        freshCampaignId,
        excelRows, 
        templateHtml, 
        window.location.origin
      );
      
      setCampaignDbId(res.data.data.campaignDbId);
      setStep(5);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendEmails = async () => {
    setLoading(true);
    setError(null);
    try {
      await bulkEmailApi.sendEmails(campaignDbId, emailConfig);
      setStep(6);
      
      // Poll report
      const interval = setInterval(async () => {
        const res = await bulkEmailApi.getReport(campaignDbId);
        if (res.data.data.status === 'COMPLETED' || res.data.data.status === 'FAILED') {
          clearInterval(interval);
          setReport(res.data.data);
          setStep(7);
        }
      }, 3000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bulk Email Campaign</CardTitle>
        <CardDescription>Follow the steps to generate and send certificates.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Upload Excel */}
        {step === 1 && (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Excel Requirements</AlertTitle>
              <AlertDescription>
                The Excel file must contain column names that exactly match the placeholders used in the HTML template.<br/><br/>
                <b>Required Columns:</b> Candidate Name, Email, Institute Name
              </AlertDescription>
            </Alert>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="excel">Upload .xlsx File</Label>
              <Input id="excel" type="file" accept=".xlsx" onChange={handleExcelUpload} />
            </div>
            <Button onClick={submitExcel} disabled={!excelFile || loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Next: Upload Template
            </Button>
          </div>
        )}

        {/* Step 2: Upload HTML Template */}
        {step === 2 && (
          <div className="space-y-4">
            <Alert>
              <FileCode2 className="h-4 w-4" />
              <AlertTitle>HTML Template</AlertTitle>
              <AlertDescription>
                Upload your certificate HTML file. Placeholders should be formatted as {"{{Placeholder Name}}"}.
              </AlertDescription>
            </Alert>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="html">Upload .html File</Label>
              <Input id="html" type="file" accept=".html" onChange={handleTemplateUpload} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} disabled={loading}>Back</Button>
              <Button onClick={submitTemplate} disabled={!templateFile || loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Next: Verify & Generate
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Verify & Generate */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-lg mb-2">Placeholder Matching</h3>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="py-3"><CardTitle className="text-sm">Matched from Excel</CardTitle></CardHeader>
                  <CardContent className="py-2">
                    {placeholders.matched.map((p: string) => <div key={p} className="text-sm text-green-600 flex items-center"><CheckCircle2 className="w-3 h-3 mr-1"/> {p}</div>)}
                    {placeholders.matched.length === 0 && <span className="text-xs text-slate-500">None</span>}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-3"><CardTitle className="text-sm">System Generated</CardTitle></CardHeader>
                  <CardContent className="py-2">
                    {placeholders.systemGenerated.map((p: string) => <div key={p} className="text-sm text-blue-600 flex items-center"><CheckCircle2 className="w-3 h-3 mr-1"/> {p}</div>)}
                    {placeholders.systemGenerated.length === 0 && <span className="text-xs text-slate-500">None</span>}
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} disabled={loading}>Back</Button>
              <Button onClick={generateCredentials} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Generate Credentials & Certificates'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Email Config */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Configure Email</h3>
            <div className="space-y-2">
              <Label>From Name</Label>
              <Input value={emailConfig.fromName} onChange={(e) => setEmailConfig({...emailConfig, fromName: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Reply-To</Label>
              <Input value={emailConfig.replyTo} onChange={(e) => setEmailConfig({...emailConfig, replyTo: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={emailConfig.subject} onChange={(e) => setEmailConfig({...emailConfig, subject: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Body (HTML allowed)</Label>
              <Textarea rows={6} value={emailConfig.body} onChange={(e) => setEmailConfig({...emailConfig, body: e.target.value})} />
            </div>
            <Button onClick={sendEmails} disabled={loading} className="w-full mt-4">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              Send Emails
            </Button>
          </div>
        )}

        {/* Step 6: Sending Emails */}
        {step === 6 && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <h3 className="text-xl font-medium">Sending Emails...</h3>
            <p className="text-slate-500">Please wait while the system dispatches all emails. This may take a few minutes.</p>
          </div>
        )}

        {/* Step 7: Report */}
        {step === 7 && report && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-green-600 mb-6">
              <CheckCircle2 className="h-8 w-8" />
              <h2 className="text-2xl font-bold">Campaign Completed</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card><CardHeader className="py-4"><CardTitle className="text-sm text-slate-500">Total Recipients</CardTitle><div className="text-2xl font-bold">{report.totalRecipients}</div></CardHeader></Card>
              <Card><CardHeader className="py-4"><CardTitle className="text-sm text-slate-500">Credentials</CardTitle><div className="text-2xl font-bold">{report.credentialsGenerated}</div></CardHeader></Card>
              <Card><CardHeader className="py-4"><CardTitle className="text-sm text-slate-500">Certificates</CardTitle><div className="text-2xl font-bold">{report.certificatesGenerated}</div></CardHeader></Card>
              <Card><CardHeader className="py-4"><CardTitle className="text-sm text-slate-500">Emails Sent</CardTitle><div className="text-2xl font-bold text-green-600">{report.emailsSent}</div></CardHeader></Card>
              <Card><CardHeader className="py-4"><CardTitle className="text-sm text-slate-500">Failed</CardTitle><div className="text-2xl font-bold text-red-600">{report.failedEmails}</div></CardHeader></Card>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-6">
              <h4 className="font-semibold mb-2">Local Certificate Storage</h4>
              <p className="text-sm text-slate-600 font-mono">backend/uploads/certificates/{report.campaignId}/</p>
            </div>

            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download CSV Report
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

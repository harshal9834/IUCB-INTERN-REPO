import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  Plus,
  CheckCircle,
  Archive,
  Trash2,
  Download,
  Eye,
  FileText,
  UploadCloud,
  Copy,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader, EmptyState } from '../components/reusable-components';
import { Button } from '../components/ui/button';
import { axiosInstance } from '../services/api/axios';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/certificate-templates')({
  component: CertificateTemplatesPage,
});

interface Template {
  id: string;
  title: string;
  description?: string;
  detectedType: string;
  version?: string;
  status: string;
  filename: string;
  placeholders?: string[];
  createdAt: string;
  uploader?: { fullName: string };
}

function CertificateTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Form State
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('v1.0');
  const [file, setFile] = useState<File | null>(null);
  
  // Analysis State
  const [detectedType, setDetectedType] = useState<string>('');
  const [detectedPlaceholders, setDetectedPlaceholders] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/certificate-templates');
      setTemplates(res.data.data);
    } catch (_err) {
      toast.error('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error('Please select an HTML file');

    const formData = new FormData();
    formData.append('htmlFile', file);

    try {
      setAnalyzing(true);
      const res = await axiosInstance.post('/certificate-templates/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const analysis = res.data.data;
      setDetectedType(analysis.detectedType);
      setDetectedPlaceholders(analysis.placeholders);
      setWarnings(analysis.warnings);
      setStep(2); // Move to preview step
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return toast.error('Please select an HTML file');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('detectedType', detectedType);
    formData.append('version', version);
    formData.append('placeholders', JSON.stringify(detectedPlaceholders));
    formData.append('htmlFile', file);

    try {
      setUploading(true);
      await axiosInstance.post('/certificate-templates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Template uploaded successfully');
      setUploadModalOpen(false);
      resetForm();
      fetchTemplates();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await axiosInstance.put(`/certificate-templates/${id}/status/activate`);
      toast.success('Template activated');
      fetchTemplates();
    } catch {
      toast.error('Failed to activate template');
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await axiosInstance.put(`/certificate-templates/${id}/status/archive`);
      toast.success('Template archived');
      fetchTemplates();
    } catch {
      toast.error('Failed to archive template');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await axiosInstance.delete(`/certificate-templates/${id}`);
      toast.success('Template deleted');
      fetchTemplates();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || 'Failed to delete template');
    }
  };
  
  const handleDuplicate = (tpl: Template) => {
    setTitle(`${tpl.title} (Copy)`);
    setDescription(tpl.description || '');
    setVersion(tpl.version || 'v1.1');
    setStep(1);
    setUploadModalOpen(true);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setVersion('v1.0');
    setFile(null);
    setStep(1);
    setDetectedType('');
    setDetectedPlaceholders([]);
    setWarnings([]);
  };

  const statusBadge = (status: string) => {
    if (status === 'ACTIVE') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          <CheckCircle className="w-3 h-3" /> Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
        <Archive className="w-3 h-3" /> Archived
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          title="Certificate Templates"
          description="Upload and manage HTML templates. The system automatically detects the certificate type and placeholders."
        />
        <Button onClick={() => { resetForm(); setUploadModalOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Upload Template
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Loading templates...</div>
      ) : templates.length === 0 ? (
        <EmptyState
          title="No certificate templates yet"
          description="Upload an HTML file to create your first dynamic certificate template."
          action={
            <Button onClick={() => setUploadModalOpen(true)}>
              <UploadCloud className="w-4 h-4 mr-2" /> Upload Template
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className={`bg-white rounded-xl border shadow-sm flex flex-col overflow-hidden transition-all hover:shadow-md ${
                tpl.status === 'ACTIVE' ? 'border-green-300 ring-1 ring-green-200' : 'border-gray-200'
              }`}
            >
              {/* Card Header */}
              <div className="px-5 pt-5 pb-3 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">{tpl.title}</h3>
                    {statusBadge(tpl.status)}
                  </div>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${tpl.detectedType === 'UNCLASSIFIED' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600 font-medium'}`}>
                      {tpl.detectedType}
                    </span>
                    {tpl.version && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{tpl.version}</span>
                    )}
                  </div>
                </div>
              </div>

              {tpl.description && (
                <p className="px-5 text-sm text-gray-500 line-clamp-2 mb-2">{tpl.description}</p>
              )}

              {/* Placeholders */}
              <div className="mx-5 mb-4 bg-slate-50 rounded-lg p-3 border border-slate-100 flex-grow">
                <div className="flex items-center gap-1.5 mb-2">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Detected Placeholders ({tpl.placeholders?.length ?? 0})
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                  {tpl.placeholders && tpl.placeholders.length > 0 ? (
                    tpl.placeholders.map((p) => (
                      <code
                        key={p}
                        className="text-[10px] bg-white border border-slate-200 text-blue-600 px-1.5 py-0.5 rounded font-mono"
                      >
                        {`{{${p}}}`}
                      </code>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 italic">No placeholders detected</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-2">
                <a
                  href={`http://localhost:5000/api/v1/certificate-templates/${tpl.id}/download`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium"
                >
                  <Download className="w-3 h-3" /> Download HTML
                </a>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDuplicate(tpl)}
                    className="text-xs px-2 py-1.5 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors inline-flex items-center gap-1"
                    title="Duplicate"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {tpl.status !== 'ACTIVE' ? (
                    <button
                      onClick={() => handleActivate(tpl.id)}
                      disabled={tpl.detectedType === 'UNCLASSIFIED'}
                      className="text-xs px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={tpl.detectedType === 'UNCLASSIFIED' ? "Cannot activate unclassified template" : ""}
                    >
                      Activate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleArchive(tpl.id)}
                      className="text-xs px-3 py-1.5 rounded-md bg-amber-100 text-amber-700 hover:bg-amber-200 font-medium transition-colors inline-flex items-center gap-1"
                    >
                      <Archive className="w-3 h-3" /> Archive
                    </button>
                  )}
                  {tpl.status !== 'ACTIVE' && (
                    <button
                      onClick={() => handleDelete(tpl.id)}
                      className="text-xs px-2 py-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b bg-gradient-to-r from-slate-50 to-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  {step === 1 ? 'Upload Certificate Template' : 'Review & Confirm'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {step === 1 ? 'Upload an HTML file for automatic detection' : 'Please review the detected metadata'}
                </p>
              </div>
              <button
                onClick={() => { setUploadModalOpen(false); resetForm(); }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors text-lg font-bold"
              >
                ×
              </button>
            </div>

            {step === 1 ? (
              <form onSubmit={handleAnalyze} className="p-6 space-y-4">
                {/* Title */}
                <div>
                  <label htmlFor="tpl-title" className="block text-sm font-medium text-gray-700 mb-1">
                    Template Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="tpl-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Standard Advisory Certificate"
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Version row */}
                <div>
                  <label htmlFor="tpl-version" className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                  <input
                    id="tpl-version"
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="v1.0"
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="tpl-desc" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    id="tpl-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HTML File <span className="text-red-500">*</span>
                  </label>
                  <label
                    htmlFor="tpl-file-upload"
                    className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-blue-50 hover:border-blue-400 transition-all"
                  >
                    <UploadCloud className={`w-8 h-8 mb-1 ${file ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${file ? 'text-green-600' : 'text-gray-600'}`}>
                      {file ? file.name : 'Click to select .html file'}
                    </span>
                    <span className="text-xs text-gray-400 mt-0.5">HTML only · Inline CSS recommended</span>
                    <input
                      id="tpl-file-upload"
                      type="file"
                      accept=".html"
                      className="sr-only"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      required
                    />
                  </label>
                </div>

                {/* Footer */}
                <div className="pt-2 flex justify-end gap-3 border-t">
                  <button
                    type="button"
                    onClick={() => { setUploadModalOpen(false); resetForm(); }}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={analyzing}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {analyzing ? 'Analyzing...' : 'Next: Preview'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 space-y-5">
                {/* Detected Type */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Detected Certificate Type</h4>
                  <div className={`px-4 py-3 rounded-lg border flex items-center justify-between ${detectedType === 'UNCLASSIFIED' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                    <span className="font-bold tracking-wide">{detectedType}</span>
                    {detectedType === 'UNCLASSIFIED' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                  </div>
                  {detectedType === 'UNCLASSIFIED' && (
                    <p className="text-xs text-red-600 mt-1.5">
                      The system could not automatically classify this template. Please fix your HTML file (add keywords to filename/title or specific placeholders) and try again.
                    </p>
                  )}
                </div>

                {/* Detected Placeholders */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Detected Placeholders ({detectedPlaceholders.length})</h4>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 min-h-[4rem] max-h-32 overflow-y-auto flex flex-wrap gap-2">
                    {detectedPlaceholders.length > 0 ? (
                      detectedPlaceholders.map(p => (
                        <code key={p} className="text-xs bg-white border border-slate-200 text-blue-700 px-2 py-1 rounded font-mono shadow-sm">
                          {`{{${p}}}`}
                        </code>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500 italic">No placeholders found in HTML.</span>
                    )}
                  </div>
                </div>

                {/* Warnings */}
                {warnings.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-orange-700 mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> Validation Warnings
                    </h4>
                    <ul className="list-disc pl-5 text-sm text-orange-600 space-y-1 bg-orange-50 p-3 rounded-lg border border-orange-100">
                      {warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Footer */}
                <div className="pt-4 flex justify-between gap-3 border-t">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 font-medium transition-colors"
                  >
                    Back to Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {uploading ? 'Saving...' : 'Save Template'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

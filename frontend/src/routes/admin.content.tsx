import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Download,
  CheckCircle,
  XCircle,
  File,
  UploadCloud,
  Newspaper,
} from "lucide-react";
import { PageHeader, EmptyState } from "../components/reusable-components";
import { Button } from "../components/ui/button";
import { axiosInstance } from "../services/api/axios";

export const Route = createFileRoute("/admin/content")({
  component: ContentManagement,
});

function Layers(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 12 12 17 22 12" />
      <polyline points="2 17 12 22 22 17" />
    </svg>
  );
}

function ContentManagement() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);
  const [search, setSearch] = useState("");

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/resources");
      if (res.data.success) {
        setResources(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching resources:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await axiosInstance.delete(`/resources/${id}`);
      fetchResources();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleStatusToggle = async (resource: any) => {
    const newStatus = resource.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const formData = new FormData();
      formData.append("status", newStatus);
      // Include required fields for update
      formData.append("title", resource.title);
      formData.append("category", resource.category);
      await axiosInstance.put(`/resources/${resource.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchResources();
    } catch (err) {
      console.error("Status toggle error:", err);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const res = await axiosInstance.get(`/resources/download/${id}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "document");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      fetchResources(); // refresh download count
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  const filtered = resources.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: resources.length,
    published: resources.filter((r) => r.status === "PUBLISHED").length,
    draft: resources.filter((r) => r.status === "DRAFT").length,
    categories: new Set(resources.map((r) => r.category)).size,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Content Management"
        description="Manage manuals, policies, procedures, templates, and guidance documents."
        action={
          <Button
            className="bg-[#0F2942] hover:bg-[#1a446c] text-white"
            onClick={() => {
              setEditingResource(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Document
          </Button>
        }
      />

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Documents", value: stats.total, icon: FileText, color: "text-blue-600" },
          { label: "Published", value: stats.published, icon: CheckCircle, color: "text-green-600" },
          { label: "Drafts", value: stats.draft, icon: File, color: "text-amber-600" },
          { label: "Categories", value: stats.categories, icon: Layers, color: "text-purple-600" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white p-5 rounded-xl border border-gray-200 flex items-center gap-4"
          >
            <div className={`p-3 rounded-lg bg-gray-50 ${s.color}`}>
              <s.icon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0F2942]"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading documents...</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No Documents Found"
            description="Upload your first document to get started."
            icon={<Newspaper className="h-10 w-10" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-semibold">Document</th>
                  <th className="px-6 py-3 font-semibold">Category</th>
                  <th className="px-6 py-3 font-semibold">Version</th>
                  <th className="px-6 py-3 font-semibold">Type / Size</th>
                  <th className="px-6 py-3 font-semibold">Downloads</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Published</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 max-w-[200px]">
                      <div className="truncate">{doc.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">{doc.version || "-"}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{doc.filetype}</div>
                      <div className="text-xs text-gray-500">
                        {(doc.filesize / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </td>
                    <td className="px-6 py-4">{doc.downloads}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          doc.status === "PUBLISHED"
                            ? "bg-green-50 text-green-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {doc.publishedAt
                        ? new Date(doc.publishedAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleStatusToggle(doc)}
                          title={doc.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                          className="p-1.5 text-gray-400 hover:text-blue-600"
                        >
                          {doc.status === "PUBLISHED" ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDownload(doc.id)}
                          title="Download"
                          className="p-1.5 text-gray-400 hover:text-blue-600"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingResource(doc);
                            setIsModalOpen(true);
                          }}
                          title="Edit"
                          className="p-1.5 text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          title="Delete"
                          className="p-1.5 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <DocumentModal
          resource={editingResource}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchResources();
          }}
        />
      )}
    </div>
  );
}

function DocumentModal({
  resource,
  onClose,
  onSuccess,
}: {
  resource: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    title: resource?.title || "",
    description: resource?.description || "",
    category: resource?.category || "Manuals",
    version: resource?.version || "",
    language: resource?.language || "English",
    status: resource?.status || "DRAFT",
    displayOrder: resource?.displayOrder || 0,
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    "Manuals",
    "Policies",
    "Procedures",
    "Guidance",
    "Templates",
    "Forms",
    "Other",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) =>
      data.append(key, String(value))
    );
    if (file) data.append("file", file);

    try {
      if (resource) {
        await axiosInstance.put(`/resources/${resource.id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axiosInstance.post("/resources", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      onSuccess();
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err.response?.data?.message || "Error saving document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {resource ? "Edit Document" : "Upload Document"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0F2942]"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0F2942]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Version
              </label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) =>
                  setFormData({ ...formData, version: e.target.value })
                }
                placeholder="e.g. v2.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <input
                type="text"
                value={formData.language}
                onChange={(e) =>
                  setFormData({ ...formData, language: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File {resource ? "(Leave empty to keep existing)" : "*"}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition cursor-pointer">
                <input
                  type="file"
                  required={!resource}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.docx,.zip,.xlsx"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    {file ? file.name : "Click to upload"}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    Accepts PDF, DOCX, ZIP, XLSX
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#0F2942] hover:bg-[#1a446c] text-white"
            >
              {loading ? "Saving..." : "Save Document"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

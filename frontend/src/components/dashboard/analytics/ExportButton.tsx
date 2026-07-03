import React, { useState } from 'react'
import { Download, FileText, File } from 'lucide-react'
import { analyticsApi } from '../../../services/api/analytics.api'
import type { AnalyticsQueryParams } from '../../../types/analytics'

export default function ExportButton({ params }: { params?: AnalyticsQueryParams }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const downloadFile = async (format: 'csv' | 'excel' | 'pdf') => {
    setLoading(true)
    try {
      const response = await analyticsApi.exportReport(format, params)
      const blob = new Blob([response.data], { type: (response.headers['content-type'] as string | undefined) ?? 'application/octet-stream' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `analytics-report.${format === 'excel' ? 'xlsx' : format}`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed', err)
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="inline-flex items-center px-3 py-2 bg-white border rounded-md shadow-sm hover:bg-blue-50 transition focus:outline-none focus:ring-2 focus:ring-blue-200"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Download className="mr-2" /> Export
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-lg z-10 py-1">
          <button
            type="button"
            disabled={loading}
            onClick={() => downloadFile('csv')}
            className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center space-x-2"
          >
            <FileText /> <span>CSV</span>
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => downloadFile('excel')}
            className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center space-x-2"
          >
            <FileText /> <span>Excel</span>
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => downloadFile('pdf')}
            className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center space-x-2"
          >
            <File /> <span>PDF</span>
          </button>
        </div>
      )}
    </div>
  )
}

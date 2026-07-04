import React, { useState, useRef, useEffect } from 'react'
import { Download, FileText, FileImage, ChevronDown, Loader2 } from 'lucide-react'

interface ExportButtonsProps {
  onExportCSV: () => void
  onExportPDF: () => void
  loading?: boolean
}

export default function ExportButtons({ onExportCSV, onExportPDF, loading }: ExportButtonsProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCSV = () => {
    setOpen(false)
    onExportCSV()
  }

  const handlePDF = () => {
    setOpen(false)
    onExportPDF()
  }

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition disabled:opacity-50 shadow-sm"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Export options"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
        ) : (
          <Download className="h-4 w-4 text-slate-500" />
        )}
        Export
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border border-slate-200 bg-white shadow-lg z-50 overflow-hidden"
          role="menu"
        >
          <button
            type="button"
            onClick={handleCSV}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-green-50 hover:text-green-700 transition"
            role="menuitem"
          >
            <FileText className="h-4 w-4 text-green-600 shrink-0" />
            <span>Export CSV</span>
          </button>
          <div className="mx-3 border-t border-slate-100" />
          <button
            type="button"
            onClick={handlePDF}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-red-50 hover:text-red-600 transition"
            role="menuitem"
          >
            <FileImage className="h-4 w-4 text-red-500 shrink-0" />
            <span>Export PDF</span>
          </button>
        </div>
      )}
    </div>
  )
}

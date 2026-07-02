import React, { useState } from 'react'
import { Download, FileText, File } from 'lucide-react'

export default function ExportButton() {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen((s) => !s)}
        className="inline-flex items-center px-3 py-2 bg-white border rounded-md shadow-sm hover:bg-blue-50 transition focus:outline-none focus:ring-2 focus:ring-blue-200"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Download className="mr-2" /> Export
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-10 py-1">
          <button className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center space-x-2">
            <FileText /> <span>Export CSV</span>
          </button>
          <button className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center space-x-2">
            <File /> <span>Export PDF</span>
          </button>
        </div>
      )}
    </div>
  )
}

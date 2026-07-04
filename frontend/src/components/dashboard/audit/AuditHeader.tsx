import React from 'react'
import { History } from 'lucide-react'

export default function AuditHeader() {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1E3A5F] text-white shrink-0 mt-1">
        <History className="h-5 w-5" />
      </div>
      <div>
        <div className="text-sm text-slate-500 mb-0.5">
          <span className="text-[#1E3A5F] font-medium">Audit Log</span>
          <span className="mx-1.5 text-slate-300">/</span>
          <span>All Actions</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#1E3A5F]">Audit Log</h1>
        <p className="text-sm text-slate-500 mt-0.5">Complete record of all administrative actions</p>
      </div>
    </div>
  )
}

import React from 'react'
import { Search } from 'lucide-react'

export default function EmptyState({ message = 'No Audit Logs Found' }: { message?: string }) {
  return (
    <tr>
      <td colSpan={7} className="py-16 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center">
            <Search className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-600">{message}</p>
          <p className="text-xs text-slate-400">Try adjusting your filters to find what you're looking for.</p>
        </div>
      </td>
    </tr>
  )
}

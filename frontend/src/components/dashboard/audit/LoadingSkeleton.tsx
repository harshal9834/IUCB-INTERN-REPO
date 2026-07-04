import React from 'react'

export default function LoadingSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-t border-slate-100">
          {Array.from({ length: 7 }).map((__, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 bg-slate-100 rounded animate-pulse" style={{ width: j === 4 ? '80%' : '60%' }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

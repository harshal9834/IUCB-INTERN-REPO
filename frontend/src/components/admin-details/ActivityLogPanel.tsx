import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Activity } from "lucide-react";

interface ActivityLogPanelProps {
  logs: any[];
}

export function ActivityLogPanel({ logs }: ActivityLogPanelProps) {
  return (
    <Card>
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
        <CardTitle className="text-lg text-[#0F2942] flex items-center gap-2">
          <Activity className="w-5 h-5 text-slate-400" /> Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 whitespace-nowrap">Date</th>
                <th className="px-6 py-3 whitespace-nowrap">Action</th>
                <th className="px-6 py-3 whitespace-nowrap">Performed By</th>
                <th className="px-6 py-3 whitespace-nowrap w-full">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {logs && logs.length > 0 ? (
                logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md font-medium text-xs border ${
                        log.action.includes('CREATE') || log.action.includes('ACTIVE') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        log.action.includes('UPDATE') ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        log.action.includes('DELETE') || log.action.includes('INACTIVE') ? 'bg-red-50 text-red-700 border-red-100' :
                        log.action.includes('SUSPEND') ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-slate-50 text-slate-700 border-slate-100'
                      }`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-900 font-medium">
                      {log.admin?.fullName || 'System'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {log.newData?.reason || 'Automated action'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No activity logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

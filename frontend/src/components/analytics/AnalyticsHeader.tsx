import { FileSpreadsheet, RefreshCw } from "lucide-react";

interface AnalyticsHeaderProps {
  onRefresh: () => void;
  onExport: () => void;
  isExporting: boolean;
}

export function AnalyticsHeader({ onRefresh, onExport, isExporting }: AnalyticsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-5 rounded-xl shadow-sm border">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Enterprise Analytics</h1>
        <p className="text-muted-foreground mt-1 text-sm">Comprehensive platform metrics and trends.</p>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="text-sm text-muted-foreground hidden sm:block mr-2">
          Last Updated: {new Date().toLocaleTimeString()}
        </div>
        <button 
          onClick={onRefresh} 
          className="flex items-center space-x-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors shadow-sm text-sm"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="font-medium">Refresh</span>
        </button>
        
        <button 
          onClick={onExport} 
          disabled={isExporting}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-green-600/50 transition-colors shadow-sm text-sm"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span className="font-medium">{isExporting ? "Exporting..." : "Export Excel"}</span>
        </button>
      </div>
    </div>
  );
}

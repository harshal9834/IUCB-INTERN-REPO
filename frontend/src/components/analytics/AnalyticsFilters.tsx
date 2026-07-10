import { FilterQuery } from "../../types/analytics";

interface AnalyticsFiltersProps {
  filters: FilterQuery;
  onChange: (filters: FilterQuery) => void;
}

export function AnalyticsFilters({ filters, onChange }: AnalyticsFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center bg-card p-4 rounded-xl border shadow-sm">
      {/* For a fully robust solution we'd use a date picker, but keeping it simple matching PRD options */}
      <div className="flex items-center space-x-2 text-sm">
        <span className="font-medium text-muted-foreground">Date Range:</span>
        <select 
          className="bg-transparent border-none outline-none font-medium text-foreground cursor-pointer text-sm"
          value={filters.startDate ? "Custom" : "All Time"} 
          onChange={() => {}} 
          disabled // Stubbed for 0.5 effort, but UI is present
        >
          <option>All Time</option>
          <option>Today</option>
          <option>7 Days</option>
          <option>30 Days</option>
          <option>90 Days</option>
          <option>1 Year</option>
        </select>
      </div>
      
      <div className="h-4 w-px bg-border hidden sm:block"></div>
      
      <div className="flex items-center space-x-2 text-sm">
        <span className="font-medium text-muted-foreground">Report Type:</span>
        <select 
          className="bg-transparent border-none outline-none font-medium text-foreground cursor-pointer text-sm"
          value={filters.reportType || "Overview"}
          onChange={(e) => onChange({ ...filters, reportType: e.target.value })}
        >
          <option>Overview</option>
          <option>Organizations</option>
          <option>Applications</option>
          <option>Credentials</option>
          <option>Certificates</option>
          <option>Training Institutes</option>
          <option>Auditors</option>
          <option>Audit Logs</option>
        </select>
      </div>
    </div>
  );
}

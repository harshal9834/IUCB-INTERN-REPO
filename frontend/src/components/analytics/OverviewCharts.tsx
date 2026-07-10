import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import { ChartDataResponse } from "../../types/analytics";

interface ChartsProps {
  data: ChartDataResponse;
}

export function OverviewCharts({ data }: ChartsProps) {
  if (!data) return <div className="text-center p-8">No Data Available</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      
      {/* Applications Trend */}
      <div className="bg-card p-5 rounded-xl border shadow-sm h-[350px]">
        <h3 className="text-sm font-bold mb-4">Monthly Applications</h3>
        {data.monthlyApplications.length > 0 ? (
          <ResponsiveLine
            data={[{ id: "applications", data: data.monthlyApplications }]}
            margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
            xScale={{ type: 'point' }}
            yScale={{ type: 'linear', min: 0, max: 'auto' }}
            axisBottom={{ tickRotation: -45 }}
            colors={{ scheme: 'category10' }}
            pointSize={8}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            useMesh={true}
          />
        ) : <div className="h-full flex items-center justify-center text-muted-foreground">No Data Available</div>}
      </div>

      {/* Organization Status */}
      <div className="bg-card p-5 rounded-xl border shadow-sm h-[350px]">
        <h3 className="text-sm font-bold mb-4">Organization Status</h3>
        {data.organizationStatus.length > 0 ? (
          <ResponsivePie
            data={data.organizationStatus}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            colors={{ scheme: 'nivo' }}
            borderWidth={1}
            borderColor={{ from: 'color', modifiers: [ [ 'darker', 0.2 ] ] }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor="#ffffff"
          />
        ) : <div className="h-full flex items-center justify-center text-muted-foreground">No Data Available</div>}
      </div>

      {/* Country Distribution */}
      <div className="bg-card p-5 rounded-xl border shadow-sm h-[350px]">
        <h3 className="text-sm font-bold mb-4">Country Distribution</h3>
        {data.countryDistribution.length > 0 ? (
          <ResponsiveBar
            data={data.countryDistribution}
            keys={['value']}
            indexBy="id"
            margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
            padding={0.3}
            colors={{ scheme: 'set2' }}
            axisBottom={{ tickRotation: -45 }}
            labelSkipWidth={12}
            labelSkipHeight={12}
          />
        ) : <div className="h-full flex items-center justify-center text-muted-foreground">No Data Available</div>}
      </div>
      
      {/* Auditor Tiers */}
      <div className="bg-card p-5 rounded-xl border shadow-sm h-[350px]">
        <h3 className="text-sm font-bold mb-4">Auditor Distribution</h3>
        {data.auditorDistribution.length > 0 ? (
          <ResponsiveBar
            data={data.auditorDistribution}
            keys={['value']}
            indexBy="id"
            margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
            padding={0.3}
            layout="horizontal"
            colors={{ scheme: 'paired' }}
            axisLeft={{ tickSize: 5, tickPadding: 5, tickRotation: 0 }}
          />
        ) : <div className="h-full flex items-center justify-center text-muted-foreground">No Data Available</div>}
      </div>

    </div>
  );
}

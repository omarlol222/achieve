
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { ResponsiveRadar } from "@nivo/radar";
import { format, subDays } from "date-fns";

type StatsSectionProps = {
  statistics: any[];
};

export function StatsSection({ statistics }: StatsSectionProps) {
  const radarData = useMemo(() => {
    if (!statistics || !Array.isArray(statistics)) return [];
    
    const tenDaysAgo = subDays(new Date(), 10);
    
    return statistics
      .filter(stat => {
        const lastPracticed = new Date(stat.last_practiced);
        return stat?.subtopic?.name && lastPracticed >= tenDaysAgo;
      })
      .map(stat => ({
        subtopic: stat.subtopic.name,
        accuracy: (stat.accuracy || 0) * 100,
      }));
  }, [statistics]);

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Topic Performance (Last 10 Days)</h2>
      <div className="h-[400px]">
        {radarData.length > 0 ? (
          <ResponsiveRadar
            data={radarData}
            keys={["accuracy"]}
            indexBy="subtopic"
            maxValue={100}
            margin={{ top: 70, right: 80, bottom: 40, left: 80 }}
            borderWidth={2}
            gridLabelOffset={36}
            dotSize={10}
            dotColor={{ theme: "background" }}
            dotBorderWidth={2}
            colors={{ scheme: "nivo" }}
            blendMode="multiply"
            motionConfig="wobbly"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No performance data available for the last 10 days
          </div>
        )}
      </div>
    </Card>
  );
}

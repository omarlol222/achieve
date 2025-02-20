
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { ResponsiveRadar } from "@nivo/radar";
import { format, subDays } from "date-fns";

type StatsSectionProps = {
  statistics: any[];
};

export function StatsSection({ statistics }: StatsSectionProps) {
  const { mathData, englishData } = useMemo(() => {
    if (!statistics || !Array.isArray(statistics)) return { mathData: [], englishData: [] };
    
    const tenDaysAgo = subDays(new Date(), 10);
    
    const filteredStats = statistics
      .filter(stat => {
        // Filter for stats within last 10 days based on last_practiced
        const lastPracticed = new Date(stat.last_practiced);
        return stat?.subtopic?.name && 
               lastPracticed >= tenDaysAgo &&
               stat?.subtopic?.topic?.subject?.name;
      });

    return {
      mathData: filteredStats
        .filter(stat => stat.subtopic.topic.subject.name === 'Math')
        .map(stat => ({
          subtopic: stat.subtopic.name,
          accuracy: (stat.accuracy || 0) * 100,
        })),
      englishData: filteredStats
        .filter(stat => stat.subtopic.topic.subject.name === 'English')
        .map(stat => ({
          subtopic: stat.subtopic.name,
          accuracy: (stat.accuracy || 0) * 100,
        }))
    };
  }, [statistics]);

  const renderRadarChart = (data: any[], title: string) => {
    if (data.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          No performance data available for {title} in the last 10 days
        </div>
      );
    }

    return (
      <ResponsiveRadar
        data={data}
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
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Math Performance (Last 10 Days)</h2>
        <div className="h-[400px]">
          {renderRadarChart(mathData, 'Math')}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">English Performance (Last 10 Days)</h2>
        <div className="h-[400px]">
          {renderRadarChart(englishData, 'English')}
        </div>
      </Card>
    </div>
  );
}


import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { ResponsiveRadar } from "@nivo/radar";
import { format, subDays } from "date-fns";

type StatsSectionProps = {
  statistics: any[];
};

export function StatsSection({ statistics }: StatsSectionProps) {
  const topicData = useMemo(() => {
    if (!statistics || !Array.isArray(statistics)) return [];
    
    const tenDaysAgo = subDays(new Date(), 10);
    
    const filteredStats = statistics
      .filter(stat => {
        // Filter for stats within last 10 days based on last_practiced
        const lastPracticed = new Date(stat.last_practiced);
        return stat?.subtopic?.name && 
               lastPracticed >= tenDaysAgo &&
               stat?.subtopic?.topic?.subject?.name;
      });

    console.log("Filtered statistics:", filteredStats);

    // Combine all topics into a single dataset
    const data = filteredStats.map(stat => ({
      subtopic: `${stat.subtopic.name} (${stat.subtopic.topic.subject.name})`,
      accuracy: (stat.accuracy || 0) * 100,
    }));

    console.log("Combined topic data:", data);
    return data;
  }, [statistics]);

  const renderRadarChart = (data: any[]) => {
    if (!data || data.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          No performance data available for the last 10 days. Try practicing some questions!
        </div>
      );
    }

    return (
      <ResponsiveRadar
        data={data}
        keys={["accuracy"]}
        indexBy="subtopic"
        maxValue={100}
        margin={{ top: 70, right: 120, bottom: 40, left: 120 }}
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
        <h2 className="text-lg font-semibold mb-4">Topic Mastery (Last 10 Days)</h2>
        <div className="h-[500px]">
          {renderRadarChart(topicData)}
        </div>
      </Card>
    </div>
  );
}

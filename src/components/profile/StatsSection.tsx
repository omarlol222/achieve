
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { ResponsiveRadar } from "@nivo/radar";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveLine } from "@nivo/line";

type StatsSectionProps = {
  statistics: any[];
};

export function StatsSection({ statistics }: StatsSectionProps) {
  const radarData = useMemo(() => {
    if (!statistics) return [];
    
    return statistics.map(stat => ({
      subtopic: stat.subtopic.name,
      accuracy: stat.accuracy * 100,
    }));
  }, [statistics]);

  const difficultyData = useMemo(() => {
    if (!statistics) return [];
    
    const counts = statistics.reduce((acc, stat) => {
      acc[stat.difficulty_level] = (acc[stat.difficulty_level] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([key, value]) => ({
      id: key,
      label: key,
      value: value as number,
    }));
  }, [statistics]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Topic Performance</h2>
        <div className="h-[400px]">
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
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Difficulty Distribution</h2>
        <div className="h-[400px]">
          <ResponsivePie
            data={difficultyData}
            margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            colors={{ scheme: "nivo" }}
            borderWidth={1}
            borderColor={{ theme: "background" }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#333333"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: "color" }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor="#ffffff"
          />
        </div>
      </Card>
    </div>
  );
}


import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { ResponsiveRadar } from "@nivo/radar";
import { format, subDays } from "date-fns";

type StatsSectionProps = {
  statistics: any[];
};

export function StatsSection({ statistics }: StatsSectionProps) {
  const { mathData, englishData } = useMemo(() => {
    if (!statistics || !Array.isArray(statistics)) {
      return { mathData: [], englishData: [] };
    }
    
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

    // Separate data by subject
    const mathStats = filteredStats.filter(stat => 
      stat.subtopic?.topic?.subject?.name.toLowerCase().includes('math')
    );

    const englishStats = filteredStats.filter(stat => 
      stat.subtopic?.topic?.subject?.name.toLowerCase().includes('english')
    );

    // Format data for each subject
    const mathData = mathStats.map(stat => ({
      subtopic: stat.subtopic.name,
      accuracy: (stat.accuracy || 0) * 100,
    }));

    const englishData = englishStats.map(stat => ({
      subtopic: stat.subtopic.name,
      accuracy: (stat.accuracy || 0) * 100,
    }));

    console.log("Math data:", mathData);
    console.log("English data:", englishData);

    return { mathData, englishData };
  }, [statistics]);

  const renderRadarChart = (data: any[], title: string) => {
    if (!data || data.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          No performance data available for {title} in the last 10 days. Try practicing some questions!
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Math Mastery (Last 10 Days)</h2>
        <div className="h-[400px]">
          {renderRadarChart(mathData, "Math")}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">English Mastery (Last 10 Days)</h2>
        <div className="h-[400px]">
          {renderRadarChart(englishData, "English")}
        </div>
      </Card>
    </div>
  );
}

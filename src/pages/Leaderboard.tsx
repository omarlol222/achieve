
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { useLeaderboard } from "@/hooks/useLeaderboard";

export default function Leaderboard() {
  const {
    overallLeaderboard,
    weeklyLeaderboard,
    currentUser,
    isLoadingOverall,
    isLoadingWeekly,
  } = useLeaderboard();

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">Leaderboard</h1>

      <Tabs defaultValue="overall" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overall">Overall</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
        </TabsList>

        <TabsContent value="overall">
          <Card className="p-6">
            <LeaderboardTable 
              data={overallLeaderboard} 
              isLoading={isLoadingOverall}
              type="overall"
            />
          </Card>
          {currentUser?.overall && currentUser.overall.rank > 10 && (
            <Card className="mt-4 p-6">
              <h2 className="mb-4 text-lg font-semibold">Your Rank</h2>
              <LeaderboardTable 
                data={[currentUser.overall]} 
                isLoading={false}
                type="overall"
              />
            </Card>
          )}
        </TabsContent>

        <TabsContent value="weekly">
          <Card className="p-6">
            <LeaderboardTable 
              data={weeklyLeaderboard} 
              isLoading={isLoadingWeekly}
              type="weekly"
            />
          </Card>
          {currentUser?.weekly && currentUser.weekly.rank > 10 && (
            <Card className="mt-4 p-6">
              <h2 className="mb-4 text-lg font-semibold">Your Rank</h2>
              <LeaderboardTable 
                data={[currentUser.weekly]} 
                isLoading={false}
                type="weekly"
              />
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { Link } from "react-router-dom";
import { useLeaderboard } from "@/hooks/useLeaderboard";

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<'overall' | 'weekly'>('overall');
  const { overallLeaderboard, weeklyLeaderboard, currentUser, isLoadingOverall, isLoadingWeekly } = useLeaderboard();

  return (
    <div className="min-h-screen bg-white">
      <div className="container py-8">
        <Button 
          variant="ghost" 
          asChild
          className="mb-6"
        >
          <Link to="/gat">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Leaderboard</h1>
          
          <Card className="p-6">
            <div className="flex gap-4 mb-6">
              <Button
                variant={activeTab === 'overall' ? 'default' : 'outline'}
                onClick={() => setActiveTab('overall')}
              >
                Overall
              </Button>
              <Button
                variant={activeTab === 'weekly' ? 'default' : 'outline'}
                onClick={() => setActiveTab('weekly')}
              >
                Weekly
              </Button>
            </div>

            {/* Current User Stats */}
            {currentUser && (
              <div className="mb-8 p-4 bg-primary/5 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Your Position</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Overall Rank</p>
                    <p className="text-xl font-bold">
                      {currentUser.overall?.rank || 'Not ranked'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Weekly Rank</p>
                    <p className="text-xl font-bold">
                      {currentUser.weekly?.rank || 'Not ranked'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Leaderboard Table */}
            <div className="bg-white rounded-lg overflow-hidden">
              {activeTab === 'overall' ? (
                <LeaderboardTable 
                  data={overallLeaderboard} 
                  isLoading={isLoadingOverall}
                  type="overall"
                />
              ) : (
                <LeaderboardTable 
                  data={weeklyLeaderboard} 
                  isLoading={isLoadingWeekly}
                  type="weekly"
                />
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

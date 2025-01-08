import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type UserProgress = {
  user: {
    full_name: string | null;
  };
  topic: {
    name: string;
    subject: {
      name: string;
    };
  };
  questions_attempted: number;
  questions_correct: number;
};

type UserProgressCardProps = {
  userProgress: UserProgress[] | undefined;
  isLoading: boolean;
};

export const UserProgressCard = ({ userProgress, isLoading }: UserProgressCardProps) => (
  <Card className="mt-8 p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">User Progress</h2>
    {isLoading ? (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded" />
        ))}
      </div>
    ) : (
      <div className="space-y-6">
        {userProgress?.map((progress, idx) => {
          // Only calculate percentage if there are attempted questions
          const percentage = progress.questions_attempted > 0
            ? Math.round((progress.questions_correct / progress.questions_attempted) * 100)
            : 0;

          return (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{progress.user.full_name}</p>
                  <p className="text-sm text-gray-600">
                    {progress.topic.subject.name} - {progress.topic.name}
                  </p>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  <span className="mr-2">
                    {progress.questions_correct} / {progress.questions_attempted} correct
                  </span>
                  {percentage}%
                </div>
              </div>
              <Progress
                value={percentage}
                className="h-2"
              />
            </div>
          );
        })}
      </div>
    )}
  </Card>
);
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QuestionContent } from "@/components/practice/QuestionContent";
import { Progress } from "@/components/ui/progress";
import { TestHeader } from "@/components/simulator/test/TestHeader";
import { TestNavigation } from "@/components/simulator/test/TestNavigation";
import { useTestSession } from "@/components/simulator/test/useTestSession";

export default function SimulatorTest() {
  const {
    questions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    answers,
    flagged,
    timeLeft,
    loading,
    error,
    handleAnswer,
    handleModuleComplete,
    toggleFlag,
    currentModuleIndex,
  } = useTestSession();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = (currentQuestionIndex / questions.length) * 100;

  return (
    <div className="min-h-screen bg-white">
      <div className="container py-8">
        <div className="space-y-6 max-w-6xl mx-auto">
          <TestHeader
            moduleName={currentModuleIndex === 0 ? "Verbal" : "Quantitative"}
            timeLeft={timeLeft}
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
            answers={answers}
            flagged={flagged}
            onQuestionSelect={setCurrentQuestionIndex}
          />

          <Progress value={progress} className="h-2" />

          <Card className="p-6">
            {currentQuestion && (
              <QuestionContent
                question={currentQuestion}
                selectedAnswer={answers[currentQuestionIndex] || null}
                showFeedback={false}
                onAnswerSelect={handleAnswer}
              />
            )}
          </Card>

          <TestNavigation
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            flagged={flagged}
            onPrevious={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            onNext={() => setCurrentQuestionIndex(prev => prev + 1)}
            onFlag={toggleFlag}
            onComplete={handleModuleComplete}
          />
        </div>
      </div>
    </div>
  );
}